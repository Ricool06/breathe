import { Component, OnInit } from '@angular/core';
import * as fromRoot from '../../reducers';
import { Store, select } from '@ngrx/store';
import { LoadLatestLocationResults } from 'src/app/actions/latest-location-result.actions';
import { LatLngBounds } from 'leaflet';
import { Observable } from 'rxjs';
import { LocationResult } from 'src/app/model';
import { MatBottomSheet } from '@angular/material';
import { LocationResultDataSheetComponent } from 'src/app/shared/location-result-data-sheet/location-result-data-sheet.component';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
  public locationResults$: Observable<LocationResult[]>;

  constructor(private store: Store<fromRoot.State>, private bottomSheet: MatBottomSheet) {
    this.locationResults$ = this.store.pipe(select(fromRoot.selectLocationResults));
  }

  ngOnInit() {}

  public onMapBoundsChange(newBounds: LatLngBounds) {
    const coordinates = newBounds.getCenter();
    const radius = coordinates.distanceTo(newBounds.getNorthWest());
    this.store.dispatch(new LoadLatestLocationResults({ coordinates, radius }));
  }

  public onLocationResultClicked(locationResult: LocationResult) {
    this.bottomSheet.open(LocationResultDataSheetComponent, {
      panelClass: 'location-result-data-sheet',
      data: locationResult,
    });
  }
}
