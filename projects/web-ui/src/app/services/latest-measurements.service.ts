import { Injectable } from '@angular/core';
import { LatLng } from 'leaflet';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Result } from '../model';

@Injectable({
  providedIn: 'root',
})
export class LatestMeasurementsService {
  constructor(private httpClient: HttpClient) { }

  getInRadius(coordinates: LatLng, radiusInMetres: number): Observable<Result[]> {
    return this.httpClient.get('/latest', {
      params: {
        coordinates: `${coordinates.lat},${coordinates.lng}`,
        radius: radiusInMetres.toString(),
        has_geo: 'true',
      },
    }).pipe(
      map((data: any) => data.results)
    );
  }
}
