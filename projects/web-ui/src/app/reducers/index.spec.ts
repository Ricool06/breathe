import { State, selectLocationResults } from '.';
import { LatestResult } from '../model';
import * as swagger from '../../../blueprints/swagger.json';

describe('Root state', () => {
  describe('LocationResults selector', () => {
    it('should retrieve all location results from the state', () => {
      const mockResults: LatestResult[] =
        swagger.paths['/latest'].get.responses['200'].examples['application/json'].results;

      const state: State = {
        locationResultState: {
          locationResults: mockResults,
        },
      };

      expect(selectLocationResults(state)).toBe(mockResults);
    });
  });
});
