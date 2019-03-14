import { Injectable } from '@angular/core';
import { Chart } from 'chart.js';

@Injectable({
  providedIn: 'root',
})
export class StaticChartFactoryService {
  createChart(
    context: string | CanvasRenderingContext2D | HTMLCanvasElement | ArrayLike<CanvasRenderingContext2D | HTMLCanvasElement>,
    options: Chart.ChartConfiguration
  ): Chart {
    return new Chart(context, options);
  }

  constructor() { }
}
