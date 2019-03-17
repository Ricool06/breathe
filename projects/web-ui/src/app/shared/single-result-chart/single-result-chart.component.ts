import { Component, OnInit, ViewChild, ElementRef, Input, OnChanges, SimpleChanges, AfterViewInit, HostListener } from '@angular/core';
import { Chart, ChartData, ChartDataSets } from 'chart.js';
import { StaticChartFactoryService } from 'src/app/services/static-chart-factory.service';
import { Measurement } from 'src/app/model';
import * as Color from 'color';

@Component({
  selector: 'app-single-result-chart',
  templateUrl: './single-result-chart.component.html',
  styleUrls: ['./single-result-chart.component.scss'],
})
export class SingleResultChartComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('chartCanvas') chartCanvas: ElementRef;
  @Input() measurements: Measurement[] = [];

  private chart: Chart;

  constructor(private staticChartFactory: StaticChartFactoryService) { }

  ngOnInit() { }

  ngAfterViewInit() {
    this.chart = this.staticChartFactory.createChart(
      this.chartCanvas.nativeElement,
      {
        data: this.convertMeasurementsToChartData(this.measurements),
        type: 'polarArea',
        options: { maintainAspectRatio: false },
      }
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.chart) {
      const measurements = changes.measurements.currentValue || [];
      const newChartData = this.convertMeasurementsToChartData(measurements);
      this.chart.data.labels = newChartData.labels;
      this.chart.data.datasets = newChartData.datasets;
      this.chart.update();
    }
  }

  private convertMeasurementsToChartData(measurements: Measurement[]): ChartData {
    measurements = (measurements || []).sort(({ parameter: p1 }, { parameter: p2 }) => p1.localeCompare(p2));

    const labels = measurements
      .map(({ parameter, unit, averagingPeriod }) => `${parameter} ${unit} over ${averagingPeriod.value} ${averagingPeriod.unit}`);
    const data = measurements.map(measurement => measurement.value);
    const backgroundColor = measurements.map((_, index) => {
      return new Color([40, 190, 255, 0.6], 'rgb')
        .rotate(-index * 45)
        .lighten(0.2)
        .rgb().string();
    });

    return { labels, datasets: [{ data, backgroundColor }] };
  }
}
