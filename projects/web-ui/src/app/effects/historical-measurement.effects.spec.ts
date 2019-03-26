import { TestBed, inject } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';

import { HistoricalMeasurementEffects } from './historical-measurement.effects';
import { HistoricalMeasurementsService } from '../services/historical-measurements.service';
import * as swagger from 'blueprints/swagger.json';
import { cloneDeep } from 'lodash';
import {
  LoadHistoricalMeasurements,
  LoadHistoricalMeasurementsSuccess,
  LoadHistoricalMeasurementsFailure
} from '../actions/historical-measurement.actions';
import { LatLng } from 'leaflet';
import * as moment from 'moment';
import { hot, cold } from 'jasmine-marbles';
import { MeasurementsResult } from '../model';

describe('HistoricalMeasurementEffects', () => {
  let actions$: Observable<any>;
  let effects: HistoricalMeasurementEffects;
  let historicalMeasurementsService: jasmine.SpyObj<HistoricalMeasurementsService>;

  beforeEach(() => {
    historicalMeasurementsService =
      jasmine.createSpyObj('historicalMeasurementsService', ['get']);

    TestBed.configureTestingModule({
      providers: [
        HistoricalMeasurementEffects,
        provideMockActions(() => actions$),
        { provide: HistoricalMeasurementsService, useValue: historicalMeasurementsService },
      ],
    });

    effects = TestBed.get(HistoricalMeasurementEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  it('should emit success actions for each results page until the first empty page', () => {
    const page1Results: MeasurementsResult[] =
      swagger.paths['/measurements'].get.responses[200].examples['application/json'].results;

    const page2Results: MeasurementsResult[] = cloneDeep(page1Results);
    const page3Results: MeasurementsResult[] = [];

    historicalMeasurementsService.get.and.returnValues(
      of(page1Results), of(page2Results), of(page3Results));

    const coordinates = new LatLng(1, 1);
    const dateTo = moment();
    const dateFrom = dateTo.subtract(7, 'days');

    const sourceAction = new LoadHistoricalMeasurements({ coordinates, dateFrom, dateTo });
    const page1Action = new LoadHistoricalMeasurementsSuccess({ results: page1Results });
    const page2Action = new LoadHistoricalMeasurementsSuccess({ results: [...page1Results, ...page2Results] });

    actions$ = hot('--i-', { i: sourceAction });
    const expectedActions$ = cold('--(op)-', { o: page1Action, p: page2Action });

    expect(effects.getHistoricalMeasurements$).toBeObservable(expectedActions$);
    expect(historicalMeasurementsService.get).toHaveBeenCalledTimes(3);
    expect(historicalMeasurementsService.get.calls.argsFor(0)).toEqual([1, dateFrom, dateTo, coordinates]);
    expect(historicalMeasurementsService.get.calls.argsFor(2)).toEqual([3, dateFrom, dateTo, coordinates]);
  });

  it('should emit failure action on getting an error', () => {
    const error = 'Whoopsy!';
    historicalMeasurementsService.get.and.returnValue(throwError(error));

    const coordinates = new LatLng(1, 1);
    const dateTo = moment();
    const dateFrom = dateTo.subtract(7, 'days');

    const sourceAction = new LoadHistoricalMeasurements({ coordinates, dateFrom, dateTo });
    const failureAction = new LoadHistoricalMeasurementsFailure({ error });

    actions$ = hot('--i-', { i: sourceAction });
    const expected$ = cold('--o-', { o: failureAction });

    expect(effects.getHistoricalMeasurements$).toBeObservable(expected$);
  });
});
