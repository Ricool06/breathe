import { Injectable } from '@angular/core';
import { LatLng } from 'leaflet';
import { Prediction } from '../model';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PredictionsService {
  constructor(private httpClient: HttpClient) { }

  get(coordinates: LatLng, parameter: string): Observable<Prediction[]> {
    return this.httpClient.get<{ predictions: Prediction[] }>(
      '/predict', {
        params: {
          latitude: coordinates.lat.toString(),
          longitude: coordinates.lng.toString(),
          parameter,
        },
      }).pipe(map(response => response.predictions));
  }
}
