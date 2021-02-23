import { BrowserDetector } from './BrowserDetector';
import { instance, mock, when } from 'ts-mockito';
import { BrowserSupport } from './browser-support/BrowserSupport';
import { DeviceSupport } from './device-support/DeviceSupport';

describe('BrowserDetector', () => {
  let browserDetector: BrowserDetector;
  let windowMock: Window;
  windowMock = mock<Window>();
  let browserSupport: BrowserSupport;
  let deviceSupport: DeviceSupport;

  beforeEach(() => {
    when(windowMock.navigator).thenReturn(({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36'
    } as unknown) as Navigator);

    browserSupport = mock(BrowserSupport);
    deviceSupport = mock(DeviceSupport);
    when(browserSupport.isBrowserSupported('88.0.4324.182', 'Chrome')).thenReturn(true);
    when(deviceSupport.isDeviceSupported('NT 10.0', 'Windows')).thenReturn(true);
    browserDetector = new BrowserDetector(instance(windowMock), instance(browserSupport), instance(deviceSupport));
  });

  it('should return browser name and version', () => {
    expect(browserDetector.getBrowserInfo().browser).toEqual({
      name: 'Chrome',
      version: '88.0.4324.182',
      isSupported: true
    });
  });

  it('should return os name and version', () => {
    expect(browserDetector.getBrowserInfo().os).toEqual({
      name: 'Windows',
      version: 'NT 10.0',
      versionName: '10',
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
