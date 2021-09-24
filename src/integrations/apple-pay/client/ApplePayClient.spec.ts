import { anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { APPLE_PAY_BUTTON_ID } from '../../../application/core/integrations/apple-pay/apple-pay-button-service/ApplePayButtonProperties';
import { ApplePayButtonService } from '../../../application/core/integrations/apple-pay/apple-pay-button-service/ApplePayButtonService';
import { ApplePayConfigService } from '../../../application/core/integrations/apple-pay/apple-pay-config-service/ApplePayConfigService';
import { IApplePayPaymentRequest } from '../../../application/core/integrations/apple-pay/apple-pay-payment-data/IApplePayPaymentRequest';
import { IApplePayConfig } from '../../../application/core/integrations/apple-pay/IApplePayConfig';
import { ApplePaySessionService } from '../../../client/integrations/apple-pay/apple-pay-session-service/ApplePaySessionService';
import { IConfig } from '../../../shared/model/config/IConfig';
import { ApplePayClient } from './ApplePayClient';
import { ApplePayInitError } from '../models/errors/ApplePayInitError';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { ApplePayClickHandlingService } from './ApplePayClickHandlingService';
import { IApplePaySession } from '../../../client/integrations/apple-pay/apple-pay-session-service/IApplePaySession';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { ApplePaySessionFactory } from '../../../client/integrations/apple-pay/apple-pay-session-service/ApplePaySessionFactory';
import { IApplePayConfigObject } from '../../../application/core/integrations/apple-pay/apple-pay-config-service/IApplePayConfigObject';
import { of, Subject } from 'rxjs';
import { ApplePayPaymentMethodName } from '../models/IApplePayPaymentMethod';
import { MerchantValidationService } from './MerchantValidationService';
import { PaymentAuthorizationService } from './PaymentAuthorizationService';
import { first } from 'rxjs/operators';
import { JwtDecoder } from '../../../shared/services/jwt-decoder/JwtDecoder';

describe('ApplePayClient', () => {
  const configMock: IConfig = {
    applePay: {
      buttonStyle: 'white-outline',
      buttonText: 'buy',
      merchantId: 'merchant.net.securetrading.test',
      paymentRequest: {
        countryCode: 'US',
        currencyCode: 'USD',
        merchantCapabilities: [
          'supports3DS',
          'supportsCredit',
          'supportsDebit',
        ],
        supportedNetworks: ['visa', 'amex'],
        total: {
          label: 'Secure Trading Merchant',
          amount: '10.00',
        },
      },
      placement: 'st-apple-pay',
    },
  };

  const paymentRequestMock: IApplePayPaymentRequest = {
    countryCode: 'countryCode',
    currencyCode: 'currencyCode',
    merchantCapabilities: ['supports3DS'],
    supportedNetworks: ['amex'],
    total: {
      amount: 'amount',
      label: 'label',
    },
  };

  const applePayConfigMock: IApplePayConfig = {
    buttonStyle: 'black',
    buttonText: 'plain',
    merchantId: 'merchantId',
    paymentRequest: paymentRequestMock,
    placement: 'placement',
  };

  const validateMerchantRequestMock = {
    walletmerchantid: 'walletmerchantid',
    walletrequestdomain: window.location.hostname,
    walletsource: 'walletsource',
    walletvalidationurl: 'walletvalidationurl',
  };

  const applePayConfigObjectMock: IApplePayConfigObject = {
    applePayConfig: applePayConfigMock,
    applePayVersion: 0,
    locale: 'en_GB',
    formId: 'formId',
    jwtFromConfig: 'jwtFromConfig',
    validateMerchantRequest: validateMerchantRequestMock,
    paymentRequest: paymentRequestMock,
  };

  const buttonClick = new Subject();

  let applePayClient: ApplePayClient;
  let applePayConfigServiceMock: ApplePayConfigService;
  let applePayButtonServiceMock: ApplePayButtonService;
  let applePaySessionServiceMock: ApplePaySessionService;
  let applePayClickHandlingServiceMock: ApplePayClickHandlingService;
  let applePaySessionFactoryMock: ApplePaySessionFactory;
  let messageBusMock: IMessageBus;
  let merchantValidationServiceMock: MerchantValidationService;
  let paymentAuthorizationServiceMock: PaymentAuthorizationService;
  let applePaySessionMock: IApplePaySession;
  let applePaySession: IApplePaySession;
  let jwtDecoderMock: JwtDecoder;

  beforeEach(() => {
    applePayConfigServiceMock = mock(ApplePayConfigService);
    applePayButtonServiceMock = mock(ApplePayButtonService);
    applePaySessionServiceMock = mock(ApplePaySessionService);
    applePayClickHandlingServiceMock = mock(ApplePayClickHandlingService);
    applePaySessionFactoryMock = mock(ApplePaySessionFactory);
    messageBusMock = mock<IMessageBus>();
    merchantValidationServiceMock = mock(MerchantValidationService);
    paymentAuthorizationServiceMock = mock(PaymentAuthorizationService);
    applePaySessionMock = mock<IApplePaySession>();
    applePaySession = instance(applePaySessionMock);
    jwtDecoderMock = mock(JwtDecoder);

    applePayClient = new ApplePayClient(
      instance(applePayConfigServiceMock),
      instance(applePayButtonServiceMock),
      instance(applePaySessionServiceMock),
      instance(applePayClickHandlingServiceMock),
      instance(applePaySessionFactoryMock),
      instance(messageBusMock),
      instance(merchantValidationServiceMock),
      instance(paymentAuthorizationServiceMock),
      instance(jwtDecoderMock),
    );
  });

  describe('init()', () => {
    beforeEach(() => {
      when(applePaySessionServiceMock.hasApplePaySessionObject()).thenReturn(true);
      when(applePaySessionServiceMock.canMakePayments()).thenReturn(true);
      when(applePayConfigServiceMock.getConfig(configMock, anything())).thenReturn(applePayConfigObjectMock);
      when(applePayClickHandlingServiceMock.bindClickHandler(anything(), anything())).thenCall(callback => {
        buttonClick.pipe(first()).subscribe(() => callback());
      });
      when(applePaySessionFactoryMock.create(anything(), anything())).thenReturn(applePaySession);
    });

    it('throws an error when hasApplePaySessionObject returns false', (done) => {
      when(applePaySessionServiceMock.hasApplePaySessionObject()).thenReturn(false);

      applePayClient.init(configMock).subscribe({
        error: err => {
          expect(err).toBeInstanceOf(ApplePayInitError);
          expect(err.toString()).toBe('Error: ApplePay not available: Works only on Safari');
          done();
        },
      });
    });

    it('throws error when canMakePayments function returns false', (done) => {
      when(applePaySessionServiceMock.canMakePayments()).thenReturn(false);

      applePayClient.init(configMock).subscribe({
        error: err => {
          expect(err).toBeInstanceOf(ApplePayInitError);
          expect(err.toString()).toBe('Error: ApplePay not available: Your device does not support making payments with Apple Pay');
          done();
        },
      });
    });

    it('resolves the AP config and inserts the pay button', done => {
      applePayClient.init(configMock).subscribe(() => {
        verify(applePayConfigServiceMock.getConfig(configMock, anything())).once();
        verify(applePayButtonServiceMock.insertButton(
          APPLE_PAY_BUTTON_ID,
          applePayConfigMock.buttonText,
          applePayConfigMock.buttonStyle,
          applePayConfigMock.paymentRequest.countryCode,
        )).once();
        done();
      });
    });

    it('inserts the button into a configured buttonPlacement', done => {
      const configWithButtonPlacement: IApplePayConfigObject = JSON.parse(JSON.stringify(applePayConfigObjectMock));

      configWithButtonPlacement.applePayConfig.buttonPlacement = 'foobar2';

      when(applePayConfigServiceMock.getConfig(configMock, anything())).thenReturn(configWithButtonPlacement);

      applePayClient.init(configMock).subscribe(() => {
        verify(applePayButtonServiceMock.insertButton(
          'foobar2',
          applePayConfigMock.buttonText,
          applePayConfigMock.buttonStyle,
          applePayConfigMock.paymentRequest.countryCode,
        )).once();
        done();
      });
    });

    it('returns success flag when payment is available', (done) => {
      applePayClient.init(configMock).subscribe(() => done());
    });

    it('initializes ApplePaySession on button click', () => {
      applePayClient.init(configMock).subscribe(() => {
        verify(applePayClickHandlingServiceMock.bindClickHandler(anything(), APPLE_PAY_BUTTON_ID)).once();
      });

      buttonClick.next(undefined);

      verify(applePaySessionFactoryMock.create(applePayConfigObjectMock.applePayVersion, applePayConfigObjectMock.paymentRequest)).once();
      verify(merchantValidationServiceMock.init(applePaySession, applePayConfigObjectMock)).once();
      verify(applePaySessionMock.begin()).once();
    });

    it('publishes START_PAYMENT_METHOD event', () => {
      applePayClient.init(configMock).subscribe();

      buttonClick.next(undefined);

      verify(messageBusMock.publish(deepEqual({
        type: PUBLIC_EVENTS.START_PAYMENT_METHOD,
        data: {
          name: ApplePayPaymentMethodName,
          data: applePayConfigObjectMock,
        },
      }))).once();
    });

    it('publishes APPLE_PAY_CANCELLED event on cancel', done => {
      applePayClient.init(configMock).subscribe(() => {
        buttonClick.next(undefined);
        applePaySession.oncancel(new Event('cancel'));
        verify(messageBusMock.publish(deepEqual({ type: PUBLIC_EVENTS.APPLE_PAY_CANCELLED }))).once();
        done();
      });

      buttonClick.next(undefined);

      verify(applePaySessionFactoryMock.create(applePayConfigObjectMock.applePayVersion, applePayConfigObjectMock.paymentRequest)).once();
      verify(merchantValidationServiceMock.init(applePaySession, applePayConfigObjectMock)).once();
      verify(applePaySessionMock.begin()).once();
    });
  });
});
