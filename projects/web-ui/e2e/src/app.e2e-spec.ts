import { MapPage } from './app.po';
import { browser, logging } from 'protractor';

describe('workspace-project App', () => {
  let page: MapPage;

  beforeEach(() => {
    page = new MapPage();
  });

  it('should display a map', async () => {
    await page.navigateTo();
    expect(page.getMapElement().isDisplayed()).toBeTruthy();
    expect(page.getFirstMapTile().isDisplayed()).toBeTruthy();
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    }));
  });
});
