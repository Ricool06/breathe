import {
  ActionReducer,
  ActionReducerMap,
  createFeatureSelector,
  createSelector,
  MetaReducer
} from '@ngrx/store';
import { environment } from '../../environments/environment';
import * as fromLocationResult from './location-result.reducer';

export interface State {
  locationResultState: fromLocationResult.State;
}


export const reducers: ActionReducerMap<State> = {
  locationResultState: fromLocationResult.reducer,
};

export const selectLocationResults = createSelector(
  (state: State) => state.locationResultState,
  (state: fromLocationResult.State) => state.locationResults
);

// export const metaReducers: MetaReducer<State>[] = !environment.production ? [] : [];
