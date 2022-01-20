import { anyFunction, instance, mock, verify, when } from 'ts-mockito';
import { IClickToPayConfig } from '../models/IClickToPayConfig';
import { IFrameQueryingService } from '../../../shared/services/message-bus/interfaces/IFrameQueryingService';
import { ClickToPayIframeCreator } from '../application/component/ClickToPayIframeCreator';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { SimpleMessageBus } from '../../../application/core/shared/message-bus/SimpleMessageBus';
import { ClickToPayButtonService } from './services/ClickToPayButtonService';
import { ClickToPayClient } from './ClickToPayClient';

describe('ClickToPayClient', () => {
  let clickToPayClient: ClickToPayClient;
  let clickToPayButtonServiceMock: ClickToPayButtonService;
  let frameQueryingServiceMock: IFrameQueryingService;
  let clickToPayIframeCreator: ClickToPayIframeCreator;
  let messageBus: IMessageBus

  const config: IClickToPayConfig = {
    buttonPlacement: 'st-click-to-pay',
    placement: 'st-click-to-pay-iframe',
  };

  beforeEach(() => {
    frameQueryingServiceMock = mock<IFrameQueryingService>();
    clickToPayButtonServiceMock = mock(ClickToPayButtonService);
    clickToPayIframeCreator = mock(ClickToPayIframeCreator);
    messageBus = new SimpleMessageBus();

    clickToPayClient = new ClickToPayClient(
      instance(clickToPayButtonServiceMock),
      instance(frameQueryingServiceMock),
      instance(clickToPayIframeCreator),
      messageBus
    );

    when(frameQueryingServiceMock.whenReceive(PUBLIC_EVENTS.CLICK_TO_PAY_START, anyFunction())).thenCall((eventType, callback) => {
      callback({ type: eventType, data: config });
    });
  });

  describe('init()', () => {
    it('resolves the Click to Pay config and inserts the pay button', done => {
      clickToPayClient.init(config);
      verify(clickToPayButtonServiceMock.insertClickToPayButton(config)).once();
      done();
    });

    it('should appendIframe', ()=> {
      clickToPayClient.init(config);
      verify(clickToPayIframeCreator.appendIframe(config)).once();
    });
  });
});
