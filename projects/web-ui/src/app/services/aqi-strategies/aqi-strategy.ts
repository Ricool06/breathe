import { Measurement } from 'src/app/model';

export interface AqiStrategy {
  calculate(measurements: Measurement[]): string;
}
