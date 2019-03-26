import { State, selectLocationResults } from '.';
import { LatestResult, MeasurementsResult } from '../model';
import * as swagger from '../../../blueprints/swagger.json';

describe('Root state', () => {
  describe('LocationResults selector', () => {
    it('should retrieve all location results from the state', () => {
      const latestResults: LatestResult[] =
        swagger.paths['/latest'].get.responses['200'].examples['application/json'].results;

      const measurementResults: MeasurementsResult[] =
        swagger.paths['/measurements'].get.responses[200].examples['application/json'].results;

      const state: State = {
        locationResultState: {
          locationResults: latestResults,
        },
        historicalMeasurementState: {
          results: measurementResults,
        },
      };

      expect(selectLocationResults(state)).toBe(latestResults);
    });
  });
});
