import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { StaticChartFactoryService } from 'src/app/services/static-chart-factory.service';
import { Chart, ChartPoint, ChartDataSets } from 'chart.js';
import { MeasurementsResult } from 'src/app/model';
import { uniq } from 'lodash';
import * as moment from 'moment';
import * as Color from 'color';

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
        options: {
          scales: {
            xAxes: [
              {
                type: 'time',
              },
            ],
          },
        },
      }
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.chart) {
      const measurementsResults: MeasurementsResult[] = changes.measurementsResults.currentValue || [];

      const labels = uniq(measurementsResults.map(result => result.parameter)).sort();

      const dataArrayMap = new Map<string, ChartPoint[]>();
      labels.forEach(label => dataArrayMap.set(label, []));

      measurementsResults.forEach(({ parameter, value, date }) => {
        dataArrayMap.get(parameter).push({ x: moment(date.utc).toDate(), y: value });
      });

      this.chart.data.datasets = Array.from(dataArrayMap.entries())
        .map(([label, chartPoints], index) => ({ label, data: chartPoints, backgroundColor: this.getColourFromIndex(index) }));

      this.chart.update();
    }
  }

  private getColourFromIndex(index: number) {
    return new Color([40, 190, 255, 0.6], 'rgb')
        .rotate(-index * 45)
        .lighten(0.2)
        .rgb().string();
  }
}
