import { MeasurementsResult } from '../model';
import {
  HistoricalMeasurementActions,
  HistoricalMeasurementActionTypes
} from '../actions/historical-measurement.actions';


export interface State {
  results: MeasurementsResult[];
}

export const initialState: State = {
  results: [],
};

export function reducer(state = initialState, action: HistoricalMeasurementActions): State {
  switch (action.type) {
    case(HistoricalMeasurementActionTypes.LoadHistoricalMeasurementsSuccess):
      return {
        ...state,
        results: action.payload.results,
      };
    default:
      return state;
  }
}
