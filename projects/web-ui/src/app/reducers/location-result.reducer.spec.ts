import { reducer, initialState } from './location-result.reducer';
import * as swagger from '../../../blueprints/swagger.json';
import { LoadLatestLocationResultsSuccess } from '../actions/latest-location-result.actions';

describe('LocationResult Reducer', () => {
  describe('an unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as any;

      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  describe('LoadLatestLocationResultsSuccess action', () => {
    it('should set location results', () => {
      const mockLocationResults =
        swagger.paths['/latest'].get.responses[200].examples['application/json'].results;

      const action = new LoadLatestLocationResultsSuccess({ locationResults: mockLocationResults });

      const newState = reducer(initialState, action);

      expect(newState.locationResults).toBe(mockLocationResults);
    });
  });
});
