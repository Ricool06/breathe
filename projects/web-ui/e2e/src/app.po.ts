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

  getFirstMapPolygon() {
    return element(by.css('path.leaflet-interactive'));
  }
}
