import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Service } from 'typedi';
import { BrowserDataInterface } from '@trustpayments/3ds-sdk-js';
import { IMessageBusEvent } from '../../../../models/IMessageBusEvent';
import { PUBLIC_EVENTS } from '../../../../models/constants/EventTypes';
import { MERCHANT_PARENT_FRAME } from '../../../../models/constants/Selectors';
import { InterFrameCommunicator } from '../../../../../../shared/services/message-bus/InterFrameCommunicator';
import { environment } from '../../../../../../environments/environment';
import { IBrowserData } from './data/IBrowserData';

@Service()
export class BrowserDataProvider {
  private readonly browserData3dsServerUrl = environment.BROWSER_DATA_URL;

  constructor(private interFrameCommunicator: InterFrameCommunicator) {}

  getBrowserData$(): Observable<IBrowserData> {
    const queryEvent: IMessageBusEvent<string> = {
      type: PUBLIC_EVENTS.THREE_D_SECURE_BROWSER_DATA,
      data: this.browserData3dsServerUrl,
    };
    const stringify = (value: unknown) => value === undefined ? value : String(value);

    return from(this.interFrameCommunicator.query<BrowserDataInterface>(queryEvent, MERCHANT_PARENT_FRAME)).pipe(
      map((browserData: BrowserDataInterface) => ({
        browsercolordepth: stringify(browserData.browserColorDepth),
        browserjavaenabled: stringify(browserData.browserJavaEnabled),
        browserjavascriptenabled: stringify(browserData.browserJavascriptEnabled),
        browserlanguage: stringify(browserData.browserLanguage),
        browserscreenheight: stringify(browserData.browserScreenHeight),
        browserscreenwidth: stringify(browserData.browserScreenWidth),
        browsertz: stringify(browserData.browserTZ),
        useragent: stringify(browserData.browserUserAgent),
        accept: stringify(browserData.browserAcceptHeader),
        customerip: stringify(browserData.browserIP),
      })),
    );
  }
}
