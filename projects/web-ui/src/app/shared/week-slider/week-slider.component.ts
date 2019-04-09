import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment';
import { MomentRange } from 'src/app/model';
import { MatSliderChange } from '@angular/material';

@Component({
  selector: 'app-week-slider',
  templateUrl: './week-slider.component.html',
  styleUrls: ['./week-slider.component.scss'],
})
export class WeekSliderComponent implements OnInit {

  @Output()
  dateRange = new EventEmitter<MomentRange>();

  constructor() { }

  ngOnInit() {
    this.emitMomentRange(0);
  }

  changeDateRange(sliderChange: MatSliderChange) {
    const { value } = sliderChange;

    this.emitMomentRange(value);
  }

  formatThumbLabel(weeksAgo: number): string {
    return `${weeksAgo}w`;
  }

  private emitMomentRange(weeksAgo: number) {
    const dateTo = moment().subtract(weeksAgo, 'weeks');
    const dateFrom = dateTo.clone().subtract(7, 'days');

    this.dateRange.emit({dateFrom, dateTo});
  }
}
