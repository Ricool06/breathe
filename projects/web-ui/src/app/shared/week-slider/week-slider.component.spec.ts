import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WeekSliderComponent } from './week-slider.component';
import { Component, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { MomentRange } from 'src/app/model';
import { MatSlider, MatSliderModule, MatSliderChange } from '@angular/material';
import { By, HAMMER_LOADER } from '@angular/platform-browser';

@Component({
  selector: 'app-mock-parent',
  template: '<app-week-slider (dateRange)="setDateRange($event)"></app-week-slider>',
}) class MockParentComponent {
  public dateRange: MomentRange;
  setDateRange(value: MomentRange) { this.dateRange = value; }
}

describe('WeekSliderComponent', () => {
  let currentDate: moment.Moment;
  let parentComponent: MockParentComponent;
  let fixture: ComponentFixture<MockParentComponent>;
  let slider: MatSlider;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MockParentComponent, WeekSliderComponent],
      imports: [MatSliderModule],
      providers: [{ provide: HAMMER_LOADER, useValue: () => new Promise(() => {})}],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    currentDate = moment();
    jasmine.clock().mockDate(currentDate.toDate());

    fixture = TestBed.createComponent(MockParentComponent);
    parentComponent = fixture.componentInstance;

    slider = fixture.debugElement.query(By.directive(MatSlider)).componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(parentComponent).toBeTruthy();
  });

  it('should set up the slider with appropriate initial values', () => {
    const { min, max, value, invert } = slider;

    expect(min).toBe(0);
    expect(max).toBe(13);
    expect(value).toBe(0);
    expect(invert).toBe(true);
  });

  it('should emit the week selected', () => {
    const expectedWeeksAgo = 8;
    const dateTo = currentDate.clone().subtract(expectedWeeksAgo, 'weeks');
    const dateFrom = dateTo.clone().subtract(7, 'days');

    slider.change.emit({ source: slider, value: expectedWeeksAgo });

    expect(parentComponent.dateRange).toEqual({dateFrom, dateTo});
  });

  it('should emit the last week on creation', () => {
    const dateFrom = currentDate.clone().subtract(7, 'days');

    expect(parentComponent.dateRange).toEqual({ dateFrom, dateTo: currentDate });

    jasmine.clock().uninstall();
  });
});
