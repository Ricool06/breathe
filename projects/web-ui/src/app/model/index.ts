import { Moment } from 'moment';

export interface Measurement {
    parameter: string;
    value: number;
    lastUpdated: Moment;
    unit: string;
    sourceName: string;
    averagingPeriod: {
        value: number;
        unit: string;
    };
}

export interface Result {
    location: string;
    city: string;
    country: string;
    distance: number;
    measurements: Measurement[];
    coordinates: {
        latitude: number;
        longitude: number;
    };
}
