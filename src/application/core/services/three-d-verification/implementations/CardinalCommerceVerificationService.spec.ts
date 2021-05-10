import { IInitializationData } from '../../../../../client/integrations/cardinal-commerce/data/IInitializationData';
import { InterFrameCommunicator } from '../../../../../shared/services/message-bus/InterFrameCommunicator';
import { IMessageBusEvent } from '../../../models/IMessageBusEvent';
import { IThreeDInitResponse } from '../../../models/IThreeDInitResponse';
import { ThreeDVerificationProvider } from '../ThreeDVerificationProvider';
import { CardinalCommerceVerificationService } from './CardinalCommerceVerificationService';
import { anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { MERCHANT_PARENT_FRAME } from '../../../models/constants/Selectors';
import { PUBLIC_EVENTS } from '../../../models/constants/EventTypes';
import { PaymentEvents } from '../../../models/constants/PaymentEvents';
import { GatewayClient } from '../../GatewayClient';
import { VerificationResultHandler } from '../VerificationResultHandler';
import { ICard } from '../../../models/ICard';
import { RequestType } from '../../../../../shared/types/RequestType';
import { of } from 'rxjs';
import { IThreeDQueryResponse } from '../../../models/IThreeDQueryResponse';

describe('CardinalCommerceVerificationService', () => {
  let interFrameCommunicatorMock: InterFrameCommunicator;
  let gatewayClient: GatewayClient;
  let verificationResultHandler: VerificationResultHandler;
  let verificationService: CardinalCommerceVerificationService;

  const jsInitResponseMock: IThreeDInitResponse = {
    errorcode: '0',
    errormessage: 'Success',
    requesttypedescription: '',
    threedinit: 'threedinit',
    transactionstartedtimestamp: 'transactionstartedtimestamp',
    threedsprovider: ThreeDVerificationProvider.CARDINAL,
    cachetoken: 'cachetoken',
  };

  const threeDQueryResponseMock: IThreeDQueryResponse = {
    jwt: '',
    acquirertransactionreference: '',
    acquirerresponsecode: '',
    acquirerresponsemessage: '',
    acsurl: '',
    enrolled: '',
    threedpayload: '',
    transactionreference: '',
    requesttypescription: '',
    threedversion: '',
  };

  const cardMock: ICard = {
    expirydate: '12/23',
    pan: '4111111111111111',
    securitycode: '123'
  }

  beforeEach(() => {
    interFrameCommunicatorMock = mock(InterFrameCommunicator);
    gatewayClient = mock(GatewayClient);
    verificationResultHandler = mock(VerificationResultHandler);
    verificationService = new CardinalCommerceVerificationService(
      instance(interFrameCommunicatorMock),
      instance(gatewayClient),
      instance(verificationResultHandler)
    );
  });

  describe('init', () => {
    it('calls init query', done => {
      const eventMock: IMessageBusEvent<IInitializationData> = {
        type: PUBLIC_EVENTS.CARDINAL_SETUP,
        data: { jwt: jsInitResponseMock.threedinit },
      };

      when(interFrameCommunicatorMock.query(anything(), MERCHANT_PARENT_FRAME)).thenResolve(void 0);

      verificationService.init(jsInitResponseMock).subscribe(res => {
        verify(interFrameCommunicatorMock.query(
          deepEqual(eventMock),
          MERCHANT_PARENT_FRAME,
        )).once();

        done();
      });
    });
  });

  describe('binLookup', () => {
    it('calls bin process query', done => {
      when(interFrameCommunicatorMock.query(anything(), MERCHANT_PARENT_FRAME)).thenResolve('hello');

      const pan = '4111111111111111';
      verificationService.binLookup(pan).subscribe(() => {
        const event = {
          type: PUBLIC_EVENTS.CARDINAL_TRIGGER,
          data: {
            eventName: PaymentEvents.BIN_PROCESS,
            data: pan,
          },
        };
        verify(interFrameCommunicatorMock.query(deepEqual(event), MERCHANT_PARENT_FRAME)).once();
        done();
      });
    });
  });

  describe('start', () => {
    it('calls start query', done => {
      when(interFrameCommunicatorMock.query(anything(), MERCHANT_PARENT_FRAME)).thenResolve('');

      when(gatewayClient.threedQuery(anything())).thenReturn(of(threeDQueryResponseMock));

      verificationService.start(
        jsInitResponseMock,
        [RequestType.THREEDQUERY],
        cardMock,
        { merchantData: 'merchantData' },
      ).subscribe((response) => {
        expect(response).toEqual({
          ...threeDQueryResponseMock,
          cachetoken: jsInitResponseMock.cachetoken
        });
        done();
      });
    });
  });
});
