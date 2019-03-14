import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { Chart } from 'chart.js';

import { SingleResultChartComponent } from './single-result-chart.component';
import { Measurement } from 'src/app/model';
import * as swagger from 'blueprints/swagger.json';
import { StaticChartFactoryService } from 'src/app/services/static-chart-factory.service';
import { By } from '@angular/platform-browser';

@Component({
  selector: 'app-mock-parent',
  template: `<app-single-result-chart
  [measurements]="measurements"
  ></app-single-result-chart>`,
})
class MockParentComponent {
  @ViewChild(SingleResultChartComponent) childComponent: SingleResultChartComponent;
  public measurements: Measurement[];
}

describe('SingleResultChartComponent', () => {
  let parentComponent: MockParentComponent;
  let component: SingleResultChartComponent;
  let fixture: ComponentFixture<MockParentComponent>;
  let mockMeasurements: Measurement[];
  let mockStaticChartFactory: jasmine.SpyObj<StaticChartFactoryService>;
  let chart: Chart;

  beforeEach(async(() => {
    mockStaticChartFactory = jasmine.createSpyObj('staticChartFactory', ['createChart']);
    mockStaticChartFactory.createChart.and.callFake((...args) => {
      chart = new Chart(args[0], args[1]);
      return chart;
    });

    TestBed.configureTestingModule({
      declarations: [MockParentComponent, SingleResultChartComponent],
      providers: [{ provide: StaticChartFactoryService, useValue: mockStaticChartFactory }],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    mockMeasurements =
      swagger.paths['/latest'].get.responses[200].examples['application/json'].results[0].measurements;

    fixture = TestBed.createComponent(MockParentComponent);
    parentComponent = fixture.componentInstance;
    component = parentComponent.childComponent;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create a polarArea chart', () => {
    const canvas = fixture.debugElement.query(By.css('canvas')).nativeElement;
    expect(mockStaticChartFactory.createChart).toHaveBeenCalledWith(canvas, jasmine.anything());
    expect(chart.config.type).toEqual('polarArea');
  });

  it('should update measurements based on input', () => {
    expect(chart.data.labels).toEqual([]);
    expect(chart.data.datasets[0].data).toEqual([]);

    parentComponent.measurements = mockMeasurements;

    fixture.detectChanges();

    const labels = mockMeasurements.map(measurement => `${measurement.parameter}: ${measurement.unit}`);
    const data = mockMeasurements.map(measurement => measurement.value);

    expect(chart.data.labels).toEqual(labels);
    expect(chart.data.datasets[0].data).toEqual(data);
  });
});
