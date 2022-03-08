import { instance, mock, objectContaining, verify, when } from 'ts-mockito';
import { of } from 'rxjs';
import { mapTo } from 'rxjs/operators';
import { IFrameQueryingService } from '../../../shared/services/message-bus/interfaces/IFrameQueryingService';
import { IClickToPayConfig } from '../models/IClickToPayConfig';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { MERCHANT_PARENT_FRAME } from '../../../application/core/models/constants/Selectors';
import { RequestProcessingInitializer } from '../../../application/core/services/request-processor/RequestProcessingInitializer';
import { IRequestProcessingService } from '../../../application/core/services/request-processor/IRequestProcessingService';
import { ClickToPayAdapterName } from '../adapter/ClickToPayAdapterName';
import { ICheckoutResponse } from '../digital-terminal/ISrc';
import { IPaymentResult } from '../../../application/core/services/payments/IPaymentResult';
import { PaymentStatus } from '../../../application/core/services/payments/PaymentStatus';
import { ClickToPayPaymentMethodName } from '../models/ClickToPayPaymentMethodName';
import { ClickToPayPaymentMethod } from './ClickToPayPaymentMethod';

describe('ClickToPayPaymentMethod', () => {
  let sut: ClickToPayPaymentMethod;
  let frameQueryingService: IFrameQueryingService;
  let requestProcessingInitializerMock: RequestProcessingInitializer;
  let requestProcessingServiceMock: IRequestProcessingService;
  const testConfig: IClickToPayConfig = {
    adapter: ClickToPayAdapterName.hpp,
  };

  beforeEach(() => {
    frameQueryingService = mock<IFrameQueryingService>();
    requestProcessingInitializerMock = mock(RequestProcessingInitializer);
    requestProcessingServiceMock = mock<IRequestProcessingService>();
    when(requestProcessingInitializerMock.initialize()).thenReturn(of(null).pipe(mapTo(instance(requestProcessingServiceMock))));
    sut = new ClickToPayPaymentMethod(instance(frameQueryingService), instance(requestProcessingInitializerMock));
  });

  describe('init()', () => {
    const expectedEventObject: IMessageBusEvent<IClickToPayConfig> = {
      type: PUBLIC_EVENTS.CLICK_TO_PAY_INIT,
      data: testConfig,
    };
    it('should publish ClickToPay payment method client initialization event via frame querying service', done => {
      when(frameQueryingService.query(objectContaining(expectedEventObject), MERCHANT_PARENT_FRAME)).thenReturn(of(undefined));
      sut.init(testConfig).subscribe(() => {
        verify(frameQueryingService.query(objectContaining(expectedEventObject), MERCHANT_PARENT_FRAME)).once();
        done();
      });
    });
  });

  describe('start()', () => {
    const checkoutResponse: ICheckoutResponse = {
      idToken: 'some token',
      checkoutResponse: null,
      unbindAppInstance: false,
      dcfActionCode: 'COMPLETE',
    };

    beforeEach(() => {
      when(frameQueryingService.query(objectContaining({ type: PUBLIC_EVENTS.CLICK_TO_PAY_CHECKOUT }), MERCHANT_PARENT_FRAME)).thenReturn(of(checkoutResponse));
    });

    it('should use frame querying service to ask for checkout result from DigitalTerminal', done => {
      sut.start().subscribe(() => {
          verify(frameQueryingService.query(objectContaining({ type: PUBLIC_EVENTS.CLICK_TO_PAY_CHECKOUT }), MERCHANT_PARENT_FRAME)).once();
          done();
        }
      );
    });

    it('should map checkout result to payment result', done => {
      sut.start().subscribe(paymentResult => {
          expect(paymentResult).toEqual({
            status: PaymentStatus.SUCCESS,
            data: checkoutResponse,
            error: null,
            paymentMethodName: ClickToPayPaymentMethodName,
          } as IPaymentResult<ICheckoutResponse>);
          done();
        }
      );
    });

    describe.each([
      ['COMPLETE', PaymentStatus.SUCCESS],
      ['CANCEL', PaymentStatus.CANCEL],
      ['ERROR', PaymentStatus.ERROR],
      ['', PaymentStatus.FAILURE],
    ] as [ICheckoutResponse['dcfActionCode'], PaymentStatus][])('payment status should be mapped from checkout dcfActionCode:', (dcfActionCode, paymentStatus) => {
      it(`"${dcfActionCode}" => "${paymentStatus}"`, done => {
        when(frameQueryingService.query(objectContaining({ type: PUBLIC_EVENTS.CLICK_TO_PAY_CHECKOUT }), MERCHANT_PARENT_FRAME)).thenReturn(of({
              ...checkoutResponse,
              dcfActionCode,
            }
          )
        );

        sut.start().subscribe(paymentResult => {
          expect(paymentResult.status).toEqual(paymentStatus);
          done();
        });
      });
    });

  });
});
