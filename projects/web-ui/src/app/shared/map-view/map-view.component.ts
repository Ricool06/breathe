import { Component, OnInit, Input, OnChanges, SimpleChanges, EventEmitter, Output } from '@angular/core';
import * as L from 'leaflet';
import { LatestResult, Coordinates } from 'src/app/model';
import { from } from 'rxjs';
import { distinct, filter, takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.scss'],
})
export class MapViewComponent implements OnInit, OnChanges {
  @Input()
  public locationResults: LatestResult[];

  @Output()
  public mapBounds = new EventEmitter<L.LatLngBounds>();

  @Output()
  public clickedLocationResult = new EventEmitter<LatestResult>();

  private leafletMap: L.Map;
  private circles: Map<L.Circle, LatestResult>;

  constructor() {
    this.circles = new Map();
  }

  ngOnInit() {
    this.leafletMap = L.map('map').setView([39.2133, 117.1837], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.leafletMap);

    this.leafletMap.on('moveend', () => this.mapBounds.emit(this.leafletMap.getBounds()));
    this.mapBounds.emit(this.leafletMap.getBounds());
  }

  ngOnChanges(changes: SimpleChanges) {
    const currentLocationResults = changes.locationResults.currentValue || [];
    this.createNewCircles(currentLocationResults);
  }

  private createNewCircles(currentLocationResults: LatestResult[]) {
    from(currentLocationResults).pipe(
      distinct(result => `${result.coordinates.latitude},${result.coordinates.longitude}`),
      filter(result => this.circles.size === 0 || !this.alreadyHasCircle(result)),
      takeWhile(result => result !== currentLocationResults[currentLocationResults.length])
    ).subscribe(result => this.addCircleForLocationResult(result));
  }

  private alreadyHasCircle(locationResult: LatestResult): boolean {
    return Array.from(this.circles.keys())
      .some(circle => this.isAtCircle(locationResult, circle));
  }

  private isAtCircle(locationResult: LatestResult, circle: L.Circle): boolean {
    const resultLatLng = this.convertCoordinatesToLatLng(locationResult.coordinates);
    return !circle || circle.getLatLng().equals(resultLatLng);
  }

  private addCircleForLocationResult(locationResult: LatestResult) {
    const resultLatLng = this.convertCoordinatesToLatLng(locationResult.coordinates);
    const newCircle = L.circle(resultLatLng, {
      color: 'red',
      fillColor: '#f03',
      fillOpacity: 0.5,
      radius: 500,
    });

    newCircle.on('click', this.onCircleClick.bind(this));

    newCircle.addTo(this.leafletMap);
    this.circles.set(newCircle, locationResult);
  }

  private convertCoordinatesToLatLng(coordinates: Coordinates): L.LatLng {
    const { latitude, longitude } = coordinates;
    return new L.LatLng(latitude, longitude);
  }

  private onCircleClick(event: L.LeafletEvent) {
    this.clickedLocationResult.emit(this.circles.get(event.target));
  }
}
