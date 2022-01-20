import { Observable, of } from 'rxjs';
import { Service } from 'typedi';
import { map } from 'rxjs/operators';
import { IClickToPayConfig } from '../models/IClickToPayConfig';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { ClickToPayIframeCreator } from '../application/component/ClickToPayIframeCreator';
import { IFrameQueryingService } from '../../../shared/services/message-bus/interfaces/IFrameQueryingService';
import { ofType } from '../../../shared/services/message-bus/operators/ofType';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { ClickToPayButtonService } from './services/ClickToPayButtonService';

@Service()
export class ClickToPayClient {
  constructor(
    private clickToPayButtonService: ClickToPayButtonService,
    private frameQueryingService: IFrameQueryingService,
    private clickToPayIframeCreator: ClickToPayIframeCreator,
    private messageBus: IMessageBus
  ) {
  }

  init(config: IClickToPayConfig): Observable<unknown> {
    this.clickToPayButtonService.insertClickToPayButton(config);

    this.frameQueryingService.whenReceive(PUBLIC_EVENTS.CLICK_TO_PAY_START, () => {
      this.clickToPayIframeCreator.appendIframe(config);
      return this.messageBus.pipe(ofType(PUBLIC_EVENTS.CLICK_TO_PAY_PAYLOAD_RECEIVED), map(event => event.data));
    });

    return of(null);
  }
}
