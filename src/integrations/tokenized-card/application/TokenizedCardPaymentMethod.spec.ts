import { anything, capture, instance, mock, resetCalls, spy, when } from 'ts-mockito';
import { of } from 'rxjs';
import { mapTo } from 'rxjs/operators';
import { IGatewayClient } from '../../../application/core/services/gateway-client/IGatewayClient';
import { RequestProcessingInitializer } from '../../../application/core/services/request-processor/RequestProcessingInitializer';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { IStore } from '../../../application/core/store/IStore';
import { IApplicationFrameState } from '../../../application/core/store/state/IApplicationFrameState';
import { SimpleMessageBus } from '../../../application/core/shared/message-bus/SimpleMessageBus';
import { TokenizedCardPaymentMethodName } from '../models/ITokenizedCardPaymentMethod';
import { PRIVATE_EVENTS, PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { ITokenizedCardPaymentConfig } from '../models/ITokenizedCardPayment';
import { MessageBus } from '../../../application/core/shared/message-bus/MessageBus';
import { FormState } from '../../../application/core/models/constants/FormState';
import { EventScope } from '../../../application/core/models/constants/EventScope';
import { MERCHANT_PARENT_FRAME } from '../../../application/core/models/constants/Selectors';
import { IRequestProcessingService } from '../../../application/core/services/request-processor/IRequestProcessingService';

import { IRequestTypeResponse } from '../../../application/core/services/st-codec/interfaces/IRequestTypeResponse';
import { IFrameQueryingService } from '../../../shared/services/message-bus/interfaces/IFrameQueryingService';
import { PaymentStatus } from '../../../application/core/services/payments/PaymentStatus';
import { TokenizedCardPaymentMethod } from './TokenizedCardPaymentMethod';

let sut: TokenizedCardPaymentMethod

const gatewayClientMock = mock<IGatewayClient>()
const requestProcessingInitializerMock = mock(RequestProcessingInitializer)
const configProviderMock = mock(ConfigProvider)
const frameQueryingServiceMock = mock<IFrameQueryingService>();
const messageBus = new SimpleMessageBus()
const storeMock = mock<IStore<IApplicationFrameState>>()

const processingServiceMock = mock<IRequestProcessingService>()

const messageBusSpied = spy(messageBus)

const config: ITokenizedCardPaymentConfig = {
  formId: 'st-form-tokenized',
}

const startData = {
  securitycode: '1234',
}

const paymentResponse: IRequestTypeResponse = {
  errorcode: '0',
};

describe('TokenizedCardPaymentMethod', () => {
  afterEach(() => {
    resetCalls(messageBusSpied)
  })

  it('should be the instance of TokenizedCardPaymentMethod', () => {
    sut = setSut()
    expect(sut).toBeInstanceOf(TokenizedCardPaymentMethod)
  })

  describe('on getName()', () => {
    it('should return TokenizedCardPaymentMethodName', () => {
      sut = setSut()
      expect(sut.getName()).toEqual(TokenizedCardPaymentMethodName)
    })
  })

  describe('on init()', () => {
   describe('afet receiving TOKENIZED_CARD_START_PAYMENT_METHOD event', () => {
     beforeEach(() => {
       when(frameQueryingServiceMock.query(anything(), anything())).thenReturn(of({}));
       sut = setSut()
       sut.init(config)
     })

     it('should publish VALIDATE_TOKENIZED_SECURITY_CODE event', () => {
       messageBus.publish({ type: PUBLIC_EVENTS.TOKENIZED_CARD_START_PAYMENT_METHOD })

       const event = capture(messageBusSpied.publish).second()

       expect(event).toEqual([{
         type: MessageBus.EVENTS.VALIDATE_TOKENIZED_SECURITY_CODE,
       }])
     })

     it('should publish BLOCK_FORM event', () => {
       messageBus.publish({ data: { validity: true, value: '1234' }, type: PRIVATE_EVENTS.CHANGE_TOKENIZED_SECURITY_CODE })
       messageBus.publish({ type: PUBLIC_EVENTS.TOKENIZED_CARD_START_PAYMENT_METHOD })

       const event = capture(messageBusSpied.publish).byCallIndex(3)

       expect(event).toEqual([{
         type: MessageBus.EVENTS_PUBLIC.BLOCK_FORM,
         data: FormState.BLOCKED,
       },  EventScope.ALL_FRAMES,
       ])

     })

     it('should publish TOKENIZED_CARD_CLIENT_INIT event', () => {
       const event = capture(frameQueryingServiceMock.query).first()

       expect(event).toEqual([{
           type: PUBLIC_EVENTS.TOKENIZED_CARD_CLIENT_INIT,
           data: config,
         },
         MERCHANT_PARENT_FRAME,
       ])
     })
   })
  })

  describe('on start()', () => {
    beforeEach(() => {
      when(storeMock.getState()).thenReturn({ storage: {},tokenizedJwt: 'test' })
      when(requestProcessingInitializerMock.initialize(anything())).thenReturn(of(instance(processingServiceMock)))
      sut = setSut()
     })

    it('should publish JWT_REPLACED event', () => {
      sut.start(startData)

      const event = capture(messageBusSpied.publish).first()

      expect(event).toEqual([{
          data: 'test',
          type: PUBLIC_EVENTS.JWT_REPLACED,
        }])
    })

    it('performs request processing and returns the PaymentResult', done => {
      when(processingServiceMock.process(anything())).thenReturn(of(paymentResponse));
      when(requestProcessingInitializerMock.initialize(anything())).thenReturn(of(mapTo(instance(processingServiceMock))).pipe((mapTo(instance(processingServiceMock)))));

      sut.start(startData).subscribe(result => {
        expect(result).toEqual({
          status: PaymentStatus.SUCCESS,
          data: paymentResponse,
          paymentMethodName: TokenizedCardPaymentMethodName,
        });
        done()
         });
    });
  })
})

function setSut() {
  return new TokenizedCardPaymentMethod(
    instance(gatewayClientMock),
    instance(requestProcessingInitializerMock),
    instance(configProviderMock),
    instance(frameQueryingServiceMock),
    messageBus,
    instance(storeMock))
}
