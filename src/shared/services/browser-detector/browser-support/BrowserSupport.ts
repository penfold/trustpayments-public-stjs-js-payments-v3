import { Service } from 'typedi';
import { BrowsersList } from '../BrowsersList';
import { BrowserMap } from '../BrowserMap';

@Service()
export class BrowserSupport {
  constructor(private browserList: BrowsersList) {}

  isBrowserSupported(version: string, name: string): boolean {
    const supportedVersions: string[] = this.getSupportedBrowserVersions(this.mapBrowserName(name));
    const currentVersion = Number(version.substring(0, 2));

    if (!supportedVersions) {
      return false;
    }

    if (Array.isArray(supportedVersions)) {
      return supportedVersions.some(v => Number(v) <= currentVersion);
    }

    return Number(supportedVersions) <= currentVersion;
  }

  private mapBrowserName(name: string): string {
    return Object.keys(BrowserMap).find(key => BrowserMap[key] === name) || '';
  }

  private getSupportedBrowserVersions(name: string): string[] {
    // tslint:disable-next-line:no-var-requires
    const { browserslist: browserlist } = require('./../../../../../package.json');
    const browsersFromPackageJson = this.browserList.getBrowsers(browserlist);
    const supportedBrowsers = this.browserList.getSupportedBrowsers();

    browsersFromPackageJson.map((browser: string) => {
      const browserNameVersionPair = browser.split(' ');
      return supportedBrowsers[browserNameVersionPair[0]].push(browserNameVersionPair[1]);
    });

    return supportedBrowsers[name.toLowerCase()];
  }
}
