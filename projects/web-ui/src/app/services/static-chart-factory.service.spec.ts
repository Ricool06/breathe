import { TestBed, inject } from '@angular/core/testing';
import { Chart, ChartConfiguration } from 'chart.js';

import { StaticChartFactoryService } from './static-chart-factory.service';

describe('StaticChartFactoryService', () => {

  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service = TestBed.get(StaticChartFactoryService);
    expect(service).toBeTruthy();
  });

  it('should be injectable', inject([StaticChartFactoryService], (service: StaticChartFactoryService) => {
    expect(service).toBeTruthy();
  }));

  describe('createChart', () => {
    it('should create a chart', inject([StaticChartFactoryService], (service: StaticChartFactoryService) => {
      const config: ChartConfiguration = {
        data: {
          labels: ['health', 'stamina', 'magicka'],
          datasets: [{
            data: [1, 2, 3],
          }],
        },
      };

      const chart: Chart = service.createChart('', config);

      expect(chart).toEqual(jasmine.any(Chart));
      expect(chart.config).toEqual(config);
    }));
  });
});
