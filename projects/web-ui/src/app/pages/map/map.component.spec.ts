import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapComponent } from './map.component';
import { By } from '@angular/platform-browser';
import { Component, Output, EventEmitter, Input } from '@angular/core';
import { MatBottomSheet } from '@angular/material';
import { StoreModule, Store } from '@ngrx/store';
import { LatLngBounds } from 'leaflet';
import { LoadLatestLocationResults, LoadLatestLocationResultsSuccess } from 'src/app/actions/latest-location-result.actions';
import * as fromRoot from '../../reducers';
import { State } from '../../reducers';
import { LocationResult } from 'src/app/model';
import * as swagger from '../../../../blueprints/swagger.json';
import { LocationResultDataSheetComponent } from 'src/app/shared/location-result-data-sheet/location-result-data-sheet.component';

@Component({
  selector: 'app-map-view',
  template: '',
})
class MockMapViewComponent {
  @Input()
  public locationResults: LocationResult[];

  @Output()
  public mapBounds = new EventEmitter<LatLngBounds>();

  @Output()
  public clickedLocationResult = new EventEmitter<LocationResult>();
}

describe('MapComponent', () => {
  let component: MapComponent;
  let fixture: ComponentFixture<MapComponent>;
  let store: Store<State>;
  let locationResults: LocationResult[];
  let bottomSheet: jasmine.SpyObj<MatBottomSheet>;

  beforeEach(async(() => {
    bottomSheet = jasmine.createSpyObj('bottomSheet', ['open']);

    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({
        ...fromRoot.reducers,
      })],
      declarations: [MapComponent, MockMapViewComponent],
      providers: [
        { provide: MockMapViewComponent, useClass: MockMapViewComponent },
        { provide: MatBottomSheet, useValue: bottomSheet },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    locationResults =
      swagger.paths['/latest'].get.responses[200].examples['application/json'].results;

    fixture = TestBed.createComponent(MapComponent);
    component = fixture.componentInstance;

    store = TestBed.get(Store);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a map presentational component', () => {
    expect(fixture.debugElement.query(By.css('app-map-view'))).toBeTruthy();
  });

  it('should dispatch an action to load new location results when the map emits an event', () => {
    const mockMapViewComponent: MockMapViewComponent = fixture.debugElement
      .query(By.directive(MockMapViewComponent)).componentInstance;

    const mapBounds = new LatLngBounds([0, 0], [4, 8]);
    const radius = mapBounds.getCenter().distanceTo(mapBounds.getNorthWest());
    const action = new LoadLatestLocationResults({ coordinates: mapBounds.getCenter(), radius });
    spyOn(store, 'dispatch').and.stub();

    mockMapViewComponent.mapBounds.emit(mapBounds);

    expect(store.dispatch).toHaveBeenCalledWith(action);
  });

  it('should deliver location results to the view', () => {
    const mockMapViewComponent: MockMapViewComponent = fixture.debugElement
      .query(By.directive(MockMapViewComponent)).componentInstance;

    expect(mockMapViewComponent.locationResults).toEqual([]);

    const action = new LoadLatestLocationResultsSuccess({ locationResults });
    store.dispatch(action);

    component.locationResults$.subscribe(data => expect(data).toBe(locationResults));

    fixture.detectChanges();
    expect(mockMapViewComponent.locationResults).toEqual(locationResults);
  });

  it('should open data sheet when location result is emitted from map view', () => {
    const mockMapViewComponent: MockMapViewComponent = fixture.debugElement
      .query(By.directive(MockMapViewComponent)).componentInstance;

    mockMapViewComponent.clickedLocationResult.emit(locationResults[0]);

    expect(bottomSheet.open).toHaveBeenCalledWith(LocationResultDataSheetComponent, {
      panelClass: 'location-result-data-sheet',
      data: locationResults[0],
    });
  });
});
