import { of } from 'rxjs';
import { anything, instance, mock, verify, when } from 'ts-mockito';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { IThreeDInitResponse } from '../../models/IThreeDInitResponse';
import { IMessageBus } from '../../shared/message-bus/IMessageBus';
import { SimpleMessageBus } from '../../shared/message-bus/SimpleMessageBus';
import { GatewayClient } from '../GatewayClient';
import { CardinalCommerceVerificationService } from './implementations/CardinalCommerceVerificationService';
import { ThreeDSecureVerificationService } from './implementations/three-d-secure/ThreeDSecureVerificationService';
import { ThreeDVerificationProviderService } from './three-d-verification-provider/ThreeDVerificationProviderService';
import { ThreeDProcess } from './ThreeDProcess';
import { ThreeDVerificationProvider } from './ThreeDVerificationProvider';
import { VerificationResultHandler } from './VerificationResultHandler';

describe('ThreeDProcess', () => {
  let messageBusMock: IMessageBus;
  let gatewayClientMock: GatewayClient;
  let verificationResultHandlerMock: VerificationResultHandler;
  let threeDVerificationServiceProviderMock: ThreeDVerificationProviderService;
  let threeDSecureVerificationServiceMock: ThreeDSecureVerificationService;
  let cardinalCommerceVerificationServiceMock: CardinalCommerceVerificationService;
  let threeDProcess: ThreeDProcess;

  const jsInitResponseMock: IThreeDInitResponse = {
    errorcode: '0',
    errormessage: 'Success',
    requesttypedescription: '',
    threedinit: 'threedinit',
    transactionstartedtimestamp: 'transactionstartedtimestamp',
    threedsprovider: ThreeDVerificationProvider.CARDINAL,
    cachetoken: 'cachetoken',
  };

  beforeEach(() => {
    messageBusMock = new SimpleMessageBus();
    gatewayClientMock = mock(GatewayClient);
    verificationResultHandlerMock = mock(VerificationResultHandler);
    threeDVerificationServiceProviderMock = mock(ThreeDVerificationProviderService);
    threeDSecureVerificationServiceMock = mock(ThreeDSecureVerificationService);
    cardinalCommerceVerificationServiceMock = mock(CardinalCommerceVerificationService);
    threeDProcess = new ThreeDProcess(
      messageBusMock,
      instance(gatewayClientMock),
      instance(verificationResultHandlerMock),
      instance(threeDVerificationServiceProviderMock),
    );

    when(threeDVerificationServiceProviderMock.getProvider(anything())).thenReturn(instance(threeDSecureVerificationServiceMock));
    //@ts-ignore
    when(threeDSecureVerificationServiceMock.init(anything())).thenReturn(of(void 0));
    when(cardinalCommerceVerificationServiceMock.init(anything())).thenReturn(of(void 0));
    when(gatewayClientMock.jsInit()).thenReturn(of(jsInitResponseMock));
  });

  describe('init$()', () => {
    it('initializes 3ds verification service using JSINIT response', done => {
      threeDProcess.init$().subscribe(() => {
        //@ts-ignore
        verify(threeDSecureVerificationServiceMock.init(jsInitResponseMock)).once();
        done();
      });
    });

    it('unlocks the submit button', done => {
      spyOn(messageBusMock, 'publish');

      threeDProcess.init$().subscribe(() => {
        expect(messageBusMock.publish).toHaveBeenCalledWith({ type: PUBLIC_EVENTS.UNLOCK_BUTTON }, true);
        done();
      });
    });

    it('calls binLookup on BIN_PROCESS event from message bus', done => {
      threeDProcess.init$().subscribe(() => {
        const pan = '4111111111111111';
        messageBusMock.publish({ type: PUBLIC_EVENTS.BIN_PROCESS, data: pan });
        //@ts-ignore
        verify(threeDSecureVerificationServiceMock.binLookup(pan)).once();
        done();
      });
    });
  });
});
