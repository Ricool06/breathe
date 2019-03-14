import { Component, OnInit, ViewChild, ElementRef, Input, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';
import { Chart, ChartData } from 'chart.js';
import { StaticChartFactoryService } from 'src/app/services/static-chart-factory.service';
import { Measurement } from 'src/app/model';

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
    measurements = measurements || [];

    const labels = measurements.map(measurement => `${measurement.parameter}: ${measurement.unit}`);
    const data = measurements.map(measurement => measurement.value);

    return { labels, datasets: [{ data }] };
  }
}
