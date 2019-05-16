import { Component, OnInit, Input, AfterViewInit, ViewChild, ElementRef, SimpleChanges, OnChanges } from '@angular/core';
import { Prediction } from 'src/app/model';
import { StaticChartFactoryService } from 'src/app/services/static-chart-factory.service';
import * as moment from 'moment';
import { ChartDataSets, ChartData, ChartPoint } from 'chart.js';

@Component({
  selector: 'app-predictions-chart',
  templateUrl: './predictions-chart.component.html',
  styleUrls: ['./predictions-chart.component.scss'],
})
export class PredictionsChartComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() predictions: Prediction[];

  @ViewChild('chartCanvas') chartCanvas: ElementRef;
  private chart: Chart;

  constructor(private staticChartFactory: StaticChartFactoryService) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
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
      const predictions: Prediction[] = changes.predictions.currentValue || [];

      const data: ChartPoint[] = predictions.map(({ timestamp, value }) => ({ x: moment.unix(timestamp).toDate(), y: value }));
      const dataset: ChartDataSets = { data };
      this.chart.data.datasets[0] = dataset;
      this.chart.update();
    }
  }
}
