import { PruneRepeatedMeasurementsPipe } from './prune-repeated-measurements.pipe';
import * as swagger from 'blueprints/swagger.json';
import { Measurement } from '../model';

describe('PruneRepeatedMeasurementsPipe', () => {
  it('can create an instance', () => {
    const pipe = new PruneRepeatedMeasurementsPipe();
    expect(pipe).toBeTruthy();
  });

  it('should prune repeated measurements', () => {
    const pipe = new PruneRepeatedMeasurementsPipe();

    const measurements: Measurement[] =
      swagger.paths['/latest'].get.responses[200].examples['application/json'].results[0].measurements;

    const originalLength = measurements.length;

    const clonedMeasurement: Measurement = { ...measurements[0] };
    measurements.push(clonedMeasurement);

    expect(pipe.transform(measurements).length).toBe(originalLength);
  });
});
