import Bowser from 'bowser';
import { Inject, Service } from 'typedi';
import { WINDOW } from '../../dependency-injection/InjectionTokens';
import { IBrowserInfo } from './IBrowserInfo';
import { BrowserSupport } from './browser-support/BrowserSupport';
import { DeviceSupport } from './device-support/DeviceSupport';

@Service()
export class BrowserDetector {
  constructor(
    @Inject(WINDOW) private window: Window,
    private browserSupport: BrowserSupport,
    private deviceSupport: DeviceSupport
  ) {}

  getBrowserInfo(): IBrowserInfo {
    const browserDetails = Bowser.parse(this.window.navigator.userAgent);
    const isBrowserSupported = this.browserSupport.isBrowserSupported(
      browserDetails.browser.version,
      browserDetails.browser.name
    );
    const isDeviceSupported = this.deviceSupport.isDeviceSupported(browserDetails.os.version, browserDetails.os.name);

    return {
      browser: {
        ...browserDetails.browser,
        isSupported: isBrowserSupported
      },
      engine: browserDetails.engine,
      os: {
        ...browserDetails.os,
        isSupported: isDeviceSupported
      },
      platform: browserDetails.platform,
      isSupported: isBrowserSupported && isDeviceSupported
    };
  }
}
