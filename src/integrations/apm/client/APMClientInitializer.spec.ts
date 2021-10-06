import { APMClientInitializer } from './APMClientInitializer';
import { APMClient } from './APMClient';
import { anyFunction, instance, mock, verify, when } from 'ts-mockito';
import { FrameQueryingService } from '../../../shared/services/message-bus/FrameQueryingService';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { IAPMConfig } from '../models/IAPMConfig';
import { APMName } from '../models/APMName';
import { IFrameQueryingService } from '../../../shared/services/message-bus/interfaces/IFrameQueryingService';

describe('APMClientInitializer', () => {
  const testConfig: IAPMConfig = {
    placement: 'st-apm',
    apmList: [APMName.ZIP],
    errorRedirectUrl: 'url1',
    successRedirectUrl: 'url2',
    cancelRedirectUrl: 'url3',
  };
  let apmClient: APMClient;
  let frameQueryingService: IFrameQueryingService;
  let apmClientInitializer: APMClientInitializer;

  beforeEach(() => {
    apmClient = mock(APMClient);
    frameQueryingService = mock(FrameQueryingService);
    apmClientInitializer = new APMClientInitializer(instance(apmClient), instance(frameQueryingService));
  });

  describe('register()', () => {
    it(`should run init method on apmClient when ${PUBLIC_EVENTS.APPLE_PAY_INIT_CLIENT} is recevied`, () => {
      when(frameQueryingService.whenReceive(PUBLIC_EVENTS.APM_INIT_CLIENT, anyFunction())).thenCall((eventType, callback) => {
        callback({ type: eventType, data: testConfig });
      });

      apmClientInitializer.register();

      verify(apmClient.init(testConfig)).once();
    });
  });
});
