import { Pipe, PipeTransform } from '@angular/core';
import { Measurement } from '../model';
import { uniqWith, isEqual } from 'lodash';

@Pipe({
  name: 'pruneRepeatedMeasurements',
})
export class PruneRepeatedMeasurementsPipe implements PipeTransform {

  transform(measurements: Measurement[]): Measurement[] {
    return uniqWith(measurements, isEqual);
  }

}
