import { AqiStrategy } from './aqi-strategy';
import { Measurement, PollutantRange, PollutionDescriptor } from 'src/app/model';
import { find, inRange } from 'lodash';

export class Eaqi implements AqiStrategy {
  name = 'EAQI';
  private eaqiGrid: Map<string, PollutantRange[]>;

  constructor() {
    this.eaqiGrid = new Map<string, PollutantRange[]>([
      ['pm25', [
        { min: 0, max: 10, descriptor: PollutionDescriptor.Good },
        { min: 10, max: 20, descriptor: PollutionDescriptor.Fair },
        { min: 20, max: 25, descriptor: PollutionDescriptor.Moderate },
        { min: 25, max: 50, descriptor: PollutionDescriptor.Poor },
        { min: 50, max: 800, descriptor: PollutionDescriptor['Very poor'] },
      ]],
      ['pm10', [
        { min: 0, max: 20, descriptor: PollutionDescriptor.Good },
        { min: 20, max: 35, descriptor: PollutionDescriptor.Fair },
        { min: 35, max: 50, descriptor: PollutionDescriptor.Moderate },
        { min: 50, max: 100, descriptor: PollutionDescriptor.Poor },
        { min: 100, max: 1200, descriptor: PollutionDescriptor['Very poor'] },
      ]],
      ['no2', [
        { min: 0, max: 40, descriptor: PollutionDescriptor.Good },
        { min: 40, max: 100, descriptor: PollutionDescriptor.Fair },
        { min: 100, max: 200, descriptor: PollutionDescriptor.Moderate },
        { min: 200, max: 400, descriptor: PollutionDescriptor.Poor },
        { min: 400, max: 1000, descriptor: PollutionDescriptor['Very poor'] },
      ]],
      ['o3', [
        { min: 0, max: 80, descriptor: PollutionDescriptor.Good },
        { min: 80, max: 120, descriptor: PollutionDescriptor.Fair },
        { min: 120, max: 180, descriptor: PollutionDescriptor.Moderate },
        { min: 180, max: 240, descriptor: PollutionDescriptor.Poor },
        { min: 240, max: 600, descriptor: PollutionDescriptor['Very poor'] },
      ]],
      ['so2', [
        { min: 0, max: 100, descriptor: PollutionDescriptor.Good },
        { min: 100, max: 200, descriptor: PollutionDescriptor.Fair },
        { min: 200, max: 350, descriptor: PollutionDescriptor.Moderate },
        { min: 350, max: 500, descriptor: PollutionDescriptor.Poor },
        { min: 500, max: 1250, descriptor: PollutionDescriptor['Very poor'] },
      ]],
    ]);
  }

  calculate(measurements: Measurement[]): string {
    measurements = measurements
      .filter(({ averagingPeriod: { unit, value } }) => unit.startsWith('hour') && value === 1)
      .filter(({ unit }) => unit === 'µg/m³');

    const separateAqis: PollutionDescriptor[] = measurements.map(({ parameter, value }) => {
      const pollutantRanges = this.eaqiGrid.get(parameter);
      const correctRange = find(pollutantRanges, ({ min, max }) => inRange(value, min, max));
      return correctRange ? correctRange.descriptor : PollutionDescriptor.Unknown;
    });

    return PollutionDescriptor[Math.max(...separateAqis)] || PollutionDescriptor[0];
  }
}
