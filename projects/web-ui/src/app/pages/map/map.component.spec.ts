import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapComponent } from './map.component';
import { By } from '@angular/platform-browser';
import { Component } from '@angular/core';

@Component({
  selector: 'app-map-view',
  template: '',
})
class MockMapViewComponent {}

describe('MapComponent', () => {
  let component: MapComponent;
  let fixture: ComponentFixture<MapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MapComponent, MockMapViewComponent],
      providers: [
        { provide: MockMapViewComponent, useClass: MockMapViewComponent },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a map presentational component', () => {
    expect(fixture.debugElement.query(By.css('app-map-view'))).toBeTruthy();
  });
});
