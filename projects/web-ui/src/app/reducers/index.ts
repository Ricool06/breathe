import {
  ActionReducerMap,
  createSelector,
  MetaReducer
} from '@ngrx/store';
import { environment } from '../../environments/environment';
import * as fromLocationResult from './location-result.reducer';
import * as fromHistoricalMeasurement from './historical-measurement.reducer';

export interface State {
  locationResultState: fromLocationResult.State;
  historicalMeasurementState: fromHistoricalMeasurement.State;
}


export const reducers: ActionReducerMap<State> = {
  locationResultState: fromLocationResult.reducer,
  historicalMeasurementState: fromHistoricalMeasurement.reducer,
};

export const selectLocationResults = createSelector(
  (state: State) => state.locationResultState,
  (state: fromLocationResult.State) => state.locationResults
);

export const metaReducers: MetaReducer<State>[] = !environment.production ? [] : [];
