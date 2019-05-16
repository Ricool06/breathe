import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { PredictionActions, PredictionActionTypes, LoadPredictions, LoadPredictionsSuccess } from '../actions/prediction.actions';
import { Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { PredictionsService } from '../services/predictions.service';



@Injectable()
export class PredictionEffects {

  constructor(private actions$: Actions, private predictionsService: PredictionsService) {}

  @Effect()
  getPredictions$: Observable<PredictionActions> = this.actions$.pipe(
    ofType(PredictionActionTypes.LoadPredictions),
    map((action: LoadPredictions) => action.payload),
    switchMap(({ coordinates, parameter }) => {
      return this.predictionsService.get(coordinates, parameter).pipe(
        map(predictions => new LoadPredictionsSuccess({ predictions }))
      );
    })
  );
}
