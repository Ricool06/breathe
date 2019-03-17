import { CalculateAqiPipe } from './calculate-aqi.pipe';
import { async, TestBed } from '@angular/core/testing';
import { AqiStrategy, AQI_STRATEGY_TOKEN } from '../services/aqi-strategies/aqi-strategy';

describe('CalculateAqiPipe', () => {
  let pipe: CalculateAqiPipe;

  beforeEach(async(() => {
    const aqiStrategy1: AqiStrategy = {
      name: 'USEPA',
      calculate() { return 'USEPA Result'; },
    };
    const aqiStrategy2: AqiStrategy = {
      name: 'EAQI',
      calculate() { return 'EAQI Result'; },
    };

    TestBed.configureTestingModule({
      providers: [
        CalculateAqiPipe,
        { provide: AQI_STRATEGY_TOKEN, useValue: aqiStrategy1, multi: true },
        { provide: AQI_STRATEGY_TOKEN, useValue: aqiStrategy2, multi: true },
      ],
    });
  }));

  beforeEach(() => pipe = TestBed.get(CalculateAqiPipe));

  it('can create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should use the specified strategy to calculate AQI from measurements', () => {
    expect(pipe.transform([], ['EAQI'])).toEqual('EAQI Result');
    expect(pipe.transform([], ['USEPA'])).toEqual('USEPA Result');
  });

  it('should ignore invalid strategy names', () => {
    expect(pipe.transform([], ['Jimbo\'s AQI'])).toEqual('');
  });
});
