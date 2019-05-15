import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material';
import { LatestResult, MeasurementsResult, MomentRange, Prediction } from 'src/app/model';
import { Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';
import * as fromRoot from '../../reducers';
import { LoadHistoricalMeasurements } from 'src/app/actions/historical-measurement.actions';
import { LatLng } from 'leaflet';
import * as moment from 'moment';
import { LoadPredictions } from 'src/app/actions/prediction.actions';

@Component({
  selector: 'app-location-result-data-sheet',
  templateUrl: './location-result-data-sheet.component.html',
  styleUrls: ['./location-result-data-sheet.component.scss'],
})
export class LocationResultDataSheetComponent implements OnInit {
  public measurementsResults$: Observable<MeasurementsResult[]>;
  public predictions$: Observable<Prediction[]>;

  constructor(private store: Store<fromRoot.State>, @Inject(MAT_BOTTOM_SHEET_DATA) public locationResult: LatestResult) {
    this.measurementsResults$ = this.store.pipe(select(fromRoot.selectMeasurementsResults));
    this.predictions$ = this.store.pipe(select(fromRoot.selectPredictions));
  }

  ngOnInit() {
    const { latitude, longitude } = this.locationResult.coordinates;
    const coordinates = new LatLng(latitude, longitude);
    const dateTo = moment();
    const dateFrom = dateTo.clone().subtract(7, 'days');

    this.store.dispatch(new LoadHistoricalMeasurements({ coordinates, dateFrom, dateTo }));
    this.store.dispatch(new LoadPredictions({ coordinates, parameter: 'pm25' }));
  }

  changeDateRange(dateRange: MomentRange) {
    const { latitude, longitude } = this.locationResult.coordinates;
    const coordinates = new LatLng(latitude, longitude);
    const { dateFrom, dateTo } = dateRange;

    this.store.dispatch(new LoadHistoricalMeasurements({ coordinates, dateFrom, dateTo }));
  }
}
