import { async, ComponentFixture, TestBed, getTestBed } from '@angular/core/testing';

import { LocationResultDataSheetComponent } from './location-result-data-sheet.component';
import * as swagger from '../../../../blueprints/swagger.json';
import { MAT_BOTTOM_SHEET_DATA, MatGridListModule } from '@angular/material';
import { LocationResult, Measurement } from 'src/app/model';
import { Component, Input, PipeTransform, Pipe } from '@angular/core';
import { By } from '@angular/platform-browser';
import * as moment from 'moment';
import { PruneNonLatestMeasurementsPipe } from 'src/app/pipes/prune-non-latest-measurements.pipe';
import { PruneRepeatedMeasurementsPipe } from 'src/app/pipes/prune-repeated-measurements.pipe';
import { cloneDeep } from 'lodash';
import { HumanizeDatePipe } from 'src/app/pipes/humanize-date.pipe';

@Component({
  selector: 'app-single-result-chart',
  template: '',
}) class MockSingleResultChartComponent {
  @Input()
  measurements: Measurement[];
}

@Pipe({ name: 'calculateAqi', })
export class MockCalculateAqiPipe implements PipeTransform {
  transform(value: Measurement[], aqiIndexName: string) {
    return 'Mock AQI pipe result using ' + aqiIndexName;
  }
}

describe('LocationResultDataSheetComponent', () => {
  let component: LocationResultDataSheetComponent;
  let fixture: ComponentFixture<LocationResultDataSheetComponent>;
  let locationResult: LocationResult;

  const createSheetWithData = (overridenLocationResult: LocationResult) => {
    TestBed.overrideProvider(MAT_BOTTOM_SHEET_DATA, { useValue: overridenLocationResult });

    fixture = TestBed.createComponent(LocationResultDataSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  beforeEach(async(() => {
    locationResult = cloneDeep(swagger.paths['/latest'].get.responses[200].examples['application/json'].results[0]);

    TestBed.configureTestingModule({
      declarations: [
        LocationResultDataSheetComponent,
        MockSingleResultChartComponent,
        PruneNonLatestMeasurementsPipe,
        PruneRepeatedMeasurementsPipe,
        HumanizeDatePipe,
        MockCalculateAqiPipe,
      ],
      imports: [MatGridListModule],
      providers: [
        { provide: MAT_BOTTOM_SHEET_DATA, useValue: locationResult },
      ],
    })
    .compileComponents();
  }));

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
    const nowString = moment().subtract(1, 'hour').toISOString();
    locationResult.measurements.forEach(measurement => measurement.lastUpdated = nowString);

    createSheetWithData(locationResult);

    const dataSheetHeader = fixture.nativeElement.querySelector('h4');
    expect(dataSheetHeader.textContent).toBe(`Latest measurement: an hour ago`);
  });

  it('should push measurements to the single result chart', () => {
    createSheetWithData(locationResult);

    const mockChart: MockSingleResultChartComponent =
      fixture.debugElement.query(By.directive(MockSingleResultChartComponent)).componentInstance;
    const { measurements } = locationResult;

    expect(mockChart.measurements).toEqual(measurements);
  });

  it('should only push the latest, unique measurements ot the single result chart', () => {
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

    const aqiElementText = fixture.nativeElement.querySelector('mat-grid-tile:nth-child(3) h1').textContent;

    expect(aqiElementText).toEqual('Mock AQI pipe result using EAQI');
  });
});
