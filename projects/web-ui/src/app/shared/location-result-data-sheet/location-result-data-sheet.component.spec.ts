import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationResultDataSheetComponent } from './location-result-data-sheet.component';
import * as swagger from '../../../../blueprints/swagger.json';
import { MAT_BOTTOM_SHEET_DATA, MatGridListModule } from '@angular/material';
import { LocationResult, Measurement } from 'src/app/model';
import { Component, Input } from '@angular/core';
import { SingleResultChartComponent } from '../single-result-chart/single-result-chart.component';
import { By } from '@angular/platform-browser';

@Component({
  selector: 'app-single-result-chart',
  template: '',
}) class MockSingleResultChartComponent {
  @Input()
  measurements: Measurement[];
}

describe('LocationResultDataSheetComponent', () => {
  let component: LocationResultDataSheetComponent;
  let fixture: ComponentFixture<LocationResultDataSheetComponent>;
  let locationResult: LocationResult;

  beforeEach(async(() => {
    locationResult =
      swagger.paths['/latest'].get.responses[200].examples['application/json'].results[0];

    TestBed.configureTestingModule({
      declarations: [LocationResultDataSheetComponent, MockSingleResultChartComponent],
      imports: [MatGridListModule],
      providers: [
        { provide: MAT_BOTTOM_SHEET_DATA, useValue: locationResult },
        { provide: SingleResultChartComponent, useClass: MockSingleResultChartComponent },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationResultDataSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display city & country from a location result', () => {
    const dataSheetHeader = fixture.nativeElement.querySelector('h1');
    const { city, country } = locationResult;
    expect(dataSheetHeader.textContent).toBe(`${city}, ${country}`);
  });

  it('should push measurements to the single result chart', () => {
    const mockChart: MockSingleResultChartComponent =
      fixture.debugElement.query(By.directive(MockSingleResultChartComponent)).componentInstance;
    const { measurements } = locationResult;
    expect(mockChart.measurements).toEqual(measurements);
  });
});
