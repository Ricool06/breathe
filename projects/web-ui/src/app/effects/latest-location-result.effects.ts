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
import { maxBy } from 'lodash';
import * as moment from 'moment';
import { LatestMeasurementsService } from '../services/latest-measurements.service';
import { LatestResult, Coordinates } from '../model';

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
        map(this.removeOldResultsAtSameLocation, this),
        map(locationResults => new LoadLatestLocationResultsSuccess({ locationResults })),
        catchError(error => of(new LoadLatestLocationResultsFailure({ error })))
      );
    })
  );

  private removeOldResultsAtSameLocation(results: LatestResult[]): LatestResult[] {
    const coordinatesToResultMap: Map<string, LatestResult> = new Map();

    results.forEach((currentResult) => {
      const currentMapId = this.serializeCoordinates(currentResult.coordinates);
      let resultToKeep = currentResult;

      if (coordinatesToResultMap.has(currentMapId)) {
        const storedResult = coordinatesToResultMap.get(currentMapId);
        resultToKeep = maxBy([storedResult, currentResult], result => moment(result.measurements[0].lastUpdated).valueOf());
      }

      const keepingMapId = this.serializeCoordinates(resultToKeep.coordinates);
      coordinatesToResultMap.set(keepingMapId, resultToKeep);
    });

    return Array.from(coordinatesToResultMap.values());
  }

  private serializeCoordinates({ latitude, longitude }): string {
    return `${latitude},${longitude}`;
  }
}
