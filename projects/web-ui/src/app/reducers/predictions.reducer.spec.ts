import { reducer, initialState } from './predictions.reducer';
import { Prediction } from '../model';
import { LoadPredictionsSuccess } from '../actions/prediction.actions';

describe('Predictions Reducer', () => {
  describe('an unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as any;

      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  describe('LoadPredictionsSuccess action', () => {
    it('should set location results', () => {
      const predictions: Prediction[] = [
        {
          timestamp: 1557937766,
          value: 800,
        },
        {
          timestamp: 1557941366,
          value: 400,
        },
      ];

      const action = new LoadPredictionsSuccess({ predictions });

      const newState = reducer(initialState, action);

      expect(newState.predictions).toBe(predictions);
    });
  });
});
