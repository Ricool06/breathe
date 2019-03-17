import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'calculateAqi',
})
export class CalculateAqiPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return null;
  }

}
