import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material';
import { LatestResult } from 'src/app/model';

@Component({
  selector: 'app-location-result-data-sheet',
  templateUrl: './location-result-data-sheet.component.html',
  styleUrls: ['./location-result-data-sheet.component.scss'],
})
export class LocationResultDataSheetComponent {

  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public locationResult: LatestResult) { }

}
