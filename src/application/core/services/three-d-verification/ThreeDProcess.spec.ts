import { of } from 'rxjs';
import { anything, instance, mock, verify, when } from 'ts-mockito';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { IThreeDInitResponse } from '../../models/IThreeDInitResponse';
import { IMessageBus } from '../../shared/message-bus/IMessageBus';
import { SimpleMessageBus } from '../../shared/message-bus/SimpleMessageBus';
import { GatewayClient } from '../GatewayClient';
import { ThreeDVerificationProviderService } from './ThreeDVerificationProviderService';
import { ThreeDProcess } from './ThreeDProcess';
import { ThreeDVerificationProviderName } from './data/ThreeDVerificationProviderName';
import { IThreeDVerificationService } from './IThreeDVerificationService';
import { RequestType } from '../../../../shared/types/RequestType';
import { ICard } from '../../models/ICard';
import { IMerchantData } from '../../models/IMerchantData';
import { IThreeDQueryResponse } from '../../models/IThreeDQueryResponse';

describe('ThreeDProcess', () => {
  let messageBusMock: IMessageBus;
  let gatewayClientMock: GatewayClient;
  let threeDVerificationServiceProviderMock: ThreeDVerificationProviderService;
  let threeDVerificationServiceMock: IThreeDVerificationService<unknown>;
  let threeDProcess: ThreeDProcess;

  const jsInitResponseMock: IThreeDInitResponse = {
    errorcode: '0',
    errormessage: 'Success',
    requesttypedescription: '',
    threedinit: 'threedinit',
    transactionstartedtimestamp: 'transactionstartedtimestamp',
    threedsprovider: ThreeDVerificationProviderName.CARDINAL,
    cachetoken: 'cachetoken',
  };

  beforeEach(() => {
    messageBusMock = new SimpleMessageBus();
    gatewayClientMock = mock(GatewayClient);
    threeDVerificationServiceProviderMock = mock(ThreeDVerificationProviderService);
    threeDVerificationServiceMock = mock<IThreeDVerificationService<unknown>>();
    threeDProcess = new ThreeDProcess(
      messageBusMock,
      instance(gatewayClientMock),
      instance(threeDVerificationServiceProviderMock),
    );

    when(threeDVerificationServiceProviderMock.getProvider(jsInitResponseMock.threedsprovider))
      .thenReturn(instance(threeDVerificationServiceMock));

    when(threeDVerificationServiceMock.init(jsInitResponseMock)).thenReturn(of(void 0));
    when(gatewayClientMock.jsInit()).thenReturn(of(jsInitResponseMock));
  });

  describe('init$()', () => {
    it('initializes 3ds verification service using JSINIT response', done => {
      threeDProcess.init$().subscribe(() => {
        verify(gatewayClientMock.jsInit()).once();
        verify(threeDVerificationServiceProviderMock.getProvider(jsInitResponseMock.threedsprovider)).once();
        verify(threeDVerificationServiceMock.init(jsInitResponseMock)).once();
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
        verify(threeDVerificationServiceMock.binLookup(pan)).once();
        done();
      });
    });

    it('doesnt initialize the verification service again on UPDATE_JWT event', done => {
      threeDProcess.init$().subscribe(() => {
        messageBusMock.publish({ type: PUBLIC_EVENTS.UPDATE_JWT });
        messageBusMock.publish({ type: PUBLIC_EVENTS.UPDATE_JWT });
        verify(threeDVerificationServiceMock.init(anything())).once();
        done();
      });
    });
  });

  describe('performThreeDQuery$', () => {
    const requestTypes = [RequestType.THREEDQUERY, RequestType.AUTH];
    const card: ICard = { pan: '4111111111111111', expirydate: '12/23', securitycode: '123' };
    const merchantData: IMerchantData = { foo: 'bar' };
    const threeDQueryResponse: IThreeDQueryResponse = {
      jwt: 'jwt',
      acquirertransactionreference: '',
      acquirerresponsecode: '',
      acquirerresponsemessage: '',
      acsurl: '',
      enrolled: 'Y',
      threedpayload: '',
      transactionreference: '',
      requesttypescription: '',
      threedversion: '',
    };
    const newJsInitResponse: IThreeDInitResponse = {
      errorcode: '0',
      errormessage: '',
      requesttypedescription: RequestType.JSINIT,
      transactionstartedtimestamp: '',
      threedsprovider: ThreeDVerificationProviderName.TP,
    };

    beforeEach(() => {
      when(threeDVerificationServiceMock.start(
        anything(),
        requestTypes,
        card,
        merchantData,
      )).thenReturn(of(threeDQueryResponse));

      when(gatewayClientMock.jsInit()).thenReturn(
        of(jsInitResponseMock),
        of(newJsInitResponse),
      );

      threeDProcess.init$().subscribe();
    });

    it('runs start() on verificationService using the latest jsInit response', done => {
      threeDProcess.performThreeDQuery$(requestTypes, card, merchantData).subscribe(result => {
        verify(gatewayClientMock.jsInit()).once();
        verify(threeDVerificationServiceMock.start(jsInitResponseMock, requestTypes, card, merchantData)).once();
        expect(result).toBe(threeDQueryResponse);
        done();
      });
    });

    it('runs start() with updated jsInit response after UPDATE_JWT event', done => {
      messageBusMock.publish({ type: PUBLIC_EVENTS.UPDATE_JWT });

      threeDProcess.performThreeDQuery$(requestTypes, card, merchantData).subscribe(result => {
        verify(gatewayClientMock.jsInit()).twice();
        verify(threeDVerificationServiceMock.start(newJsInitResponse, requestTypes, card, merchantData)).once();
        expect(result).toBe(threeDQueryResponse);
        done();
      });
    });
  });
});
