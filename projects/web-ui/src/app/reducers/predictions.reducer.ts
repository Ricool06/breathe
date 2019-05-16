import { Action } from '@ngrx/store';
import { Prediction } from '../model';
import { PredictionActionTypes, PredictionActions } from '../actions/prediction.actions';


export interface State {
  predictions: Prediction[];
}

export const initialState: State = {
  predictions: [],
};

export function reducer(state = initialState, action: PredictionActions): State {
  switch (action.type) {
    case (PredictionActionTypes.LoadPredictionsSuccess):
      return {
        ...state,
        predictions: action.payload.predictions,
      };
    default:
      return state;
  }
}
