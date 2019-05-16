import {
  ActionReducerMap,
  createSelector,
  MetaReducer
} from '@ngrx/store';
import { environment } from '../../environments/environment';
import * as fromLocationResult from './location-result.reducer';
import * as fromHistoricalMeasurement from './historical-measurement.reducer';
import * as fromPredictions from './predictions.reducer';

export interface State {
  locationResultState: fromLocationResult.State;
  historicalMeasurementState: fromHistoricalMeasurement.State;
  predictionsState: fromPredictions.State;
}

export const reducers: ActionReducerMap<State> = {
  locationResultState: fromLocationResult.reducer,
  historicalMeasurementState: fromHistoricalMeasurement.reducer,
  predictionsState: fromPredictions.reducer,
};

export const selectLocationResults = createSelector(
  (state: State) => state.locationResultState,
  (state: fromLocationResult.State) => state.locationResults
);

export const selectMeasurementsResults = createSelector(
  (state: State) => state.historicalMeasurementState,
  (state: fromHistoricalMeasurement.State) => state.results
);

export const selectPredictions = createSelector(
  (state: State) => state.predictionsState,
  (state: fromPredictions.State) => state.predictions
);

export const metaReducers: MetaReducer<State>[] = !environment.production ? [] : [];
