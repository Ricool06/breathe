import { State, selectLocationResults, selectMeasurementsResults, selectPredictions } from '.';
import { LatestResult, MeasurementsResult, Prediction } from '../model';
import * as swagger from '../../../blueprints/swagger.json';
import { cloneDeep } from 'lodash';

describe('Root state', () => {
  let latestResults: LatestResult[];
  let measurementResults: MeasurementsResult[];
  let predictions: Prediction[];
  let state: State;

  beforeEach(() => {
    latestResults =
      cloneDeep(swagger.paths['/latest'].get.responses['200'].examples['application/json'].results);

    measurementResults =
      cloneDeep(swagger.paths['/measurements'].get.responses[200].examples['application/json'].results);

    predictions = [
      {
        timestamp: 1557937766,
        value: 800,
      },
    ];

    state = {
      locationResultState: {
        locationResults: latestResults,
      },
      historicalMeasurementState: {
        results: measurementResults,
      },
      predictionsState: {
        predictions,
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

  describe('Predictions selector', () => {
    it('should retrieve all predictions from the state', () => {
      expect(selectPredictions(state)).toBe(predictions);
    });
  });
});
