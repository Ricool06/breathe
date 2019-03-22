import { TestBed, inject } from '@angular/core/testing';

import { HistoricalMeasurementsService } from './historical-measurements.service';
import { LatLng } from 'leaflet';
import { MeasurementsResult } from '../model';
import * as swagger from 'blueprints/swagger.json';
import * as moment from 'moment';
import { cloneDeep } from 'lodash';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpRequest } from '@angular/common/http';

describe('HistoricalMeasurementsService', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    httpMock = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    const service: HistoricalMeasurementsService = TestBed.get(HistoricalMeasurementsService);
    expect(service).toBeTruthy();
  });

  it('should be injectable', inject([HistoricalMeasurementsService], (service: HistoricalMeasurementsService) => {
    expect(service).toBeTruthy();
  }));

  it('should get historical measurements on a given page for a location and date range',
    inject([HistoricalMeasurementsService], (service: HistoricalMeasurementsService) => {
      const coordinates = new LatLng(39.2133, 117.1837);
      const dateTo = moment();
      const dateFrom = dateTo.subtract(7, 'days');
      const radius = 100;
      const limit = 10000;
      const page = 1;
      const goodResponse: { results: MeasurementsResult[] } =
        cloneDeep(swagger.paths['/measurements'].get.responses['200'].examples['application/json']);

      service.get(page, dateFrom, dateTo, coordinates).subscribe((results: MeasurementsResult[]) => {
        expect(results).toEqual(goodResponse.results);
      });

      const testRequest = httpMock.expectOne((req: HttpRequest<any>) => req.url === '/measurements');
      expect(testRequest.request.method).toEqual('GET');
      expect(testRequest.request.params.get('coordinates')).toEqual(`${coordinates.lat},${coordinates.lng}`);
      expect(testRequest.request.params.get('has_geo')).toEqual('true');
      expect(testRequest.request.params.get('radius')).toEqual(radius.toString());
      expect(testRequest.request.params.get('limit')).toEqual(limit.toString());
      expect(testRequest.request.params.get('date_from')).toEqual(dateFrom.toISOString(false));
      expect(testRequest.request.params.get('date_to')).toEqual(dateTo.toISOString(false));
      expect(testRequest.request.params.get('page')).toEqual(page.toString());

      testRequest.flush(goodResponse);

      httpMock.verify();
  }));
});
