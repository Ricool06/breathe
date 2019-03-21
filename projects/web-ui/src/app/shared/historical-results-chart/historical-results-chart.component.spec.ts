import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoricalResultsChartComponent } from './historical-results-chart.component';

describe('HistoricalResultsChartComponent', () => {
  let component: HistoricalResultsChartComponent;
  let fixture: ComponentFixture<HistoricalResultsChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HistoricalResultsChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoricalResultsChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
