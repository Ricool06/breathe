import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable, of } from 'rxjs';
import {
  LoadLatestLocationResults,
  LatestLocationResultActionTypes,
  LoadLatestLocationResultsSuccess,
  LatestLocationResultActions,
  LoadLatestLocationResultsFailure
} from '../actions/latest-location-result.actions';
import { map, switchMap, catchError } from 'rxjs/operators';
import { LatestMeasurementsService } from '../services/latest-measurements.service';

@Injectable()
export class LatestLocationResultEffects {

  constructor(
    private actions$: Actions,
    private latestMeasurementsService: LatestMeasurementsService) {}

  @Effect()
  getLatestLocationResults$: Observable<LatestLocationResultActions> = this.actions$.pipe(
    ofType(LatestLocationResultActionTypes.LoadLatestLocationResults),
    map((action: LoadLatestLocationResults) => action.payload),
    switchMap(({ coordinates, radius }) => {
      return this.latestMeasurementsService.getInRadius(coordinates, radius).pipe(
        map(locationResults => new LoadLatestLocationResultsSuccess({ locationResults })),
        catchError(error => of(new LoadLatestLocationResultsFailure({ error })))
      );
    })
  );
}
