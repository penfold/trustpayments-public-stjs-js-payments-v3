import { of } from 'rxjs';
import { anyString, anything, instance, mock, verify, when } from 'ts-mockito';
import { APPLE_PAY_BUTTON_ID } from '../../../application/core/integrations/apple-pay/apple-pay-button-service/ApplePayButtonProperties';
import { ApplePayButtonService } from '../../../application/core/integrations/apple-pay/apple-pay-button-service/ApplePayButtonService';
import { ApplePayConfigService } from '../../../application/core/integrations/apple-pay/apple-pay-config-service/ApplePayConfigService';
import { IApplePayPaymentRequest } from '../../../application/core/integrations/apple-pay/apple-pay-payment-data/IApplePayPaymentRequest';
import { IApplePayConfig } from '../../../application/core/integrations/apple-pay/IApplePayConfig';
import { Locale } from '../../../application/core/shared/translator/Locale';
import { ApplePaySessionService } from '../../../client/integrations/apple-pay/apple-pay-session-service/ApplePaySessionService';
import { IConfig } from '../../../shared/model/config/IConfig';
import { ApplePayClient } from './ApplePayClient';
import { ApplePayInitError } from '../models/errors/ApplePayInitError';
import { ApplePayGestureService } from '../../../application/core/integrations/apple-pay/apple-pay-gesture-service/ApplePayGestureService';
import { InterFrameCommunicator } from '../../../shared/services/message-bus/InterFrameCommunicator';

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

  const applePayConfigMock = {
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

  let applePayClient: ApplePayClient;
  let applePayConfigServiceMock: ApplePayConfigService;
  let applePayButtonServiceMock: ApplePayButtonService;
  let applePaySessionServiceMock: ApplePaySessionService;
  let applePayGestureServiceMock: ApplePayGestureService;
  let interFrameCommunicatorMock: InterFrameCommunicator;

  describe('init()', () => {
    beforeEach(() => {
      applePayConfigServiceMock = mock(ApplePayConfigService);
      applePayButtonServiceMock = mock(ApplePayButtonService);
      applePaySessionServiceMock = mock(ApplePaySessionService);
      applePayGestureServiceMock = mock(ApplePayGestureService);
      interFrameCommunicatorMock = mock(InterFrameCommunicator);

      applePayClient = new ApplePayClient(
        instance(applePayConfigServiceMock),
        instance(applePayButtonServiceMock),
        instance(applePaySessionServiceMock),
        instance(applePayGestureServiceMock),
        instance(interFrameCommunicatorMock),
      );
    });

    it('returns success flag when payment is available', (done) => {
      when(applePaySessionServiceMock.hasApplePaySessionObject()).thenReturn(true);
      when(applePaySessionServiceMock.canMakePayments()).thenReturn(true);
      when(applePaySessionServiceMock.canMakePaymentsWithActiveCard(anyString())).thenReturn(of(true));
      when(applePayConfigServiceMock.getConfig(anything(), anything())).thenReturn({
        applePayConfig: applePayConfigMock as IApplePayConfig,
        applePayVersion: 0,
        locale: 'locale' as Locale,
        formId: 'formId',
        jwtFromConfig: 'jwtFromConfig',
        validateMerchantRequest: validateMerchantRequestMock,
        paymentRequest: paymentRequestMock,
      });

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

    it('throws an error when ApplePaySessionObject returns false', (done) => {
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
      when(applePaySessionServiceMock.hasApplePaySessionObject()).thenReturn(true);
      when(applePaySessionServiceMock.canMakePayments()).thenReturn(false);

      applePayClient.init(configMock).subscribe({
        error: err => {
          expect(err).toBeInstanceOf(ApplePayInitError);
          expect(err.toString()).toBe('Error: ApplePay not available: Your device does not support making payments with Apple Pay');
          done();
        },
      });
    });

    it('throws error when canMakePaymentsWithActiveCard function returns false', (done) => {
      when(applePaySessionServiceMock.hasApplePaySessionObject()).thenReturn(true);
      when(applePaySessionServiceMock.canMakePayments()).thenReturn(true);
      when(applePaySessionServiceMock.canMakePaymentsWithActiveCard(anyString())).thenReturn(of(false));

      applePayClient.init(configMock).subscribe({
        error: err => {
          expect(err).toBeInstanceOf(ApplePayInitError);
          expect(err.toString()).toBe('Error: ApplePay not available: No active cards in the wallet.');
          done();
        },
      });
    });
  });
});
