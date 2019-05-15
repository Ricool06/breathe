import { TestBed, inject } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of } from 'rxjs';

import { PredictionEffects } from './prediction.effects';
import { PredictionsService } from '../services/predictions.service';
import { LatLng } from 'leaflet';
import { LoadPredictions, LoadPredictionsSuccess } from '../actions/prediction.actions';
import { hot, cold } from 'jasmine-marbles';

describe('PredictionEffects', () => {
  let actions$: Observable<any>;
  let effects: PredictionEffects;
  let predictionsService: jasmine.SpyObj<PredictionsService>;

  beforeEach(() => {
    predictionsService =
      jasmine.createSpyObj('predictionsService', ['get']);

    TestBed.configureTestingModule({
      providers: [
        PredictionEffects,
        provideMockActions(() => actions$),
        { provide: PredictionsService, useValue: predictionsService },
      ]
    });

    effects = TestBed.get(PredictionEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });


  it('should emit a success action on receiving predictions', () => {
    const predictions = [
      {
        timestamp: 1557936041,
        value: 800,
      },
      {
        timestamp: 1557939641,
        value: 400,
      },
    ];
    predictionsService.get.and.returnValue(of(predictions));

    const coordinates = new LatLng(1, 1);
    const parameter = 'pm10';

    const sourceAction = new LoadPredictions({ coordinates, parameter });
    const page1Action = new LoadPredictionsSuccess({ predictions });

    actions$ = hot('--i-', { i: sourceAction });
    const expectedActions$ = cold('--o-', { o: page1Action });

    expect(effects.getPredictions$).toBeObservable(expectedActions$);
    expect(predictionsService.get).toHaveBeenCalledWith(coordinates, parameter);
  });
});
