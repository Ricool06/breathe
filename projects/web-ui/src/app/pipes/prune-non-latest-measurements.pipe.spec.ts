import * as moment from 'moment';
import { PruneNonLatestMeasurementsPipe } from './prune-non-latest-measurements.pipe';
import { Measurement } from '../model';
import * as swagger from 'blueprints/swagger.json';


describe('PruneNonLatestMeasurementsPipe', () => {
  it('can create an instance', () => {
    const pipe = new PruneNonLatestMeasurementsPipe();
    expect(pipe).toBeTruthy();
  });

  it('should prune non-latest measurements', () => {
    const pipe = new PruneNonLatestMeasurementsPipe();

    const measurements: Measurement[] =
      swagger.paths['/latest'].get.responses[200].examples['application/json'].results[0].measurements;

    const latestMeasurement: Measurement = { ...measurements[0], lastUpdated: moment(measurements[0].lastUpdated).add(1, 'hour') };
    measurements.push(latestMeasurement);

    const prunedMeasurements = pipe.transform(measurements);
    expect(prunedMeasurements.length).toBe(1);
    expect(prunedMeasurements[0]).toEqual(latestMeasurement);
  });
});
