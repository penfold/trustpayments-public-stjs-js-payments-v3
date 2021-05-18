import { from, Observable } from 'rxjs';
import { IBrowserData } from './data/IBrowserData';
import { IMessageBusEvent } from '../../../../models/IMessageBusEvent';
import { PUBLIC_EVENTS } from '../../../../models/constants/EventTypes';
import { MERCHANT_PARENT_FRAME } from '../../../../models/constants/Selectors';
import { map } from 'rxjs/operators';
import { InterFrameCommunicator } from '../../../../../../shared/services/message-bus/InterFrameCommunicator';
import { Service } from 'typedi';
import { BrowserDataInterface } from '3ds-sdk-js';

@Service()
export class BrowserDataProvider {
  constructor(private interFrameCommunicator: InterFrameCommunicator) {
  }

  getBrowserData$(): Observable<IBrowserData> {
    const queryEvent: IMessageBusEvent = { type: PUBLIC_EVENTS.THREE_D_SECURE_BROWSER_DATA };

    return from(this.interFrameCommunicator.query<BrowserDataInterface>(queryEvent, MERCHANT_PARENT_FRAME)).pipe(
      map(browserData => {
        const mapProperty = ([key, value]: [string, string | number | boolean]) => [
          key.toLowerCase(),
          typeof(value) === 'string' ? value : JSON.stringify(value),
        ];
        const entries = Object.entries(browserData).map(mapProperty);

        return Object.fromEntries(entries) as IBrowserData;
      }),
    );
  }
}
