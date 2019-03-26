import { reducer, initialState } from './historical-measurement.reducer';
import * as swagger from 'blueprints/swagger.json';
import { LoadHistoricalMeasurementsSuccess } from '../actions/historical-measurement.actions';
import { MeasurementsResult } from '../model';

describe('HistoricalMeasurement Reducer', () => {
  describe('an unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as any;

      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  describe('LoadHistoricalMeasurmentsSuccess action', () => {
    it('should set location results', () => {
      const results: MeasurementsResult[] =
        swagger.paths['/measurements'].get.responses[200].examples['application/json'].results;

      const action = new LoadHistoricalMeasurementsSuccess({ results });

      const newState = reducer(initialState, action);

      expect(newState.results).toBe(results);
    });
  });
});
