import { anyFunction, anything, instance, mock, verify, when } from 'ts-mockito';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { ApplePayClient } from './ApplePayClient';
import { ApplePayClientInitializer } from './ApplePayClientInitializer';
import { IFrameQueryingService } from '../../../shared/services/message-bus/interfaces/IFrameQueryingService';

describe('ApplePayClientInitializer', () => {
  let applePayClientInitializer: ApplePayClientInitializer;
  let applePayClientMock: ApplePayClient;
  let frameQueryingService: IFrameQueryingService;

  beforeEach(() => {
    applePayClientMock = mock(ApplePayClient);
    frameQueryingService = mock<IFrameQueryingService>();

    applePayClientInitializer = new ApplePayClientInitializer(
      instance(applePayClientMock),
      instance(frameQueryingService),
    );
  });

  describe('register()', () => {
    it(`checks if applePayClient service has been called when ${PUBLIC_EVENTS.APPLE_PAY_INIT_CLIENT} recevied`, () => {
      when(frameQueryingService.whenReceive(PUBLIC_EVENTS.APPLE_PAY_INIT_CLIENT, anyFunction())).thenCall((eventType, callback) => {
        callback({ type: eventType, data: null });
      });

      applePayClientInitializer.register();

      verify(applePayClientMock.init(anything())).once();
    });
  });
});
