import { of, throwError } from 'rxjs';
import { anything, deepEqual, instance as mockInstance, mock, spy, verify, when } from 'ts-mockito';
import { APPLE_PAY_BUTTON_ID } from '../../../application/core/integrations/apple-pay/apple-pay-button-service/ApplePayButtonProperties';
import { ApplePayButtonService } from '../../../application/core/integrations/apple-pay/apple-pay-button-service/ApplePayButtonService';
import { ApplePayConfigService } from '../../../application/core/integrations/apple-pay/apple-pay-config-service/ApplePayConfigService';
import { IApplePayConfigObject } from '../../../application/core/integrations/apple-pay/apple-pay-config-service/IApplePayConfigObject';
import { ApplePayErrorService } from '../../../application/core/integrations/apple-pay/apple-pay-error-service/ApplePayErrorService';
import { ApplePayGestureService } from '../../../application/core/integrations/apple-pay/apple-pay-gesture-service/ApplePayGestureService';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { IConfig } from '../../../shared/model/config/IConfig';
import { InterFrameCommunicator } from '../../../shared/services/message-bus/InterFrameCommunicator';
import { ofType } from '../../../shared/services/message-bus/operators/ofType';
import { ApplePaySessionFactory } from './apple-pay-session-service/ApplePaySessionFactory';
import { ApplePaySessionService } from './apple-pay-session-service/ApplePaySessionService';
import { ApplePay } from './ApplePay';
import { SimpleMessageBus } from '../../../application/core/shared/message-bus/SimpleMessageBus';
import { IApplePaySession } from './apple-pay-session-service/IApplePaySession';
import { ApplePayClientErrorCode } from '../../../application/core/integrations/apple-pay/ApplePayClientErrorCode';
import { IApplePayClientStatus } from '../../../application/core/integrations/apple-pay/IApplePayClientStatus';
import { ApplePayClientStatus } from '../../../application/core/integrations/apple-pay/ApplePayClientStatus';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { RequestType } from '../../../shared/types/RequestType';

describe('ApplePay', () => {
  let applePay: ApplePay;
  let applePayButtonServiceMock: ApplePayButtonService;
  let applePayConfigServiceMock: ApplePayConfigService;
  let applePayErrorServiceMock: ApplePayErrorService;
  let applePayGestureServiceMock: ApplePayGestureService;
  let applePaySessionFactoryMock: ApplePaySessionFactory;
  let applePaySessionServiceMock: ApplePaySessionService;
  let interFrameCommunicatorMock: InterFrameCommunicator;
  let messageBus: IMessageBus;
  let messageBusSpy: IMessageBus;

  const configMock: IConfig = {
    jwt: '',
    formId: 'st-form',
    disableNotification: false,
    livestatus: 0,
    datacenterurl: 'https://example.com',
    visaCheckout: null,
    applePay: {
      buttonStyle: 'white-outline',
      buttonText: 'donate',
      merchantId: 'merchant.net.securetrading.test',
      merchantUrl: "https://example.com",
      paymentRequest: {
        countryCode: 'US',
        currencyCode: 'USD',
        merchantCapabilities: ['supports3DS', 'supportsCredit', 'supportsDebit'],
        supportedNetworks: [],
        total: {
          label: 'Secure Trading Merchant',
          amount: '10.00',
        },
      },
      placement: 'st-apple-pay',
    },
  };
  const applePayConfigMock: IApplePayConfigObject = {
    applePayConfig: {
      buttonStyle: 'white',
      buttonText: 'donate',
      merchantId: '',
      merchantUrl: "",
      paymentRequest: {
        countryCode: 'GB',
        currencyCode: 'GBP',
        merchantCapabilities: [],
        supportedNetworks: ['amex'],
        total: {
          amount: '100',
          label: '',
        },
      },
      placement: '',
    },
    applePayVersion: 5,
    locale: 'en_GB',
    formId: 'st-form',
    jwtFromConfig: '',
    validateMerchantRequest: null,
    paymentRequest: {
      countryCode: 'GB',
      currencyCode: 'GBP',
      merchantCapabilities: [],
      supportedNetworks: ['amex'],
      total: {
        amount: '100',
        label: '',
      },
    },
  };

  beforeAll(() => {
    applePayButtonServiceMock = mock(ApplePayButtonService);
    applePayConfigServiceMock = mock(ApplePayConfigService);
    applePayErrorServiceMock = mock(ApplePayErrorService);
    applePayGestureServiceMock = mock(ApplePayGestureService);
    applePaySessionFactoryMock = mock(ApplePaySessionFactory);
    applePaySessionServiceMock = mock(ApplePaySessionService);
    interFrameCommunicatorMock = mock(InterFrameCommunicator);
    applePayConfigServiceMock.updateConfigWithJwtData = jest.fn();
    messageBus = new SimpleMessageBus();
    messageBusSpy = spy(messageBus);

    applePay = new ApplePay(
      mockInstance(applePayButtonServiceMock),
      mockInstance(applePayConfigServiceMock),
      mockInstance(applePayErrorServiceMock),
      mockInstance(applePayGestureServiceMock),
      mockInstance(applePaySessionFactoryMock),
      mockInstance(applePaySessionServiceMock),
      mockInstance(interFrameCommunicatorMock),
      messageBus
    );
  });

  describe('init()', () => {
    it('init() should get config and call proper services', () => {
      when(messageBusSpy.pipe(anything())).thenReturn(
        of({
          type: PUBLIC_EVENTS.APPLE_PAY_CONFIG,
          data: configMock,
        })
      );
      when(applePaySessionServiceMock.hasApplePaySessionObject()).thenReturn(true);
      when(applePaySessionServiceMock.canMakePayments()).thenReturn(true);
      when(applePaySessionServiceMock.canMakePaymentsWithActiveCard(configMock.applePay.merchantId)).thenReturn(
        of(true)
      );
      when(messageBusSpy.pipe(ofType(PUBLIC_EVENTS.UPDATE_JWT))).thenReturn(
        of({
          type: PUBLIC_EVENTS.UPDATE_JWT,
          data: {
            newJwt: '',
          },
        })
      );
      when(applePayConfigServiceMock.getConfig(anything(), anything())).thenReturn(applePayConfigMock);
      // @ts-ignore
      applePay.updateJwtListener = jest.fn().mockImplementationOnce(() => {});

      applePay.init();
      verify(
        messageBusSpy.publish(
          deepEqual({
            type: PUBLIC_EVENTS.APPLE_PAY_CONFIG_MOCK,
            data: applePayConfigMock,
          })
        )
      ).once();
      verify(
        applePayButtonServiceMock.insertButton(
          APPLE_PAY_BUTTON_ID,
          applePayConfigMock.applePayConfig.buttonText,
          applePayConfigMock.applePayConfig.buttonStyle,
          applePayConfigMock.applePayConfig.paymentRequest.countryCode
        )
      ).once();
    });

    it('init() should throw an error when config could not be received', () => {
      const consoleErrSpy: jest.SpyInstance = jest.spyOn(console, 'error').mockImplementationOnce(() => {});

      when(messageBusSpy.pipe(anything())).thenReturn(throwError('Error'));

      applePay.init();

      expect(consoleErrSpy).toHaveBeenCalledWith('Error');
    });

    it('should throw an error `Works only on Safari` when there is no ApplePaySession object', () => {
      when(applePaySessionServiceMock.hasApplePaySessionObject()).thenReturn(false);
      const consoleErrSpy: jest.SpyInstance = jest.spyOn(console, 'error').mockImplementationOnce(() => {});
      when(messageBusSpy.pipe(anything())).thenReturn(
        of({
          type: PUBLIC_EVENTS.APPLE_PAY_CONFIG,
          data: configMock,
        })
      );

      applePay.init();

      expect(consoleErrSpy).toHaveBeenCalledWith('Works only on Safari');
    });

    it('should throw an error `Your device does not support making payments with Apple Pay` when canMakePayments return false', () => {
      when(applePaySessionServiceMock.hasApplePaySessionObject()).thenReturn(true);
      when(applePaySessionServiceMock.canMakePayments()).thenReturn(false);

      const consoleErrSpy: jest.SpyInstance = jest.spyOn(console, 'error').mockImplementationOnce(() => {});
      when(messageBusSpy.pipe(anything())).thenReturn(
        of({
          type: PUBLIC_EVENTS.APPLE_PAY_CONFIG,
          data: configMock,
        })
      );

      applePay.init();

      expect(consoleErrSpy).toHaveBeenCalledWith('Your device does not support making payments with Apple Pay');
    });

    it('should throw an error `User has not an active card provisioned into Wallet` when canMakePaymentsWithActiveCard return false', () => {
      when(applePaySessionServiceMock.hasApplePaySessionObject()).thenReturn(true);
      when(applePaySessionServiceMock.canMakePayments()).thenReturn(true);
      when(applePaySessionServiceMock.canMakePaymentsWithActiveCard(configMock.applePay.merchantId)).thenReturn(
        of(false)
      );

      const consoleErrSpy: jest.SpyInstance = jest.spyOn(console, 'error').mockImplementationOnce(() => {});
      when(messageBusSpy.pipe(anything())).thenReturn(
        of({
          type: PUBLIC_EVENTS.APPLE_PAY_CONFIG,
          data: configMock,
        })
      );

      applePay.init();

      expect(consoleErrSpy).toHaveBeenCalledWith('User has not an active card provisioned into Wallet');
    });
  });

  describe('handleWalletVerifyResponse()', () => {
    beforeAll(() => {
      messageBus = new SimpleMessageBus();
      applePay = new ApplePay(
        mockInstance(applePayButtonServiceMock),
        mockInstance(applePayConfigServiceMock),
        mockInstance(applePayErrorServiceMock),
        mockInstance(applePayGestureServiceMock),
        mockInstance(applePaySessionFactoryMock),
        mockInstance(applePaySessionServiceMock),
        mockInstance(interFrameCommunicatorMock),
        messageBus
      );

      when(applePaySessionServiceMock.hasApplePaySessionObject()).thenReturn(true);
      when(applePaySessionServiceMock.canMakePayments()).thenReturn(true);
      when(applePaySessionServiceMock.canMakePaymentsWithActiveCard(configMock.applePay.merchantId)).thenReturn(
        of(true)
      );
      when(applePayConfigServiceMock.getConfig(anything(), anything())).thenReturn(applePayConfigMock);
      when(applePayGestureServiceMock.gestureHandle).thenReturn(cb => cb());
      when(applePaySessionFactoryMock.create(anything(), anything())).thenReturn({} as IApplePaySession);
    });

    it('should verify wallet when merchant is validated', done => {
      const errorcode = '0';
      const errormessage = 'validate-success';

      messageBus.pipe(ofType(PUBLIC_EVENTS.APPLE_PAY_STATUS)).subscribe(response => {
        const { status, details }: IApplePayClientStatus = response.data;

        if (status !== ApplePayClientStatus.VALIDATE_MERCHANT_SUCCESS) {
          return;
        }

        expect(details.errorCode).toBe(Number(errorcode));
        expect(details.errorMessage).toBe(errormessage);
        done();
      });

      applePay.init();

      messageBus.publish({
        type: PUBLIC_EVENTS.APPLE_PAY_CONFIG,
        data: configMock,
      });

      // @ts-ignore
      applePay.applePaySession.onvalidatemerchant({ validationURL: 'validation-url' });

      messageBus.publish({
        type: PUBLIC_EVENTS.APPLE_PAY_VALIDATE_MERCHANT,
        data: {
          status: ApplePayClientErrorCode.VALIDATE_MERCHANT_SUCCESS,
          details: {
            walletsession: 'walletsession',
            errorcode,
            errormessage,
          },
        },
      });
    });

    it('should not verify wallet when errocode is 30000', done => {
      const errorcode = '30000';
      const errormessage = 'validate-fail';

      messageBus.pipe(ofType(PUBLIC_EVENTS.APPLE_PAY_STATUS)).subscribe(response => {
        const { status, details }: IApplePayClientStatus = response.data;

        if (status !== ApplePayClientStatus.VALIDATE_MERCHANT_ERROR) {
          return;
        }

        verify(applePaySessionServiceMock.abort()).once();

        expect(details.errorCode).toBe(Number(errorcode));
        expect(details.errorMessage).toBe(errormessage);
        done();
      });

      applePay.init();

      messageBus.publish({
        type: PUBLIC_EVENTS.APPLE_PAY_CONFIG,
        data: configMock,
      });

      // @ts-ignore
      applePay.applePaySession.onvalidatemerchant({ validationURL: 'validation-url' });

      messageBus.publish({
        type: PUBLIC_EVENTS.APPLE_PAY_VALIDATE_MERCHANT,
        data: {
          status: ApplePayClientStatus.VALIDATE_MERCHANT_ERROR,
          details: {
            walletsession: 'walletsession',
            errorcode,
            errormessage,
          },
        },
      });
    });
  });

  describe('processPayment()', () => {
    const authorizedPaymentData = {
      status: ApplePayClientErrorCode.ON_PAYMENT_AUTHORIZED,
      details: {},
    };

    const successPaymentData = {
      status: ApplePayClientErrorCode.ON_PAYMENT_AUTHORIZED,
      details: {
        errorcode: ApplePayClientErrorCode.SUCCESS,
        errormessage: 'Payment has been successfully processed',
      },
    };

    const cancelPaymentData = {
      status: ApplePayClientErrorCode.ON_PAYMENT_AUTHORIZED,
      details: {
        errorcode: ApplePayClientErrorCode.CANCEL,
      },
    };

    const errorEmptyJwtPaymentData = {
      status: ApplePayClientErrorCode.ON_PAYMENT_AUTHORIZED,
      details: {
        errorcode: ApplePayClientErrorCode.EMPTY_JWT_ERROR,
      },
    };

    const defaultErrorPaymentData = {
      status: ApplePayClientErrorCode.ON_PAYMENT_AUTHORIZED,
      details: {
        errorcode: ApplePayClientErrorCode.ERROR,
      },
    };

    beforeEach(() => {
      const form = document.createElement('form');
      form.setAttribute('id', configMock.formId);
      document.body.appendChild(form);
    });

    it('should authorize payment process', done => {
      messageBus.pipe(ofType(PUBLIC_EVENTS.APPLE_PAY_STATUS)).subscribe((response: IMessageBusEvent) => {
        const { status, details }: IApplePayClientStatus = response.data;

        if (status !== ApplePayClientStatus.ON_PAYMENT_AUTHORIZED) {
          return;
        }

        expect(details.errorCode).toBe(ApplePayClientErrorCode.ON_PAYMENT_AUTHORIZED);
        expect(details.errorMessage).toBe('');
        done();
      });

      applePay.init();

      messageBus.publish({
        type: PUBLIC_EVENTS.APPLE_PAY_CONFIG,
        data: configMock,
      });

      // @ts-ignore
      applePay.applePaySession.onpaymentauthorized({ payment: {} });

      messageBus.publish({
        type: PUBLIC_EVENTS.APPLE_PAY_STATUS,
        data: authorizedPaymentData,
      });
    });

    it('should check if payment has been authorized and returned with SUCCESS PAYMENT status', done => {
      messageBus.pipe(ofType(PUBLIC_EVENTS.APPLE_PAY_AUTHORIZATION)).subscribe(response => {
        expect(response.data.details.errorcode).toEqual(ApplePayClientErrorCode.SUCCESS);
        expect(response.data.details.errormessage).toEqual('Payment has been successfully processed');
        done();
      });

      applePay.init();

      messageBus.publish({
        type: PUBLIC_EVENTS.APPLE_PAY_CONFIG,
        data: configMock,
      });

      // @ts-ignore
      applePay.applePaySession.onpaymentauthorized({ payment: {} });

      messageBus.publish({
        type: PUBLIC_EVENTS.APPLE_PAY_AUTHORIZATION,
        data: successPaymentData,
      });
    });

    it('should check if payment has been authorized and returned with CANCEL_PAYMENT status', done => {
      messageBus.pipe(ofType(PUBLIC_EVENTS.APPLE_PAY_AUTHORIZATION)).subscribe(response => {
        expect(response.data.details.errorcode).toEqual(ApplePayClientErrorCode.CANCEL);
        expect(response.data.details.errormessage).toEqual(undefined);
        done();
      });

      applePay.init();

      messageBus.publish({
        type: PUBLIC_EVENTS.APPLE_PAY_CONFIG,
        data: configMock,
      });

      // @ts-ignore
      applePay.applePaySession.oncancel(anything());

      messageBus.publish({
        type: PUBLIC_EVENTS.APPLE_PAY_AUTHORIZATION,
        data: cancelPaymentData,
      });
    });

    it('should check if payment has been authorized but returned with EMPTY_JWT_ERROR status', done => {
      messageBus.pipe(ofType(PUBLIC_EVENTS.APPLE_PAY_AUTHORIZATION)).subscribe(response => {
        expect(response.data.details.errorcode).toEqual(ApplePayClientErrorCode.EMPTY_JWT_ERROR);
        expect(response.data.details.errormessage).toEqual(undefined);
        done();
      });

      applePay.init();

      messageBus.publish({
        type: PUBLIC_EVENTS.APPLE_PAY_CONFIG,
        data: configMock,
      });

      // @ts-ignore
      applePay.applePaySession.onpaymentauthorized({ payment: {} });

      messageBus.publish({
        type: PUBLIC_EVENTS.APPLE_PAY_AUTHORIZATION,
        data: errorEmptyJwtPaymentData,
      });
    });

    it('should check if payment process return default error status', done => {
      messageBus.pipe(ofType(PUBLIC_EVENTS.APPLE_PAY_AUTHORIZATION)).subscribe(response => {
        expect(response.data.details.errorcode).toEqual(ApplePayClientErrorCode.ERROR);
        expect(response.data.details.errormessage).toEqual(undefined);
        done();
      });

      applePay.init();

      messageBus.publish({
        type: PUBLIC_EVENTS.APPLE_PAY_CONFIG,
        data: configMock,
      });

      // @ts-ignore
      applePay.applePaySession.onpaymentauthorized({ payment: {} });

      messageBus.publish({
        type: PUBLIC_EVENTS.APPLE_PAY_AUTHORIZATION,
        data: defaultErrorPaymentData,
      });
    });

    it('should check if transaction complete event has been called if payment succeeded', done => {
      messageBus.pipe(ofType(PUBLIC_EVENTS.TRANSACTION_COMPLETE)).subscribe(response => {
        expect(response.data.errorcode).toEqual(ApplePayClientErrorCode.SUCCESS);
        expect(response.data.errormessage).toEqual('Payment has been successfully processed');
        done();
      });

      applePay.init();

      messageBus.publish({
        type: PUBLIC_EVENTS.APPLE_PAY_CONFIG,
        data: configMock,
      });

      // @ts-ignore
      applePay.applePaySession.onpaymentauthorized({ payment: {} });

      messageBus.publish({
        type: PUBLIC_EVENTS.TRANSACTION_COMPLETE,
        data: {
          requesttypedescription: RequestType.AUTH,
          errorcode: 0,
          errormessage: 'Payment has been successfully processed',
        },
      });
    });
  });
});
