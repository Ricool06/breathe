import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { HistoricalMeasurementsService } from '../services/historical-measurements.service';
import { Observable, of, NEVER, range } from 'rxjs';
import {
  HistoricalMeasurementActions,
  HistoricalMeasurementActionTypes,
  LoadHistoricalMeasurements,
  LoadHistoricalMeasurementsSuccess,
  LoadHistoricalMeasurementsFailure
} from '../actions/historical-measurement.actions';
import { map, switchMap, expand, takeWhile, tap, scan, flatMap, catchError, concatMap } from 'rxjs/operators';
import { MeasurementsResult } from '../model';



@Injectable()
export class HistoricalMeasurementEffects {

  constructor(
    private actions$: Actions,
    private historicalMeasurementsService: HistoricalMeasurementsService) {}

  @Effect()
  getHistoricalMeasurements$: Observable<HistoricalMeasurementActions> = this.actions$.pipe(
    ofType(HistoricalMeasurementActionTypes.LoadHistoricalMeasurements),
    map((action: LoadHistoricalMeasurements) => action.payload),
    switchMap(({ coordinates, dateFrom, dateTo }) => {
      return range(1, 10000).pipe(
        concatMap(page => this.historicalMeasurementsService.get(page, dateFrom, dateTo, coordinates)),
        takeWhile(results => results.length > 0),
        scan((accumulator: MeasurementsResult[], thisPage: MeasurementsResult[]) => [...accumulator, ...thisPage], []),
        map(results => new LoadHistoricalMeasurementsSuccess({ results })),
        catchError(error => of(new LoadHistoricalMeasurementsFailure({ error })))
      );
    })
  );
}
