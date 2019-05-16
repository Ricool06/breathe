import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PredictionsChartComponent } from './predictions-chart.component';
import { Component, ViewChild } from '@angular/core';
import {  Prediction } from 'src/app/model';
import { By } from '@angular/platform-browser';
import { StaticChartFactoryService } from 'src/app/services/static-chart-factory.service';
import * as Chart from 'chart.js';
import * as moment from 'moment';

@Component({
  selector: 'app-mock-parent',
  template: `
  <app-predictions-chart
    [predictions]="predictions"
  ></app-predictions-chart>`,
})
class MockParentComponent {
  @ViewChild(PredictionsChartComponent) childComponent: PredictionsChartComponent;
  public predictions: Prediction[];
}

describe('PredictionsChartComponent', () => {
  let parentComponent: MockParentComponent;
  let component: PredictionsChartComponent;
  let fixture: ComponentFixture<MockParentComponent>;
  let mockStaticChartFactory: jasmine.SpyObj<StaticChartFactoryService>;
  let chart: Chart;
  let predictions: Prediction[];

  beforeEach(async(() => {
    mockStaticChartFactory = jasmine.createSpyObj('staticChartFactory', ['createChart']);
    mockStaticChartFactory.createChart.and.callFake((...args) => {
      chart = new Chart(args[0], args[1]);
      return chart;
    });

    TestBed.configureTestingModule({
      declarations: [MockParentComponent, PredictionsChartComponent],
      providers: [
        { provide: StaticChartFactoryService, useValue: mockStaticChartFactory },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    predictions = [
      {
        timestamp: 1557936041,
        value: 800,
      },
      {
        timestamp: 1557939641,
        value: 400,
      },
    ];

    fixture = TestBed.createComponent(MockParentComponent);
    parentComponent = fixture.componentInstance;
    component = parentComponent.childComponent;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create a line graph', () => {
    const canvas = fixture.debugElement.query(By.css('canvas')).nativeElement;
    expect(mockStaticChartFactory.createChart).toHaveBeenCalledWith(canvas, jasmine.anything());
    expect(chart.config.type).toEqual('line');
    expect(chart.config.options.scales.xAxes[0].type).toEqual('time');
  });

  it('should update predictions based on input', () => {
    expect(chart.data.labels).toEqual([]);

    parentComponent.predictions = predictions;

    fixture.detectChanges();

    const expectedDataArray = predictions.map(({ timestamp, value }) => ({ x: moment.unix(timestamp).toDate(), y: value }));

    // const label = chart.data.datasets[0].label;
    const dataArray = chart.data.datasets[0].data;

    // expect(label).toEqual(expectedLabel);
    expect(dataArray).toEqual(expectedDataArray);
  });
});
