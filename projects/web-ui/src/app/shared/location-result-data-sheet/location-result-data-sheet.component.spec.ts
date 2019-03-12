import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationResultDataSheetComponent } from './location-result-data-sheet.component';
import * as swagger from '../../../../blueprints/swagger.json';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material';
import { LocationResult } from 'src/app/model';

describe('LocationResultDataSheetComponent', () => {
  let component: LocationResultDataSheetComponent;
  let fixture: ComponentFixture<LocationResultDataSheetComponent>;
  let locationResult: LocationResult;

  beforeEach(async(() => {
    locationResult =
      swagger.paths['/latest'].get.responses[200].examples['application/json'].results[0];

    TestBed.configureTestingModule({
      declarations: [LocationResultDataSheetComponent],
      providers: [{ provide: MAT_BOTTOM_SHEET_DATA, useValue: locationResult }],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationResultDataSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display data from a stop and search', () => {
    const dataSheetHeader = fixture.nativeElement.querySelector('h1');
    const { city, country } = locationResult;
    expect(dataSheetHeader.textContent).toBe(`${city}, ${country}`);
  });
});
