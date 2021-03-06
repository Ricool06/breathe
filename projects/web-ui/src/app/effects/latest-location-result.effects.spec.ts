import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import { hot, cold } from 'jasmine-marbles';

import * as swagger from '../../../blueprints/swagger.json';
import { LatestLocationResultEffects } from './latest-location-result.effects';
import { LatestMeasurementsService } from '../services/latest-measurements.service';
import { LatestResult } from '../model';
import { LatLng } from 'leaflet';
import {
  LoadLatestLocationResults,
  LoadLatestLocationResultsSuccess,
  LatestLocationResultActions,
  LoadLatestLocationResultsFailure
} from '../actions/latest-location-result.actions';
import { cloneDeep } from 'lodash';
import * as moment from 'moment';

describe('LatestLocationResultEffects', () => {
  let actions$: Observable<LatestLocationResultActions>;
  let effects: LatestLocationResultEffects;
  let latestMeasurementsService: jasmine.SpyObj<LatestMeasurementsService>;

  beforeEach(() => {
    latestMeasurementsService = jasmine.createSpyObj('latestMeasurementsService', ['getInRadius']);

    TestBed.configureTestingModule({
      providers: [
        LatestLocationResultEffects,
        provideMockActions(() => actions$),
        { provide: LatestMeasurementsService, useValue: latestMeasurementsService },
      ],
    });

    effects = TestBed.get(LatestLocationResultEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  it('should emit a success action upon getting data', () => {
    const locationResults: LatestResult[] =
      swagger.paths['/latest'].get.responses[200].examples['application/json'].results.map((result) => {
        const newOne = {...result} as LatestResult;
        return newOne;
      });

    const radius = 2500;
    const coordinates: LatLng = new LatLng(1, 1);

    latestMeasurementsService.getInRadius.and.returnValue(of(locationResults));

    const sourceAction = new LoadLatestLocationResults({ coordinates, radius });
    const successAction = new LoadLatestLocationResultsSuccess({ locationResults });

    actions$ = hot('--i-', { i: sourceAction });
    const expectedActions$ = cold('--o', { o: successAction });

    expect(effects.getLatestLocationResults$).toBeObservable(expectedActions$);
  });

  it('should emit failure action on getting error', () => {
    const error = 'Uh oh!';
    latestMeasurementsService.getInRadius.and.returnValue(throwError(error));

    const radius = 2500;
    const coordinates: LatLng = new LatLng(1, 1);

    const sourceAction = new LoadLatestLocationResults({ coordinates, radius });
    const failureAction = new LoadLatestLocationResultsFailure({ error });

    actions$ = hot('--i-', { i: sourceAction });
    const expected$ = cold('--o', { o: failureAction });

    expect(effects.getLatestLocationResults$).toBeObservable(expected$);
  });

  it('should filter non-latest result objects at the same location', () => {
    const locationResults: LatestResult[] =
      [cloneDeep(swagger.paths['/latest'].get.responses[200].examples['application/json'].results[0])];

    const newerResult = cloneDeep(locationResults[0]);
    newerResult.measurements
      .forEach(measurement => measurement.lastUpdated = moment(measurement.lastUpdated).add(1, 'hour'));

    locationResults.push(newerResult);

    latestMeasurementsService.getInRadius.and.returnValue(of(locationResults));

    const expectedLocationResults = [newerResult];

    const radius = 2500;
    const coordinates: LatLng = new LatLng(1, 1);

    const sourceAction = new LoadLatestLocationResults({ coordinates, radius });
    const successAction = new LoadLatestLocationResultsSuccess({ locationResults: expectedLocationResults });

    actions$ = hot('--i-', { i: sourceAction });
    const expectedActions$ = cold('--o', { o: successAction });

    expect(effects.getLatestLocationResults$).toBeObservable(expectedActions$);
  });
});
