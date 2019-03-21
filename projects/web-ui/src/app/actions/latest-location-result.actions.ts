import { Action } from '@ngrx/store';
import { LatestResult } from '../model';
import { LatLng } from 'leaflet';

export enum LatestLocationResultActionTypes {
  LoadLatestLocationResults = '[LatestLocationResult] Load LatestLocationResults',
  LoadLatestLocationResultsSuccess = '[LatestLocationResult] Load LatestLocationResults Success',
  LoadLatestLocationResultsFailure = '[LatestLocationResult] Load LatestLocationResults Failure',
}

export class LoadLatestLocationResults implements Action {
  readonly type = LatestLocationResultActionTypes.LoadLatestLocationResults;
  constructor(public payload: { coordinates: LatLng, radius: number }) { }
}

export class LoadLatestLocationResultsSuccess implements Action {
  readonly type = LatestLocationResultActionTypes.LoadLatestLocationResultsSuccess;
  constructor(public payload: { locationResults: LatestResult[] }) { }
}

export class LoadLatestLocationResultsFailure implements Action {
  readonly type = LatestLocationResultActionTypes.LoadLatestLocationResultsFailure;
  constructor(public payload: { error: any }) { }
}

export type LatestLocationResultActions =
  LoadLatestLocationResults |
  LoadLatestLocationResultsSuccess |
  LoadLatestLocationResultsFailure;
