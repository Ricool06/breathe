import { TestBed, inject } from '@angular/core/testing';

import { PredictionsService } from './predictions.service';
import { LatLng } from 'leaflet';
import { Prediction } from '../model';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpRequest } from '@angular/common/http';

describe('PredictionsService', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    httpMock = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    const service: PredictionsService = TestBed.get(PredictionsService);
    expect(service).toBeTruthy();
  });


  it('should get predictions for a location and parameter',
    inject([PredictionsService], (service: PredictionsService) => {
      const coordinates = new LatLng(39.2133, 117.1837);
      const parameter = 'pm25';

      const goodResponse: { predictions: Prediction[] } = {
        predictions: [
          {
            timestamp: 1557936041,
            value: 800,
          },
          {
            timestamp: 1557939641,
            value: 400,
          },
        ],
      };

      service.get(coordinates, parameter).subscribe((predictions: Prediction[]) => {
        expect(predictions).toEqual(goodResponse.predictions);
      });

      const testRequest = httpMock.expectOne((req: HttpRequest<any>) => req.url === '/predict');
      expect(testRequest.request.method).toEqual('GET');
      expect(testRequest.request.params.get('latitude')).toEqual(coordinates.lat.toString());
      expect(testRequest.request.params.get('longitude')).toEqual(coordinates.lng.toString());
      expect(testRequest.request.params.get('parameter')).toEqual(parameter);

      testRequest.flush(goodResponse);

      httpMock.verify();
  }));
});
