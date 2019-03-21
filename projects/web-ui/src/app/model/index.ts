import { Moment } from 'moment';

export interface AveragingPeriod {
  value: number;
  unit: string;
}

export interface Measurement {
  parameter: string;
  value: number;
  lastUpdated: Moment | string;
  unit: string;
  sourceName: string;
  averagingPeriod: AveragingPeriod;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LatestResult {
  location: string;
  city: string;
  country: string;
  distance: number;
  measurements: Measurement[];
  coordinates: Coordinates;
}

export interface MeasurementsResultDate {
  utc: Moment | string;
  local: Moment | string;
}

export interface MeasurementsResult {
  location: string;
  city: string;
  country: string;
  coordinates: Coordinates;
  parameter: string;
  value: number;
  unit: string;
  date: MeasurementsResultDate;
}

export enum PollutionDescriptor {
  'Unknown',
  'Good',
  'Fair',
  'Moderate',
  'Poor',
  'Very poor',
}

export interface PollutantRange {
  min: number;
  max: number;
  descriptor: PollutionDescriptor;
}
