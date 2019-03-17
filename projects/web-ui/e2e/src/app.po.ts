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

  getSingleResultChart() {
    return element(by.css('mat-bottom-sheet-container app-single-result-chart canvas'));
  }

  getSingleResultTime() {
    return element(by.css('mat-bottom-sheet-container h4'));
  }

  getSingleResultAqi(): any {
    return element(by.css('mat-bottom-sheet-container mat-grid-tile:nth-child(3) h1'));
  }

  clickACircle() {
    return this.getFirstMapCircle().click();
  }
}
