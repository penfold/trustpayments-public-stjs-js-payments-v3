import { BrowserDetector } from './BrowserDetector';
import { Container } from 'typedi';

jest.mock('bowser', () => {
  return {
    parse: jest.fn().mockReturnValue({
      browser: {
        name: 'Chrome',
        version: '85'
      },
      os: {
        versionName: 'Windows',
        version: '10',
        name: 'Windows'
      },
      platform: {
        type: 'desktop'
      },
      engine: {
        name: 'test',
        version: 'test'
      }
    })
  };
});

describe('BrowserDetector', () => {
  let browserDetector: BrowserDetector;

  beforeEach(() => {
    browserDetector = Container.get(BrowserDetector);
  });

  it('should return browser name and version', () => {
    expect(browserDetector.getBrowserInfo().browser).toEqual({ name: 'Chrome', version: '85', isSupported: true });
  });

  it('should return os name and version', () => {
    expect(browserDetector.getBrowserInfo().os).toEqual({
      versionName: 'Windows',
      name: 'Windows',
      version: '10',
      isSupported: true
    });
  });

  it('should return platform name and version', () => {
    expect(browserDetector.getBrowserInfo().platform).toEqual({ type: 'desktop' });
  });

  it('should return if browser is supported or not', () => {
    expect(browserDetector.getBrowserInfo().isSupported).toEqual(true);
  });
});
