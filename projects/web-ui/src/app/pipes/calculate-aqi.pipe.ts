import { Pipe, PipeTransform, Inject } from '@angular/core';
import { AQI_STRATEGY_TOKEN, AqiStrategy } from '../services/aqi-strategies/aqi-strategy';
import { Measurement } from '../model';

@Pipe({
  name: 'calculateAqi',
})
export class CalculateAqiPipe implements PipeTransform {

  constructor(@Inject(AQI_STRATEGY_TOKEN) private strategies: AqiStrategy[]) { }

  transform(measurements: Measurement[], args?: any): string {
    const strategy = this.strategies.find(({ name }) => name === args[0]);
    return strategy ? strategy.calculate(measurements) : '';
  }

}
