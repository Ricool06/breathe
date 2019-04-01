import { State, selectLocationResults, selectMeasurementsResults } from '.';
import { LatestResult, MeasurementsResult } from '../model';
import * as swagger from '../../../blueprints/swagger.json';
import { cloneDeep } from 'lodash';

describe('Root state', () => {
  let latestResults: LatestResult[];
  let measurementResults: MeasurementsResult[];
  let state: State;

  beforeEach(() => {
    latestResults =
      cloneDeep(swagger.paths['/latest'].get.responses['200'].examples['application/json'].results);

    measurementResults =
      cloneDeep(swagger.paths['/measurements'].get.responses[200].examples['application/json'].results);

    state = {
      locationResultState: {
        locationResults: latestResults,
      },
      historicalMeasurementState: {
        results: measurementResults,
      },
  };

  });

  describe('LocationResults selector', () => {
    it('should retrieve all location results from the state', () => {
      expect(selectLocationResults(state)).toBe(latestResults);
    });
  });

  describe('MeasurementsResults selector', () => {
    it('should retrieve all measurements results from the state', () => {
      expect(selectMeasurementsResults(state)).toBe(measurementResults);
    });
  });
});
