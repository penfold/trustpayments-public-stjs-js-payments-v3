import { anyFunction, instance, mock, verify, when } from 'ts-mockito';
import { IFrameQueryingService } from '../../../shared/services/message-bus/interfaces/IFrameQueryingService';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { IClickToPayConfig } from '../models/IClickToPayConfig';
import { ClickToPayClientInitializer } from './ClickToPayClientInitializer';
import { ClickToPayClient } from './ClickToPayClient';

describe('ClickToPayClientInitializer', () => {
  let frameQueryinServiceMock: IFrameQueryingService;
  let clickToPayClientMock: ClickToPayClient;
  let sut: ClickToPayClientInitializer;

  beforeEach(() => {
    frameQueryinServiceMock = mock<IFrameQueryingService>();
    clickToPayClientMock = mock(ClickToPayClient);
    sut = new ClickToPayClientInitializer(instance(frameQueryinServiceMock), instance(clickToPayClientMock));
  });

  describe('register', () => {
    it(`should run init method on ClickToPayClient when ${PUBLIC_EVENTS.CLICK_TO_PAY_INIT_CLIENT} event is recevied with frame querying service`, () => {
      const testConfig: IClickToPayConfig = {};
      when(frameQueryinServiceMock.whenReceive(PUBLIC_EVENTS.CLICK_TO_PAY_INIT_CLIENT, anyFunction())).thenCall((eventType, callback) => {
        callback({ type: eventType, data: testConfig });
      });

      sut.register();

      verify(clickToPayClientMock.init(testConfig)).once();
    });
  });
});
