import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MapRoutingModule } from './map-routing.module';
import { MapComponent } from './map.component';
import { MapViewComponent } from 'src/app/shared/map-view/map-view.component';
import { MatBottomSheetModule } from '@angular/material';

@NgModule({
  declarations: [MapComponent, MapViewComponent],
  imports: [
    CommonModule,
    MapRoutingModule,
    MatBottomSheetModule,
  ],
})
export class MapModule { }
