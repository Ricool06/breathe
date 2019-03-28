import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Chart, ChartPoint } from 'chart.js';

import { HistoricalResultsChartComponent } from './historical-results-chart.component';
import { StaticChartFactoryService } from 'src/app/services/static-chart-factory.service';
import { By } from '@angular/platform-browser';
import { ViewChild, Component } from '@angular/core';
import { MeasurementsResult } from 'src/app/model';
import * as swagger from 'blueprints/swagger.json';
import { cloneDeep, uniqWith, isEqual, uniq } from 'lodash';
import * as moment from 'moment';

@Component({
  selector: 'app-mock-parent',
  template: `
  <app-historical-results-chart
    [measurementsResults]="measurementsResults"
  ></app-historical-results-chart>`,
})
class MockParentComponent {
  @ViewChild(HistoricalResultsChartComponent) childComponent: HistoricalResultsChartComponent;
  public measurementsResults: MeasurementsResult[];
}

describe('HistoricalResultsChartComponent', () => {
  let parentComponent: MockParentComponent;
  let component: HistoricalResultsChartComponent;
  let fixture: ComponentFixture<MockParentComponent>;
  let mockStaticChartFactory: jasmine.SpyObj<StaticChartFactoryService>;
  let chart: Chart;
  let mockMeasurementsResults: MeasurementsResult[];

  beforeEach(async(() => {
    mockStaticChartFactory = jasmine.createSpyObj('staticChartFactory', ['createChart']);
    mockStaticChartFactory.createChart.and.callFake((...args) => {
      chart = new Chart(args[0], args[1]);
      return chart;
    });

    TestBed.configureTestingModule({
      declarations: [MockParentComponent, HistoricalResultsChartComponent],
      providers: [
        { provide: StaticChartFactoryService, useValue: mockStaticChartFactory },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    mockMeasurementsResults =
      cloneDeep(swagger.paths['/measurements'].get.responses[200].examples['application/json'].results);

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
  });

  it('should update measurements based on input', () => {
    expect(chart.data.labels).toEqual([]);

    const duplicateParameterResult: MeasurementsResult = {
      ...cloneDeep(mockMeasurementsResults[0]),
      date: {
        utc: moment(mockMeasurementsResults[0].date.utc).subtract(1, 'day').toISOString(),
        local: moment(mockMeasurementsResults[0].date.local).subtract(1, 'day').toISOString(),
      },
    };

    mockMeasurementsResults.push(duplicateParameterResult);

    parentComponent.measurementsResults = mockMeasurementsResults;

    fixture.detectChanges();

    const expectedLabels = uniq(mockMeasurementsResults.map(result => result.parameter));

    const expectedDataArrayMap = new Map<string, ChartPoint[]>();
    expectedLabels.forEach(label => expectedDataArrayMap.set(label, []));

    mockMeasurementsResults.forEach(({ parameter, value, date }) => {
      expectedDataArrayMap.get(parameter).push({ x: date.utc.toString(), y: value });
    });
    const expectedDataArrays = Array.from(expectedDataArrayMap.values());

    const labels = chart.data.datasets.map(dataset => dataset.label);
    const dataArrays = chart.data.datasets.map(dataset => dataset.data);

    expect(labels).toEqual(expectedLabels);
    expect(dataArrays).toEqual(expectedDataArrays);
  });
});
