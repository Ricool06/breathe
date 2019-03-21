import { TestBed, inject } from '@angular/core/testing';

import { HistoricalMeasurementsService } from './historical-measurements.service';
import { LatLng } from 'leaflet';
import { MeasurementsResult } from '../model';
import * as swagger from 'blueprints/swagger.json';
import * as moment from 'moment';
import { cloneDeep } from 'lodash';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpRequest } from '@angular/common/http';

fdescribe('HistoricalMeasurementsService', () => {
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

  it('should get historical measurements at a given location between a given date range',
    inject([HistoricalMeasurementsService], (service: HistoricalMeasurementsService) => {
      const coordinates = new LatLng(39.2133, 117.1837);
      const dateTo = moment();
      const dateFrom = dateTo.subtract(7, 'days');
      const radius = 100;
      const limit = 10000;
      const goodResponse1: { results: MeasurementsResult[] } =
        cloneDeep(swagger.paths['/measurements'].get.responses['200'].examples['application/json']);
      const goodResponse2: { results: MeasurementsResult[] } = cloneDeep(goodResponse1);

      const expectedResultsArray = goodResponse1.results.concat(goodResponse2.results);

      service.get(dateFrom, dateTo, coordinates).subscribe((results: MeasurementsResult[]) => {
        expect(results).toEqual(expectedResultsArray);
      });

      let testRequest = httpMock.expectOne((req: HttpRequest<any>) => req.url === '/measurements');
      expect(testRequest.request.method).toEqual('GET');
      expect(testRequest.request.params.get('coordinates')).toEqual(`${coordinates.lat},${coordinates.lng}`);
      expect(testRequest.request.params.get('has_geo')).toEqual('true');
      expect(testRequest.request.params.get('radius')).toEqual(radius.toString());
      expect(testRequest.request.params.get('limit')).toEqual(limit.toString());
      expect(testRequest.request.params.get('date_from')).toEqual(dateFrom.toISOString(false));
      expect(testRequest.request.params.get('date_to')).toEqual(dateTo.toISOString(false));
      expect(testRequest.request.params.get('page')).toBe('1');

      testRequest.flush(goodResponse1);

      testRequest = httpMock.expectOne((req: HttpRequest<any>) => req.url === '/measurements');
      expect(testRequest.request.method).toEqual('GET');
      expect(testRequest.request.params.get('coordinates')).toEqual(`${coordinates.lat},${coordinates.lng}`);
      expect(testRequest.request.params.get('has_geo')).toEqual('true');
      expect(testRequest.request.params.get('radius')).toEqual(radius.toString());
      expect(testRequest.request.params.get('limit')).toEqual(limit.toString());
      expect(testRequest.request.params.get('date_from')).toEqual(dateFrom.toISOString(false));
      expect(testRequest.request.params.get('date_to')).toEqual(dateTo.toISOString(false));
      expect(testRequest.request.params.get('page')).toBe('2');

      httpMock.verify();
  }));
});
