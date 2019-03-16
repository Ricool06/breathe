import { HumanizeDatePipe } from './humanize-date.pipe';
import * as moment from 'moment';

describe('HumanizeDatePipe', () => {
  it('can create an instance', () => {
    const pipe = new HumanizeDatePipe();
    expect(pipe).toBeTruthy();
  });

  it('should transform ISO8601 date strings to relative, human-readable formats', () => {
    const pipe = new HumanizeDatePipe();
    const dateString = moment().subtract(1, 'hour').toISOString();
    expect(pipe.transform(dateString)).toEqual('an hour ago');
  });
});
