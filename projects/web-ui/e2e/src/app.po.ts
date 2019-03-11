import { browser, by, element } from 'protractor';

export class MapPage {
  navigateTo() {
    return browser.get(browser.baseUrl);
  }

  getMapElement() {
    return element(by.css('.leaflet-container'));
  }

  getFirstMapTile() {
    return element(by.css('img.leaflet-tile'));
  }

  getFirstMapCircle() {
    return element(by.css('path.leaflet-interactive'));
  }

  getBottomSheet() {
    return element(by.css('mat-bottom-sheet-container'));
  }

  clickACircle() {
    return this.getFirstMapCircle().click();
  }
}
