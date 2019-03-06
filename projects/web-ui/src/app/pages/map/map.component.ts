import { Component, OnInit } from '@angular/core';
import * as fromRoot from '../../reducers';
import { Store, select } from '@ngrx/store';
import { LoadLatestLocationResults } from 'src/app/actions/latest-location-result.actions';
import { LatLngBounds } from 'leaflet';
import { Observable } from 'rxjs';
import { LocationResult } from 'src/app/model';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
  public locationResults$: Observable<LocationResult[]>;

  constructor(private store: Store<fromRoot.State>) {
    this.locationResults$ = this.store.pipe(select(fromRoot.selectLocationResults));
  }

  ngOnInit() {}

  public onMapBoundsChange(newBounds: LatLngBounds) {
    const coordinates = newBounds.getCenter();
    const radius = coordinates.distanceTo(newBounds.getNorthWest());
    this.store.dispatch(new LoadLatestLocationResults({ coordinates, radius }));
  }
}
