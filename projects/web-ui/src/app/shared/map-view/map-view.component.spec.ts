import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapViewComponent } from './map-view.component';
import { Component, ViewChild } from '@angular/core';
import * as swagger from '../../../../blueprints/swagger.json';
import { LatestResult } from 'src/app/model';
import * as L from 'leaflet';

@Component({
  selector: 'app-mock-parent',
  template: `<app-map-view
  [locationResults]="locationResults"
  (mapBounds)="onMapBoundsChange($event)"
  (clickedLocationResult)="onCircleClick($event)"
  ></app-map-view>`,
})
class MockParentComponent {
  @ViewChild(MapViewComponent) childComponent: MapViewComponent;
  locationResults: LatestResult[];
  mapBounds: L.LatLngBounds;
  clickedLocationResult: LatestResult;

  onMapBoundsChange(newMapBounds: L.LatLngBounds) {
    this.mapBounds = newMapBounds;
  }

  onCircleClick(clickedLocationResult: LatestResult) {
    this.clickedLocationResult = clickedLocationResult;
  }
}

describe('MapViewComponent', () => {
  let parentComponent: MockParentComponent;
  let component: MapViewComponent;
  let fixture: ComponentFixture<MockParentComponent>;
  let leafletMap: L.Map;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapViewComponent, MockParentComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    const originalMapFunc = L.map;
    spyOn(L, 'map').and.callFake((...args) => {
      leafletMap = originalMapFunc(args[0], args[1]);
      return leafletMap;
    });

    fixture = TestBed.createComponent(MockParentComponent);
    parentComponent = fixture.componentInstance;
    component = parentComponent.childComponent;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should contain a Leaflet map', () => {
    const compiled = fixture.nativeElement;
    const leafletMapElement = compiled.querySelector('#map > .leaflet-pane');

    expect(leafletMapElement).toBeTruthy();
  });

  it('should have tile layer set up', () => {
    const compiled = fixture.nativeElement;
    const aTile = compiled.querySelector('img.leaflet-tile');

    expect(aTile).toBeTruthy();
  });

  it('should emit event from mapBounds at startup', async () => {
    await fixture.whenStable();
    expect(parentComponent.mapBounds).toBeDefined();
  });

  it('should emit event from mapBounds when map bounds change', (done) => {
    spyOn(parentComponent, 'onMapBoundsChange');
    const mockBounds = new L.LatLngBounds([52, 45], [1, 1]);

    fixture.whenStable().then(() => {
      leafletMap.flyToBounds(mockBounds);
      leafletMap.on('moveend', () => {
        fixture.detectChanges();
        expect(parentComponent.onMapBoundsChange).toHaveBeenCalledWith(jasmine.any(L.LatLngBounds));
        done();
      });
    });
  });

  it('should add circles at each location result idempotently', async () => {
    const locationResults: LatestResult[] =
      swagger.paths['/latest'].get.responses[200].examples['application/json'].results;

    const originalCircleFunc = L.circle;
    const circles: L.Circle[] = [];

    spyOn(L, 'circle').and.callFake((...args) => {
      const circle = originalCircleFunc(args[0], args[1]);
      circles.push(circle);
      spyOn(circle, 'addTo').and.callThrough();
      return circle;
    });

    expect(circles.length).toBe(0);

    parentComponent.locationResults = locationResults;

    fixture.detectChanges();
    await fixture.whenStable();

    expect(circles.length).toBe(locationResults.length);
    circles.map(c => expect(c.addTo).toHaveBeenCalledWith(leafletMap));

    const extraResult: LatestResult = { ...locationResults[0] };
    extraResult.coordinates.latitude = 50;
    extraResult.coordinates.longitude = 10;

    locationResults.push(extraResult);
    parentComponent.locationResults = [...locationResults];

    fixture.detectChanges();
    await fixture.whenStable();

    expect(circles.length).toBe(parentComponent.locationResults.length);
    circles.map(c => expect(c.addTo).toHaveBeenCalledWith(leafletMap));
  });

  it('should emit the location result for a clicked circle', async () => {
    const locationResults: LatestResult[] =
      swagger.paths['/latest'].get.responses[200].examples['application/json'].results;

    const originalCircleFunc = L.circle;
    let circle: L.Circle;

    spyOn(L, 'circle').and.callFake((...args) => {
      circle = originalCircleFunc(args[0], args[1]);
      return circle;
    });

    parentComponent.locationResults = locationResults;

    fixture.detectChanges();
    await fixture.whenStable();

    circle.fire('click');

    expect(parentComponent.clickedLocationResult).toBe(locationResults[0]);
  });
});
