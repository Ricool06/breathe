import { Eaqi } from './eaqi.aqi-strategy';
import { Measurement } from 'src/app/model';
import * as moment from 'moment';

describe('Eaqi', () => {
  it('should create an instance', () => {
    expect(new Eaqi()).toBeTruthy();
  });

  // Grid is here:
  // http://airindex.eea.europa.eu/#
  it('should base the AQI on the worst pollutant according to the standard EAQI grid', () => {
    const eaqi = new Eaqi();
    const parameters = [
      { parameter: 'pm25', value: 24 },
      { parameter: 'pm10', value: 24 },
      { parameter: 'no2', value: 24 },
      { parameter: 'o3', value: 24 },
      { parameter: 'so2', value: 24 },
    ];

    const templateMeasurement: Measurement = {
      averagingPeriod: {
        value: 1,
        unit: 'hours',
      },
      lastUpdated: moment().toISOString(),
      parameter: 'pm25',
      sourceName: 'DEFRA',
      unit: 'µg/m³',
      value: 24,
    };

    const measurements: Measurement[] = parameters.map(({ parameter, value }) => ({ ...templateMeasurement, parameter, value }));

    expect(eaqi.calculate(measurements)).toEqual('Moderate');

    measurements[0].value = 0;

    expect(eaqi.calculate(measurements)).toEqual('Fair');

    measurements[1].value = 120;

    expect(eaqi.calculate(measurements)).toEqual('Very poor');
  });

  it('should return Unknown when no pollutant used in EAQI calculation exists', () => {
    const eaqi = new Eaqi();

    const measurements: Measurement[] = [
      {
        averagingPeriod: {
          value: 1,
          unit: 'hours',
        },
        lastUpdated: moment().toISOString(),
        parameter: 'co',
        sourceName: 'DEFRA',
        unit: 'µg/m³',
        value: 24,
      },
    ];

    expect(eaqi.calculate(measurements)).toEqual('Unknown');
  });

  it('should ignore pollutants not used in EAQI calculation', () => {
    const eaqi = new Eaqi();

    const measurements: Measurement[] = [
      {
        averagingPeriod: {
          value: 1,
          unit: 'hours',
        },
        lastUpdated: moment().toISOString(),
        parameter: 'co',
        sourceName: 'DEFRA',
        unit: 'µg/m³',
        value: 24,
      },
      {
        averagingPeriod: {
          value: 1,
          unit: 'hours',
        },
        lastUpdated: moment().toISOString(),
        parameter: 'pm25',
        sourceName: 'DEFRA',
        unit: 'µg/m³',
        value: 24,
      },
    ];

    expect(eaqi.calculate(measurements)).toEqual('Moderate');
  });

  it('should return unknown for an empty measurements array', () => {
    const eaqi = new Eaqi();
    expect(eaqi.calculate([])).toEqual('Unknown');
  });

  it('should ensure the averaging period is 1 hour', () => {
    const eaqi = new Eaqi();

    const measurements: Measurement[] = [
      {
        averagingPeriod: {
          value: 2,
          unit: 'hours',
        },
        lastUpdated: moment().toISOString(),
        parameter: 'pm25',
        sourceName: 'DEFRA',
        unit: 'µg/m³',
        value: 24,
      },
    ];

    expect(eaqi.calculate(measurements)).toEqual('Unknown');
  });

  it('should ensure the unit of measurement is µg/m³', () => {
    const eaqi = new Eaqi();

    const measurements: Measurement[] = [
      {
        averagingPeriod: {
          value: 1,
          unit: 'hours',
        },
        lastUpdated: moment().toISOString(),
        parameter: 'pm25',
        sourceName: 'DEFRA',
        unit: 'kg/km³',
        value: 24,
      },
    ];

    expect(eaqi.calculate(measurements)).toEqual('Unknown');
  });

  it('should disregard measurements above the maximum', () => {
    const eaqi = new Eaqi();

    const measurements: Measurement[] = [
      {
        averagingPeriod: {
          value: 1,
          unit: 'hours',
        },
        lastUpdated: moment().toISOString(),
        parameter: 'pm25',
        sourceName: 'DEFRA',
        unit: 'µg/m³',
        value: 999999999,
      },
    ];

    expect(eaqi.calculate(measurements)).toEqual('Unknown');
  });
});
