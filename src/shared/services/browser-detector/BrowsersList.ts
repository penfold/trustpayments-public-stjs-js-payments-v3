import browserslist from 'browserslist';
import { Service } from 'typedi';

@Service()
export class BrowsersList {
  getBrowsers(list: string[]): string[] {
    return browserslist(list);
  }

  getSupportedBrowsers(): Record<string, string[]> {
    // @ts-ignore
    return Object.keys(browserslist.versionAliases).reduce((a, b) => ((a[b] = []), a), {});
  }
}
