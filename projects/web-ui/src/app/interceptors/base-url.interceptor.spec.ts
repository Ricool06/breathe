import { TestBed, inject } from '@angular/core/testing';
import { BaseUrlInterceptor } from './base-url.interceptor';
import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('Interceptor: BaseUrl', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{
        provide: HTTP_INTERCEPTORS,
        useClass: BaseUrlInterceptor,
        multi: true,
      }],
    });

    httpMock = TestBed.get(HttpTestingController);
  });

  it(
    'should replace the base url in any request with the env var for the base url',
    inject([HttpClient], (httpClient: HttpClient) => {
      const mockPath = '/give-me-a-base-url?someParam=12345678';

      const { host, port, rootPath } = environment.openaqApi;
      const expectedUrl = `${host}:${port}${rootPath}${mockPath}`;

      httpClient.get(mockPath).subscribe(response => expect(response).toBeTruthy());
      const receivedRequest = httpMock.expectOne(expectedUrl);

      receivedRequest.flush({ data: '¯\_(ツ)_/¯' });
      httpMock.verify();
    })
  );

  it(
    'should replace the base url in a predict request with the env var for the prediction API base url',
    inject([HttpClient], (httpClient: HttpClient) => {
      const mockPath = '/predict?someParam=12345678';

      const { host, port, rootPath } = environment.predictionApi;
      const expectedUrl = `${host}:${port}${rootPath}${mockPath}`;

      httpClient.get(mockPath).subscribe(response => expect(response).toBeTruthy());
      const receivedRequest = httpMock.expectOne(expectedUrl);

      receivedRequest.flush({ data: '¯\_(ツ)_/¯' });
      httpMock.verify();
    })
  );
});
