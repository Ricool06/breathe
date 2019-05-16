import { Action } from '@ngrx/store';
import { Prediction } from '../model';
import { LatLng } from 'leaflet';

export enum PredictionActionTypes {
  LoadPredictions = '[Prediction] Load Predictions',
  LoadPredictionsSuccess = '[Prediction] Load Predictions Success',
  LoadPredictionsFailure = '[Prediction] Load Predictions Failure',
}

export class LoadPredictions implements Action {
  readonly type = PredictionActionTypes.LoadPredictions;
  constructor(public payload: { coordinates: LatLng, parameter: string }) { }
}

export class LoadPredictionsSuccess implements Action {
  readonly type = PredictionActionTypes.LoadPredictionsSuccess;
  constructor(public payload: { predictions: Prediction[] }) { }
}

export class LoadPredictionsFailure implements Action {
  readonly type = PredictionActionTypes.LoadPredictionsFailure;
  constructor(public payload: { error: any }) { }
}

export type PredictionActions = LoadPredictions | LoadPredictionsSuccess | LoadPredictionsFailure;

