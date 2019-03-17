import { Measurement } from 'src/app/model';
import { InjectionToken } from '@angular/core';

export interface AqiStrategy {
  name: string;
  calculate(measurements: Measurement[]): string;
}

export const AQI_STRATEGY_TOKEN = new InjectionToken<AqiStrategy>('AqiStrategy');
