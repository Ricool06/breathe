import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { StaticChartFactoryService } from 'src/app/services/static-chart-factory.service';
import { Chart, ChartPoint, ChartDataSets } from 'chart.js';
import { MeasurementsResult } from 'src/app/model';
import { uniq } from 'lodash';

@Component({
  selector: 'app-historical-results-chart',
  templateUrl: './historical-results-chart.component.html',
  styleUrls: ['./historical-results-chart.component.scss'],
})
export class HistoricalResultsChartComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() measurementsResults: MeasurementsResult[];

  @ViewChild('chartCanvas') chartCanvas: ElementRef;
  private chart: Chart;

  constructor(private staticChartFactory: StaticChartFactoryService) { }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    this.chart = this.staticChartFactory.createChart(
      this.chartCanvas.nativeElement,
      {
        type: 'line',
      }
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.chart) {
      const measurementsResults: MeasurementsResult[] = changes.measurementsResults.currentValue || [];

      const labels = uniq(measurementsResults.map(result => result.parameter));

      const dataArrayMap = new Map<string, ChartPoint[]>();
      labels.forEach(label => dataArrayMap.set(label, []));

      measurementsResults.forEach(({ parameter, value, date }) => {
        dataArrayMap.get(parameter).push({ x: date.utc.toString(), y: value });
      });

      this.chart.data.datasets = Array.from(dataArrayMap.entries()).map(([label, chartPoints]) => ({ label, data: chartPoints }))

      this.chart.update();
    }
  }

}
