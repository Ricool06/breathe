import { MapPage } from './app.po';
import { browser, logging } from 'protractor';
import { readFileSync } from 'fs';
import * as express from 'express';
import * as cors from 'cors';
import * as dt from 'dredd-transactions';
import { environment } from '../../src/environments/environment';
import { Server } from 'http';
import * as url from 'url';
import { LatestResult } from 'src/app/model';
import * as moment from 'moment';
import { Pact, Matchers } from '@pact-foundation/pact';

let transactionsMap: Map<string, any>;

describe('workspace-project App', () => {
  let page: MapPage;
  let openaqBlueprint;
  let openaqBlueprintFilePath: string;
  let mockOpenaqApiServer: Server;
  let predictionApiProvider: Pact;

  beforeAll(async () => {
    transactionsMap = new Map<string, any>();

    openaqBlueprintFilePath = `${__dirname}/../../blueprints/openaq.apib.md`;
    openaqBlueprint = readFileSync(openaqBlueprintFilePath, 'utf8');

    const mockOpenaqApi = express();
    mockOpenaqApi.use(cors());

    mockOpenaqApi.all('*', matchRequestWithResponse);

    mockOpenaqApiServer = mockOpenaqApi.listen(environment.openaqApi.port);

    predictionApiProvider = new Pact({
      consumer: 'web-ui',
      provider: 'prediction-api',
      port: environment.predictionApi.port,
      dir: `${__dirname}/../../pacts`,
    });

    const { eachLike, somethingLike } = Matchers;

    await predictionApiProvider
      .setup()
      .then(() => {
        return predictionApiProvider.addInteraction({
          state: 'i have predictions to give',
          uponReceiving: 'a request for predictions',
          withRequest: {
            method: 'GET',
            path: '/predict',
            query: {
              latitude: somethingLike('39.2133'),
              longitude: somethingLike('117.1837'),
              parameter: somethingLike('pm10'),
            },
          },
          willRespondWith: {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
            body: {
              predictions: eachLike({ timestamp: 1557926670, value: 820.4 }),
            },
          },
        });
      });
  });

  afterAll(() => {
    mockOpenaqApiServer.close();

    predictionApiProvider.verify();
    predictionApiProvider.finalize();
  });

  beforeEach(() => {
    dt.compile(openaqBlueprint, openaqBlueprintFilePath, (error, result) => {
      expect(error).toBeFalsy();
      result.transactions
        .map(transaction => transactionsMap.set(
            generateTransactionMapKey(transaction.request.method, transaction.request.uri),
            transaction));
    });

    page = new MapPage();
  });

  it('should display a map', async () => {
    await page.navigateTo();
    expect(page.getMapElement().isDisplayed()).toBeTruthy();
    expect(page.getFirstMapTile().isDisplayed()).toBeTruthy();
  });

  it('should display circles on map when API returns good data', async () => {
    await page.navigateTo();
    expect(page.getFirstMapCircle().isDisplayed()).toBeTruthy();
  });

  describe('circles', () => {
    it('should display a sheet with location & air quality data when clicked', async () => {
      const measurementsTransaction = transactionsMap.get(generateTransactionMapKey('GET', '/measurements'));
      const originalBody = JSON.parse(measurementsTransaction.response.body);
      mockTransactionResponseBodies(measurementsTransaction, originalBody, { ...originalBody, results: [] });

      await page.clickACircle();
      expect(page.getBottomSheet().isDisplayed()).toBe(true);
    });
  });

  describe('location result data sheet', () => {
    beforeEach(async () => {
      const measurementsTransaction = transactionsMap.get(generateTransactionMapKey('GET', '/measurements'));
      const originalBody = JSON.parse(measurementsTransaction.response.body);
      mockTransactionResponseBodies(measurementsTransaction, originalBody, { ...originalBody, results: [] });

      await page.navigateTo();
      await page.clickACircle();
      expect(page.getBottomSheet().isDisplayed()).toBe(true);
    });

    it('should display a location result measurements chart', () => {
      expect(page.getSingleResultChart().isDisplayed()).toBe(true);
    });

    it('should display an historical location result measurements chart', () => {
      expect(page.getHistoricalResultsChart().isDisplayed()).toBe(true);
    });

    it('should display a chart of predicted measurements chart', () => {
      expect(page.getPredictedResultsChart().isDisplayed()).toBe(true);
    });

    it('should display a week slider', () => {
      expect(page.getWeekSlider().isDisplayed()).toBe(true);
    });
  });

  describe('location result data sheet data', () => {
    beforeEach(() => {
      const measurementsTransaction = transactionsMap.get(generateTransactionMapKey('GET', '/measurements'));
      const originalBody = JSON.parse(measurementsTransaction.response.body);
      mockTransactionResponseBodies(measurementsTransaction, originalBody, { ...originalBody, results: [] });
    });

    it('should display the latest location result measurement time', async () => {
      const transaction = transactionsMap.get(generateTransactionMapKey('GET', '/latest'));
      const body = JSON.parse(transaction.response.body);
      const results: LatestResult[] = body.results;
      results.map(result => result.measurements.map(measurement => measurement.lastUpdated = moment().subtract(1, 'hour')));
      transaction.response.body = JSON.stringify(body);

      await page.navigateTo();
      await page.clickACircle();

      expect(page.getBottomSheet().isDisplayed()).toBe(true);
      expect(page.getSingleResultTime().getText()).toEqual('Latest measurement: an hour ago');
    });

    // This test is based on official calculation for EAQI:
    // http://airindex.eea.europa.eu/
    it('should display the EAQI value of the selected measurements', async () => {
      const transaction = transactionsMap.get(generateTransactionMapKey('GET', '/latest'));
      const body = JSON.parse(transaction.response.body);
      const results: LatestResult[] = body.results;

      const now = moment().toISOString();

      results[0].measurements = [
        {
          averagingPeriod: {
            value: 1,
            unit: 'hours',
          },
          lastUpdated: now,
          parameter: 'no2',
          sourceName: 'DEFRA',
          unit: 'µg/m³',
          value: 150,
        },
        {
          averagingPeriod: {
            value: 1,
            unit: 'hours',
          },
          lastUpdated: now,
          parameter: 'pm10',
          sourceName: 'DEFRA',
          unit: 'µg/m³',
          value: 90,
        },
      ];

      transaction.response.body = JSON.stringify(body);

      await page.navigateTo();
      await page.clickACircle();

      expect(page.getBottomSheet().isDisplayed()).toBe(true);
      expect(page.getSingleResultAqi().getText()).toEqual('Poor');
    });
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    }));
  });
});

function generateTransactionMapKey(method, uri): string {
  return `${method} ${url.parse(uri).pathname}`;
}

function matchRequestWithResponse(req: express.Request, res: express.Response) {
  const { response } = transactionsMap.get(generateTransactionMapKey(req.method, req.url));

  res.status(response.status).json(JSON.parse(response.body));
}

function mockTransactionResponseBodies(transaction: { response: express.Response }, ...responseBodies: string[]) {
  const responseBodiesIterator = responseBodies.values();

  Object.defineProperty(transaction.response, 'body',
    {
      get() {
        return JSON.stringify(responseBodiesIterator.next().value);
      },
    });
}
