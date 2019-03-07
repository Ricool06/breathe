import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as L from 'leaflet';
import { LocationResult, Coordinates } from 'src/app/model';
import { from } from 'rxjs';
import { distinct, filter, takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.scss'],
})
export class MapViewComponent implements OnInit, OnChanges {
  @Input()
  public locationResults: LocationResult[];

  private leafletMap: L.Map;
  private circles: L.Circle[] = [];

  constructor() { }

  ngOnInit() {
    this.leafletMap = L.map('map').setView([51.505, -0.09], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.leafletMap);
  }

  ngOnChanges(changes: SimpleChanges) {
    const currentLocationResults = changes.locationResults.currentValue || [];
    this.createNewCircles(currentLocationResults);
  }

  private createNewCircles(currentLocationResults: LocationResult[]) {
    from(currentLocationResults).pipe(
      distinct(result => `${result.coordinates.latitude},${result.coordinates.longitude}`),
      filter(result => this.circles.length === 0 || !this.alreadyHasCircle(result)),
      takeWhile(result => result !== currentLocationResults[currentLocationResults.length])
    ).subscribe(result => this.addCircleForLocationResult(result));
  }

  private alreadyHasCircle(locationResult: LocationResult): boolean {
    return this.circles.some(circle => this.isAtCircle(locationResult, circle));
  }

  private isAtCircle(locationResult: LocationResult, circle: L.Circle): boolean {
    const resultLatLng = this.convertCoordinatesToLatLng(locationResult.coordinates);
    return !circle || circle.getLatLng().equals(resultLatLng);
  }

  private addCircleForLocationResult(locationResult: LocationResult) {
    const resultLatLng = this.convertCoordinatesToLatLng(locationResult.coordinates);
    const newCircle = L.circle(resultLatLng);

    this.circles.push(newCircle.addTo(this.leafletMap));
  }

  private convertCoordinatesToLatLng(coordinates: Coordinates): L.LatLng {
    const { latitude, longitude } = coordinates;
    return new L.LatLng(latitude, longitude);
  }
}
