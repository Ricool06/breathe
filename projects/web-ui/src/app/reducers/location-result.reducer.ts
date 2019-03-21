import { LatestResult } from '../model';
import { LatestLocationResultActionTypes, LatestLocationResultActions } from '../actions/latest-location-result.actions';


export interface State {
  locationResults: LatestResult[];
}

export const initialState: State = {
  locationResults: [],
};

export function reducer(state = initialState, action: LatestLocationResultActions): State {
  switch (action.type) {
    case(LatestLocationResultActionTypes.LoadLatestLocationResultsSuccess):
      return {
        ...state,
        locationResults: action.payload.locationResults,
      };
    default:
      return state;
  }
}
