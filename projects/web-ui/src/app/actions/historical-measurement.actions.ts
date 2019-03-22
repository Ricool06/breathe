import { Action } from '@ngrx/store';
import { MeasurementsResult } from '../model';
import { LatLng } from 'leaflet';
import { Moment } from 'moment';

export enum HistoricalMeasurementActionTypes {
  LoadHistoricalMeasurements = '[HistoricalMeasurement] Load HistoricalMeasurements',
  LoadHistoricalMeasurementsSuccess = '[HistoricalMeasurement] Load HistoricalMeasurements Success',
  LoadHistoricalMeasurementsFailure = '[HistoricalMeasurement] Load HistoricalMeasurements Failure',
}

export class LoadHistoricalMeasurements implements Action {
  readonly type = HistoricalMeasurementActionTypes.LoadHistoricalMeasurements;
  constructor(public payload: { coordinates: LatLng, dateFrom: Moment, dateTo: Moment }) { }
}

export class LoadHistoricalMeasurementsSuccess implements Action {
  readonly type = HistoricalMeasurementActionTypes.LoadHistoricalMeasurementsSuccess;
  constructor(public payload: { results: MeasurementsResult[] }) { }
}

export class LoadHistoricalMeasurementsFailure implements Action {
  readonly type = HistoricalMeasurementActionTypes.LoadHistoricalMeasurementsFailure;
  constructor(public payload: { error: any }) { }
}

export type HistoricalMeasurementActions = LoadHistoricalMeasurements
  | LoadHistoricalMeasurementsSuccess
  | LoadHistoricalMeasurementsFailure;

