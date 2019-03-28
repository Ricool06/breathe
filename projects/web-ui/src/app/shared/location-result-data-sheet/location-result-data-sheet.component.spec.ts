import { async, ComponentFixture, TestBed, getTestBed, fakeAsync } from '@angular/core/testing';

import { LocationResultDataSheetComponent } from './location-result-data-sheet.component';
import * as swagger from '../../../../blueprints/swagger.json';
import * as fromRoot from '../../reducers';
import { MAT_BOTTOM_SHEET_DATA, MatGridListModule } from '@angular/material';
import { LatestResult, Measurement, MeasurementsResult } from 'src/app/model';
import { Component, Input, PipeTransform, Pipe } from '@angular/core';
import { By } from '@angular/platform-browser';
import * as moment from 'moment';
import { PruneNonLatestMeasurementsPipe } from 'src/app/pipes/prune-non-latest-measurements.pipe';
import { PruneRepeatedMeasurementsPipe } from 'src/app/pipes/prune-repeated-measurements.pipe';
import { cloneDeep } from 'lodash';
import { StoreModule, Store } from '@ngrx/store';
import { LoadHistoricalMeasurementsSuccess, LoadHistoricalMeasurements } from 'src/app/actions/historical-measurement.actions';
import { LatLng } from 'leaflet';

@Component({
  selector: 'app-single-result-chart',
  template: '',
}) class MockSingleResultChartComponent {
  @Input()
  measurements: Measurement[];
}

@Component({
  selector: 'app-historical-results-chart',
  template: '',
}) class MockHistoricalResultsChartComponent {
  @Input()
  measurementsResults: MeasurementsResult[];
}

@Pipe({ name: 'calculateAqi', })
class MockCalculateAqiPipe implements PipeTransform {
  transform(value: Measurement[], aqiIndexName: string) {
    return 'Mock AQI pipe result using ' + aqiIndexName;
  }
}

@Pipe({ name: 'humanizeDate' })
class MockHumanizeDatePipe implements PipeTransform {
  transform(value: moment.Moment | string) {
    return 'an hour ago';
  }
}

describe('LocationResultDataSheetComponent', () => {
  let component: LocationResultDataSheetComponent;
  let fixture: ComponentFixture<LocationResultDataSheetComponent>;
  let locationResult: LatestResult;
  let store: Store<fromRoot.State>;

  const createSheetWithData = (overridenLocationResult: LatestResult) => {
    TestBed.overrideProvider(MAT_BOTTOM_SHEET_DATA, { useValue: overridenLocationResult });

    fixture = TestBed.createComponent(LocationResultDataSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  beforeEach(async(() => {
    locationResult =
      cloneDeep(swagger.paths['/latest'].get.responses[200].examples['application/json'].results[0]);

    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({ ...fromRoot.reducers, }),
        MatGridListModule,
      ],
      declarations: [
        LocationResultDataSheetComponent,
        MockSingleResultChartComponent,
        MockHistoricalResultsChartComponent,
        PruneNonLatestMeasurementsPipe,
        PruneRepeatedMeasurementsPipe,
        MockHumanizeDatePipe,
        MockCalculateAqiPipe,
      ],
      providers: [
        { provide: MAT_BOTTOM_SHEET_DATA, useValue: locationResult },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    store = TestBed.get(Store);
  });

  it('should create', () => {
    createSheetWithData(locationResult);

    expect(component).toBeTruthy();
  });

  it('should display city & country from a location result', () => {
    createSheetWithData(locationResult);

    const dataSheetHeader = fixture.nativeElement.querySelector('h1');
    const { city, country } = locationResult;
    expect(dataSheetHeader.textContent).toBe(`${city}, ${country}`);
  });

  it('should show humanized time from location result', () => {
    createSheetWithData(locationResult);

    const dataSheetHeader = fixture.nativeElement.querySelector('h4');
    expect(dataSheetHeader.textContent).toBe('Latest measurement: an hour ago');
  });

  it('should push measurements to the single result chart', () => {
    createSheetWithData(locationResult);

    const mockChart: MockSingleResultChartComponent =
      fixture.debugElement.query(By.directive(MockSingleResultChartComponent)).componentInstance;
    const { measurements } = locationResult;

    expect(mockChart.measurements).toEqual(measurements);
  });

  it('should only push the latest, unique measurements to the single result chart', () => {
    const measurements = cloneDeep(locationResult.measurements);
    const clonedMeasurement: Measurement = cloneDeep(measurements[0]);
    const oldMeasurement: Measurement = {
      ...clonedMeasurement,
      lastUpdated: moment(measurements[0].lastUpdated).subtract(1, 'hour').toISOString(),
    };

    const messyMeasurements = [...measurements, clonedMeasurement, oldMeasurement];
    const messyLocationResult = { ...locationResult, measurements: messyMeasurements };

    createSheetWithData(messyLocationResult);

    const mockChart: MockSingleResultChartComponent =
      fixture.debugElement.query(By.directive(MockSingleResultChartComponent)).componentInstance;

    expect(mockChart.measurements).toEqual(measurements);
  });

  it('should display an air quality index', () => {
    createSheetWithData(locationResult);

    const aqiElementText = fixture.nativeElement.querySelector('h1.mat-display-4').textContent;

    expect(aqiElementText).toEqual('Mock AQI pipe result using EAQI');
  });

  it('should push measurements to the historical result chart', () => {
    const results =
      cloneDeep(swagger.paths['/measurements'].get.responses[200].examples['application/json'].results);

    const action = new LoadHistoricalMeasurementsSuccess({ results });
    store.dispatch(action);

    createSheetWithData(locationResult);

    const mockChart: MockHistoricalResultsChartComponent =
      fixture.debugElement.query(By.directive(MockHistoricalResultsChartComponent)).componentInstance;

    expect(mockChart.measurementsResults).toEqual(results);
  });

  it('should dispatch an action to load historical measurements results on creation', (done) => {
    const { latitude, longitude } = locationResult.coordinates;
    const coordinates = new LatLng(latitude, longitude);
    const dateTo = moment();
    const dateFrom = dateTo.clone().subtract(7, 'days');

    jasmine.clock().mockDate(dateTo.toDate());
    spyOn(store, 'dispatch').and.callFake((action: LoadHistoricalMeasurements) => {
      expect(action.payload.coordinates).toEqual(coordinates);
      expect(action.payload.dateFrom.toISOString()).toEqual(dateFrom.toISOString());
      expect(action.payload.dateTo.toISOString()).toEqual(dateTo.toISOString());
      done();
    });

    createSheetWithData(locationResult);

    jasmine.clock().uninstall();
  });
});
