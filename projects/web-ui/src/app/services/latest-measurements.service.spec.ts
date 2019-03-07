import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LatLng } from 'leaflet';
import { LatestMeasurementsService } from './latest-measurements.service';
import { HttpRequest } from '@angular/common/http';
import { LocationResult } from '../model';
const swagger = require('../../../blueprints/swagger.json');

describe('LatestMeasurementsService', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    httpMock = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    const service: LatestMeasurementsService = TestBed.get(LatestMeasurementsService);
    expect(service).toBeTruthy();
  });

  it('should be injectable', inject([LatestMeasurementsService], (service: LatestMeasurementsService) => {
    expect(service).toBeTruthy();
  }));

  it('should get air quality data in a radius',
    inject([LatestMeasurementsService], (service: LatestMeasurementsService) => {
      const coordinates = new LatLng(39.2133, 117.1837);
      const radius = 2500;
      const limit = 10000;
      const goodResponse: { results: LocationResult[] } =
        swagger.paths['/latest'].get.responses['200'].examples['application/json'];

      service.getInRadius(coordinates, radius).subscribe((results: LocationResult[]) => {
        expect(results).toEqual(goodResponse.results);
      });

      const testRequest = httpMock.expectOne((req: HttpRequest<any>) => req.url === '/latest');
      expect(testRequest.request.method).toEqual('GET');
      expect(testRequest.request.params.get('coordinates')).toEqual(`${coordinates.lat},${coordinates.lng}`);
      expect(testRequest.request.params.get('has_geo')).toEqual('true');
      expect(testRequest.request.params.get('radius')).toEqual(radius.toString());
      expect(testRequest.request.params.get('limit')).toEqual(limit.toString());

      testRequest.flush(goodResponse);

      httpMock.verify();
    }));
});
