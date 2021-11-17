import { IRequestProcessingOptions } from '../IRequestProcessingOptions';
import { CacheTokenRequestProcessor } from './CacheTokenRequestProcessor';

describe('CacheTokenRequestProcessor', () => {
  let cacheTokenRequestProcessor: CacheTokenRequestProcessor;

  beforeEach(() => {
    cacheTokenRequestProcessor = new CacheTokenRequestProcessor();
  });

  describe('process()', () => {
    it('returns unmodified request if JSINIT response is not passed', done => {
      const request = { pan: '1111111111111111' };

      cacheTokenRequestProcessor.process(request, { jsInitResponse: null }).subscribe(result => {
        expect(result).toBe(request);
        done();
      });
    });

    it('appends cache token from JSINIT response to passed request', done => {
      const request = { pan: '1111111111111111' };
      const options: IRequestProcessingOptions = {
        jsInitResponse: {
          threedsprovider: undefined,
          jwt: '',
          cachetoken: 'foobar1234',
        },
      };

      cacheTokenRequestProcessor.process(request, options).subscribe(result => {
        expect(result).toEqual({
          pan: '1111111111111111',
          cachetoken: 'foobar1234',
        });
        done();
      });
    });
  });
});
