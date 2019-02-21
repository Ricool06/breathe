import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapViewComponent } from './map-view.component';

describe('MapViewComponent', () => {
  let component: MapViewComponent;
  let fixture: ComponentFixture<MapViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapViewComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should contain a Leaflet map', () => {
    const compiled = fixture.nativeElement;
    const leafletMap = compiled.querySelector('#map > .leaflet-pane');

    expect(leafletMap).toBeTruthy();
  });

  it('should have tile layer set up', () => {
    const compiled = fixture.nativeElement;
    const aTile = compiled.querySelector('img.leaflet-tile');

    expect(aTile).toBeTruthy();
  });
});
