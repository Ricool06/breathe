import { browser, by, element } from 'protractor';

export class MapPage {
  navigateTo() {
    return browser.get(browser.baseUrl);
  }

  getMapElement() {
    return element(by.css('.leaflet-container'));
  }
}
