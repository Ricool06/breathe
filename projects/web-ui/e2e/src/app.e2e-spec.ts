import { MapPage } from './app.po';
import { browser, logging } from 'protractor';
import { readFileSync } from 'fs';
import * as express from 'express';
import * as cors from 'cors';
import * as dt from 'dredd-transactions';
import { environment } from '../../src/environments/environment';
import { Server } from 'http';

let transactionsMap: Map<string, any>;

describe('workspace-project App', () => {
  let page: MapPage;
  let openaqBlueprint;
  let openaqBlueprintFilePath: string;
  let mockOpenaqApiServer: Server;

  beforeAll(() => {
    transactionsMap = new Map<string, any>();

    openaqBlueprintFilePath = `${__dirname}/../assets/openaq.apib.md`;
    openaqBlueprint = readFileSync(openaqBlueprintFilePath, 'utf8');

    const mockOpenaqApi = express();
    mockOpenaqApi.use(cors());

    mockOpenaqApi.all('*', matchRequestWithResponse);

    mockOpenaqApiServer = mockOpenaqApi.listen(environment.openaqApi.port);
  });

  afterAll(() => mockOpenaqApiServer.close());

  beforeEach(() => {
    dt.compile(openaqBlueprint, openaqBlueprintFilePath, (error, result) => {
      expect(error).toBeFalsy();
      result.transactions
        .map(transaction => transactionsMap.set(`${transaction.request.method} ${transaction.request.uri}`, transaction));
    });

    page = new MapPage();
  });

  it('should display a map', async () => {
    await page.navigateTo();
    expect(page.getMapElement().isDisplayed()).toBeTruthy();
    expect(page.getFirstMapTile().isDisplayed()).toBeTruthy();
  });

  it('should display polygons on map when API returns good data', async () => {
    await page.navigateTo();
    expect(page.getFirstMapPolygon().isDisplayed()).toBeTruthy();
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    }));
  });
});

function matchRequestWithResponse(req: express.Request, res: express.Response) {
  const { response } = transactionsMap.get(`${req.method} ${req.url}`);

  res.status(response.status).json(JSON.parse(response.body));
}
