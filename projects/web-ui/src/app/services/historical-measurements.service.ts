import { Injectable } from '@angular/core';
import { Moment } from 'moment';
import { LatLng } from 'leaflet';
import { HttpClient } from '@angular/common/http';
import { of, Observable } from 'rxjs';
import { expand, takeUntil, filter, map, takeWhile } from 'rxjs/operators';
import { MeasurementsResult } from '../model';

@Injectable({
  providedIn: 'root',
})
export class HistoricalMeasurementsService {
  constructor(private httpClient: HttpClient) { }

  get(dateFrom: Moment, dateTo: Moment, coordinates: LatLng): any {
    return of(1).pipe(
      expand((page) => this.request(page, dateFrom, dateTo, coordinates)),
      takeWhile(results => results.length > 0),
    );
  }

  private request(page: number, dateFrom: Moment, dateTo: Moment, coordinates: LatLng): Observable<MeasurementsResult[]> {
    return this.httpClient.get<{ results: MeasurementsResult[] }>(
      '/measurements', {
        params: {
          coordinates: `${coordinates.lat},${coordinates.lng}`,
          radius: '100',
          has_geo: 'true',
          limit: '10000',
          date_from: dateFrom.toISOString(false),
          date_to: dateTo.toISOString(false),
        },
      }).pipe(map(response => response.results));
  }

  private isLastPage(results: MeasurementsResult[]) {
    return results.length === 0;
  }
}
