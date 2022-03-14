import { Subject } from 'rxjs';
import { anything, deepEqual, instance, mock, spy, verify, when } from 'ts-mockito';
import { first } from 'rxjs/operators';
import { IConfig } from '../../../shared/model/config/IConfig';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { ApplePayPaymentMethodName } from '../models/IApplePayPaymentMethod';
import { SimpleMessageBus } from '../../../application/core/shared/message-bus/SimpleMessageBus';
import { GoogleAnalytics } from '../../../application/core/integrations/google-analytics/GoogleAnalytics';
import { ApplePayClient } from './ApplePayClient';
import { IApplePayPaymentRequest } from './models/apple-pay-payment-data/IApplePayPaymentRequest';
import { ApplePayClientStatus } from './models/ApplePayClientStatus';
import { IApplePayConfig } from './models/IApplePayConfig';
import { IApplePaySession } from './models/IApplePaySession';
import { APPLE_PAY_BUTTON_ID } from './services/button/ApplePayButtonProperties';
import { ApplePayButtonService } from './services/button/ApplePayButtonService';
import { ApplePayClickHandlingService } from './services/button/ApplePayClickHandlingService';
import { ApplePayConfigService } from './services/config/ApplePayConfigService';
import { IApplePayConfigObject } from './services/config/IApplePayConfigObject';
import { PaymentAuthorizationService } from './services/payment/PaymentAuthorizationService';
import { PaymentCancelService } from './services/payment/PaymentCancelService';
import { ApplePaySessionFactory } from './services/session/ApplePaySessionFactory';
import { MerchantValidationService } from './services/validation/MerchantValidationService';
import { ApplePaySessionWrapper } from './services/session/ApplePaySessionWrapper';

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
  let applePaySessionWrapperMock: ApplePaySessionWrapper;
  let applePayClickHandlingServiceMock: ApplePayClickHandlingService;
  let applePaySessionFactoryMock: ApplePaySessionFactory;
  let messageBusMock: SimpleMessageBus;
  let messageBusSpy: SimpleMessageBus;
  let merchantValidationServiceMock: MerchantValidationService;
  let paymentAuthorizationServiceMock: PaymentAuthorizationService;
  let paymentCancelServiceMock: PaymentCancelService;
  let applePaySessionMock: IApplePaySession;
  let applePaySession: IApplePaySession;
  let googleAnalyticsMock: GoogleAnalytics;

  beforeEach(() => {
    applePayConfigServiceMock = mock(ApplePayConfigService);
    applePayButtonServiceMock = mock(ApplePayButtonService);
    applePaySessionWrapperMock = mock(ApplePaySessionWrapper);
    applePayClickHandlingServiceMock = mock(ApplePayClickHandlingService);
    applePaySessionFactoryMock = mock(ApplePaySessionFactory);
    messageBusMock = new SimpleMessageBus();
    messageBusSpy = spy(messageBusMock);
    merchantValidationServiceMock = mock(MerchantValidationService);
    paymentAuthorizationServiceMock = mock(PaymentAuthorizationService);
    paymentCancelServiceMock = mock(PaymentCancelService);
    applePaySessionMock = mock<IApplePaySession>();
    applePaySession = instance(applePaySessionMock);
    googleAnalyticsMock = mock(GoogleAnalytics);

    applePayClient = new ApplePayClient(
      instance(applePayConfigServiceMock),
      instance(applePayButtonServiceMock),
      instance(applePaySessionWrapperMock),
      instance(applePayClickHandlingServiceMock),
      instance(applePaySessionFactoryMock),
      messageBusMock,
      instance(merchantValidationServiceMock),
      instance(paymentAuthorizationServiceMock),
      instance(paymentCancelServiceMock),
      instance(googleAnalyticsMock),
    );
  });

  describe('init()', () => {
    beforeEach(() => {
      when(applePaySessionWrapperMock.isApplePaySessionAvailable()).thenReturn(true);
      when(applePaySessionWrapperMock.canMakePayments()).thenReturn(true);
      when(applePayConfigServiceMock.getConfig(configMock, anything())).thenReturn(applePayConfigObjectMock);
      when(applePayClickHandlingServiceMock.bindClickHandler(anything(), anything())).thenCall(callback => {
        buttonClick.pipe(first()).subscribe(() => callback());
      });
      when(applePaySessionFactoryMock.create(anything(), anything())).thenReturn(applePaySession);
    });

    it('checks if the config contains new jwt key after sending UPDATE_JWT event', () => {
      when(applePaySessionWrapperMock.isApplePaySessionAvailable()).thenReturn(true);

      const event = {
        type: PUBLIC_EVENTS.UPDATE_JWT,
        data: {
          newJwt: 'some-jwt',
        },
      };

      applePayClient.init(configMock).subscribe();
      messageBusMock.publish(event);

      verify(applePayConfigServiceMock.getConfig(configMock, anything())).once();
      verify(applePayConfigServiceMock.getConfig(deepEqual({ ...configMock, jwt: 'some-jwt' }), anything())).once();
    });

    it('checks if UPDATE_JWT event doesn\'t affect in the config when isApplePaySessionAvailable returns false', () => {
      when(applePaySessionWrapperMock.isApplePaySessionAvailable()).thenReturn(false);

      const event = {
        type: PUBLIC_EVENTS.UPDATE_JWT,
        data: {
          newJwt: 'some-jwt',
        },
      };

      applePayClient.init(configMock).subscribe();
      messageBusMock.publish(event);

      verify(applePayConfigServiceMock.getConfig(configMock, anything())).never();
      verify(applePayConfigServiceMock.getConfig(deepEqual({ ...configMock, jwt: 'some-jwt' }), anything())).never();
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
        verify(googleAnalyticsMock.sendGaData('event', 'Apple Pay', `${ApplePayClientStatus.CAN_MAKE_PAYMENTS_WITH_ACTIVE_CARD}`, 'Can make payment')).once();
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

      verify(messageBusSpy.publish(deepEqual({
        type: PUBLIC_EVENTS.START_PAYMENT_METHOD,
        data: {
          name: ApplePayPaymentMethodName,
          data: applePayConfigObjectMock,
        },
      }))).once();
    });
  });
});
