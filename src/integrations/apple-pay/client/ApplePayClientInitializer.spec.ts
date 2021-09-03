import { Observable } from 'rxjs';
import { anything, instance, mock, verify, when } from 'ts-mockito';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { InterFrameCommunicator } from '../../../shared/services/message-bus/InterFrameCommunicator';
import { ApplePayClient } from './ApplePayClient';
import { ApplePayClientInitializer } from './ApplePayClientInitializer';

describe('ApplePayClientInitializer', () => {
  let applePayClientInitializer: ApplePayClientInitializer;
  let applePayClientMock: ApplePayClient;
  let interFrameCommunicatorMock: InterFrameCommunicator;

  beforeEach(() => {
    applePayClientMock = mock(ApplePayClient);
    interFrameCommunicatorMock = mock(InterFrameCommunicator);

    applePayClientInitializer = new ApplePayClientInitializer(
      instance(applePayClientMock),
      instance(interFrameCommunicatorMock),
    );
  });

  describe('register()', () => {
    it('checks if applePayClient service has been called', () => {
      when(interFrameCommunicatorMock.whenReceive(PUBLIC_EVENTS.APPLE_PAY_INIT_CLIENT)).thenCall((eventType = { data: null }) => {
        return {
          thenRespond: (callback: (event) => void) => {
            callback(eventType);
          },
        };
      });

      applePayClientInitializer.register();
      verify(applePayClientMock.init(anything())).once();
    });
  });
});
