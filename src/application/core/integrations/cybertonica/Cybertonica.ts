import { Service } from 'typedi';
import { DomMethods } from '../../shared/dom-methods/DomMethods';
import { environment } from '../../../../environments/environment';
import { BrowserLocalStorage } from '../../../../shared/services/storage/BrowserLocalStorage';
import { IAFCybertonica } from './IAFCybertonica';
import { ICybertonica } from './ICybertonica';

declare const AFCYBERTONICA: IAFCybertonica;

@Service()
export class Cybertonica implements ICybertonica {
  private static readonly SDK_ADDRESS = environment.CYBERTONICA.CYBERTONICA_LIVE_URL;
  private static LOCALE = 'locale';
  private static SCRIPT_TARGET = 'head';
  private static TID_KEY = 'app.tid';
  private static TID_TIMEOUT = 5000;

  private static getBasename(): string {
    const link = document.createElement('a');
    link.href = Cybertonica.SDK_ADDRESS;
    return 'https://' + link.hostname;
  }

  private tid: Promise<string> = Promise.resolve(undefined);

  constructor(private storage: BrowserLocalStorage) {
    this.storage.setItem(Cybertonica.TID_KEY, '');
  }

  private insertCybertonicaLibrary(): Promise<Element> {
    return DomMethods.insertScript(Cybertonica.SCRIPT_TARGET, { src: Cybertonica.SDK_ADDRESS });
  }

  init(apiUserName: string): Promise<string> {
    const tid = this.insertCybertonicaLibrary().then(() =>
      AFCYBERTONICA.init(apiUserName, undefined, Cybertonica.getBasename())
    );
    const timeout = new Promise<null>(resolve => setTimeout(() => resolve(null), Cybertonica.TID_TIMEOUT));

    this.tid = Promise.race([tid, timeout]);
    this.tid.then(value => this.storage.setItem(Cybertonica.TID_KEY, value));

    return this.tid;
  }

  getTransactionId(): Promise<string> {
    const tid = this.storage.getItem(Cybertonica.TID_KEY) as string;

    if (tid !== null && tid !== '') {
      return Promise.resolve(tid);
    }

    return this.tid;
  }
}
