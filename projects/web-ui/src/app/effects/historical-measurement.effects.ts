import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { HistoricalMeasurementsService } from '../services/historical-measurements.service';
import { Observable, of } from 'rxjs';
import { HistoricalMeasurementActions, HistoricalMeasurementActionTypes, LoadHistoricalMeasurements, LoadHistoricalMeasurementsSuccess } from '../actions/historical-measurement.actions';
import { map, switchMap, expand, takeWhile, tap, scan } from 'rxjs/operators';
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
    tap(_ => console.log('before switchmap')),
    switchMap(({ coordinates, dateFrom, dateTo }) => {
      const resultPage$ = of(1).pipe(
        expand((page) => this.historicalMeasurementsService.get(page, dateFrom, dateTo, coordinates)),
        tap(results => console.log('length ' + results.length)),
        takeWhile(results => results.length > 0)
      );

      return resultPage$;
    }),
    scan((accumulator: MeasurementsResult[], thisPage: MeasurementsResult[]) => [...accumulator, ...thisPage]),
    map(results => new LoadHistoricalMeasurementsSuccess({ results }))
  );
}
