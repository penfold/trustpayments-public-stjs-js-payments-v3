import each from 'jest-each';
import { BrowsersList } from '../BrowsersList';
import { BrowserSupport } from './BrowserSupport';
import { anything, instance, mock, when } from 'ts-mockito';

describe('BrowserSupport', () => {
  const browsers = [
    'chrome 88',
    'chrome 87',
    'edge 88',
    'edge 87',
    'edge 18',
    'firefox 85',
    'firefox 84',
    'ie 11',
    'ios_saf 14.0-14.4',
    'ios_saf 13.4-13.7',
    'opera 73',
    'safari 14',
    'safari 13.1',
    'safari 13',
    'safari 12.1',
    'safari 12'
  ];

  const supportedBrowsers = {
    chrome: ['88', '87'],
    edge: ['88', '87', '18'],
    firefox: ['85', '84'],
    ie: ['11'],
    ios_saf: [
      '14.0-14.4',
      '13.4-13.7',
      '13.3',
      '13.2',
      '13.0-13.1',
      '12.2-12.4',
      '12.0-12.1',
      '11.3-11.4',
      '11.0-11.2',
      '10.3',
      '10.0-10.2'
    ],
    opera: ['73'],
    safari: ['14', '13.1', '13', '12.1', '12']
  };

  let browserList: BrowsersList;
  let browserSupport: BrowserSupport;

  beforeEach(() => {
    browserList = mock(BrowsersList);
    when(browserList.getBrowsers(anything())).thenReturn(browsers);
    when(browserList.getSupportedBrowsers()).thenReturn(supportedBrowsers);
    browserSupport = new BrowserSupport(instance(browserList));
  });

  each([
    ['88', 'Chrome', true],
    ['86', 'Chrome', false],
    ['85', 'Firefox', true],
    ['83', 'Firefox', false],
    ['71', 'Opera', false],
    ['73', 'Opera', true],
    ['11', 'Safari', false],
    ['13.1', 'Safari', true],
    ['10', 'Internet Explorer', false],
    ['11', 'Internet Explorer', true],
    ['1111', 'test', false]
  ]).it(
    'should check if browser is supported in given version or not',
    (version: string, browser: string, isSupported: boolean) => {
      expect(browserSupport.isBrowserSupported(version, browser)).toEqual(isSupported);
    }
  );
});
