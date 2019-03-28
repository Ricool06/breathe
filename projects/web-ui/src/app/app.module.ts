import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StoreModule } from '@ngrx/store';
import { reducers, metaReducers } from './reducers';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { EffectsModule } from '@ngrx/effects';
import { LatestLocationResultEffects } from './effects/latest-location-result.effects';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BaseUrlInterceptor } from './interceptors/base-url.interceptor';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LocationResultDataSheetComponent } from './shared/location-result-data-sheet/location-result-data-sheet.component';
import { SingleResultChartComponent } from './shared/single-result-chart/single-result-chart.component';
import { HumanizeDatePipe } from './pipes/humanize-date.pipe';
import { PruneRepeatedMeasurementsPipe } from './pipes/prune-repeated-measurements.pipe';
import { PruneNonLatestMeasurementsPipe } from './pipes/prune-non-latest-measurements.pipe';
import { CalculateAqiPipe } from './pipes/calculate-aqi.pipe';
import { AQI_STRATEGY_TOKEN } from './services/aqi-strategies/aqi-strategy';
import { Eaqi } from './services/aqi-strategies/eaqi.aqi-strategy';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HistoricalResultsChartComponent } from './shared/historical-results-chart/historical-results-chart.component';
import { HistoricalMeasurementEffects } from './effects/historical-measurement.effects';

@NgModule({
  declarations: [
    AppComponent,
    LocationResultDataSheetComponent,
    SingleResultChartComponent,
    HumanizeDatePipe,
    PruneRepeatedMeasurementsPipe,
    PruneNonLatestMeasurementsPipe,
    CalculateAqiPipe,
    HistoricalResultsChartComponent,
  ],
  entryComponents: [
    LocationResultDataSheetComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    StoreModule.forRoot(reducers, { metaReducers }),
    EffectsModule.forRoot([LatestLocationResultEffects, HistoricalMeasurementEffects]),
    HttpClientModule,
    !environment.production ? StoreDevtoolsModule.instrument() : [],
    BrowserAnimationsModule,
    FlexLayoutModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: BaseUrlInterceptor,
      multi: true,
    },
    { provide: AQI_STRATEGY_TOKEN, useClass: Eaqi, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
