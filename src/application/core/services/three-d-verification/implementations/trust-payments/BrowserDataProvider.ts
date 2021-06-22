import { from, Observable } from 'rxjs';
import { IBrowserData } from './data/IBrowserData';
import { IMessageBusEvent } from '../../../../models/IMessageBusEvent';
import { PUBLIC_EVENTS } from '../../../../models/constants/EventTypes';
import { MERCHANT_PARENT_FRAME } from '../../../../models/constants/Selectors';
import { map } from 'rxjs/operators';
import { InterFrameCommunicator } from '../../../../../../shared/services/message-bus/InterFrameCommunicator';
import { Service } from 'typedi';
import { BrowserDataInterface } from '@trustpayments/3ds-sdk-js';

@Service()
export class BrowserDataProvider {
  // @TODO: this is the stage URL. For production use https://brw.3ds.trustpayments.com/3dss/brw/browser-data
  private readonly browserData3dsServerUrl = 'https://acs.3ds.trustpayments.dev/3dss/acs/browser-data';

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
