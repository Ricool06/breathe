import { Pipe, PipeTransform } from '@angular/core';
import { Measurement } from '../model';
import * as moment from 'moment';

@Pipe({
  name: 'pruneNonLatestMeasurements',
})
export class PruneNonLatestMeasurementsPipe implements PipeTransform {

  transform(measurements: Measurement[]): Measurement[] {
    const allTimes: moment.Moment[] = measurements
      .map(measurement => moment(measurement.lastUpdated));

    const latestTime = moment.max(allTimes);

    return measurements
      .filter(({ lastUpdated: thisMeasurementTime }) => moment(thisMeasurementTime).isSame(latestTime));
  }

}
