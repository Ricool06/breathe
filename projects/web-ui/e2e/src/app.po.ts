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

  getHistoricalResultsChart() {
    return element(by.css('mat-bottom-sheet-container app-historical-results-chart canvas'));
  }

  getPredictedResultsChart() {
    return element(by.css('mat-bottom-sheet-container app-predictions-chart canvas'));
  }

  getWeekSlider() {
    return element(by.css('mat-bottom-sheet-container mat-slider'));
  }

  getSingleResultTime() {
    return element(by.css('mat-bottom-sheet-container > app-location-result-data-sheet > div > div:nth-child(1) > div > h4'));
  }

  getSingleResultAqi(): any {
    return element(by.css('mat-bottom-sheet-container h1.mat-display-4'));
  }

  clickACircle() {
    return this.getFirstMapCircle().click();
  }
}
