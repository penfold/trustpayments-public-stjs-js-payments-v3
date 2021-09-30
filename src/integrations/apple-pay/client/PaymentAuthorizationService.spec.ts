import { mock, instance, when, anything, verify, deepEqual } from 'ts-mockito';
import { EMPTY, of, throwError } from 'rxjs';
import { IApplePaySession } from '../../../client/integrations/apple-pay/apple-pay-session-service/IApplePaySession';
import { IFrameQueryingService } from '../../../shared/services/message-bus/interfaces/IFrameQueryingService';
import { PaymentAuthorizationService } from './PaymentAuthorizationService';
import { CONTROL_FRAME_IFRAME } from '../../../application/core/models/constants/Selectors';
import { IApplePayConfigObject } from '../../../application/core/integrations/apple-pay/apple-pay-config-service/IApplePayConfigObject';
import { IApplePayValidateMerchantRequest } from '../../../application/core/integrations/apple-pay/apple-pay-walletverify-data/IApplePayValidateMerchantRequest';
import { IApplePayPaymentAuthorizedEvent } from '../../../application/core/integrations/apple-pay/apple-pay-payment-data/IApplePayPaymentAuthorizedEvent';
import { ApplePayPaymentMethodType } from '../../../application/core/integrations/apple-pay/apple-pay-payment-data/ApplePayPaymentMethodType';
import { ApplePayPaymentPassActivationState } from '../../../application/core/integrations/apple-pay/apple-pay-payment-data/ApplePayPaymentPassActivationState';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { ApplePayStatus } from '../../../client/integrations/apple-pay/apple-pay-session-service/ApplePayStatus';
import { IApplePayProcessPaymentResponse } from '../../../application/core/integrations/apple-pay/apple-pay-payment-service/IApplePayProcessPaymentResponse';
import { DomMethods } from '../../../application/core/shared/dom-methods/DomMethods';
import { GoogleAnalytics } from '../../../application/core/integrations/google-analytics/GoogleAnalytics';

describe('PaymentAuthorizationService', () => {
  let frameQueryingServiceMock: IFrameQueryingService;
  let googleAnalyticsMock: GoogleAnalytics;
  let applePaySessionMock: IApplePaySession;
  let applePaySession: IApplePaySession;
  let paymentAuthorizationService: PaymentAuthorizationService;

  beforeEach(() => {
    frameQueryingServiceMock = mock<IFrameQueryingService>();
    googleAnalyticsMock = mock(GoogleAnalytics);
    applePaySessionMock = mock<IApplePaySession>();
    applePaySession = instance(applePaySessionMock);
    paymentAuthorizationService = new PaymentAuthorizationService(
      instance(frameQueryingServiceMock),
      instance(googleAnalyticsMock),
    );

    DomMethods.parseForm = jest.fn().mockReturnValueOnce({
      billingamount: '',
      billingemail: '',
      billingfirstname: '',
    });

    when(frameQueryingServiceMock.query(anything(), anything())).thenReturn(of(EMPTY));
  });

  describe('init()', () => {
    const validateMerchantRequest: IApplePayValidateMerchantRequest = {
      walletvalidationurl: 'walletvalidationurl',
      walletrequestdomain: 'walletrequestdomain',
      walletsource: 'walletsource',
      walletmerchantid: 'walletmerchantid',
    };

    const config: IApplePayConfigObject = {
      validateMerchantRequest,
      applePayConfig: null,
      formId: '',
      jwtFromConfig: '',
      applePayVersion: 1,
      paymentRequest: null,
      locale: 'en_GB',
    };

    const event: IApplePayPaymentAuthorizedEvent = {
      payment: {
        token: {
          paymentMethod: {
            displayName: 'displayName',
            network: 'network',
            type: ApplePayPaymentMethodType.CREDIT,
            paymentPass: {
              primaryAccountIdentifier: 'primaryAccountIdentifier',
              primaryAccountNumberSuffix: 'primaryAccountNumberSuffix',
              activationState: ApplePayPaymentPassActivationState.ACTIVATED,
            },
            billingContact: {
              phoneNumber: 'phoneNumber',
              emailAddress: 'emailAddress',
              givenName: 'givenName',
              familyName: 'familyName',
              phoneticGivenName: 'phoneticGivenName',
              phoneticFamilyName: 'phoneticFamilyName',
              addressLines: 'addressLines',
              subLocality: 'subLocality',
              locality: 'locality',
              postalCode: 'postalCode',
              subAdministrativeArea: 'subAdministrativeArea',
              administrativeArea: 'administrativeArea',
              country: 'country',
              countryCode: 'countryCode',
            },
          },
          transactionIdentifier: 'transactionIdentifier',
          paymentData: 'paymentData',
        },
      },
    };

    const processPaymentResponse: IApplePayProcessPaymentResponse = {
      acquirerresponsecode: 'acquirerresponsecode',
      authcode: 'authcode',
      baseamount: 'baseamount',
      cavv: 'cavv',
      currencyiso3a: 'currencyiso3a',
      dccenabled: 'dccenabled',
      eci: 'eci',
      errorcode: 'errorcode',
      errormessage: 'errormessage',
      livestatus: 'livestatus',
      maskedpan: 'maskedpan',
      merchantcountryiso2a: 'merchantcountryiso2a',
      merchantname: 'merchantname',
      merchantnumber: 'merchantnumber',
      operatorname: 'operatorname',
      paymenttypedescription: 'paymenttypedescription',
      securityresponseaddress: 'securityresponseaddress',
      securityresponsepostcode: 'securityresponsepostcode',
      securityresponsesecuritycode: 'securityresponsesecuritycode',
      settleduedate: 'settleduedate',
      settlestatus: 'settlestatus',
      splitfinalnumber: 'splitfinalnumber',
      tid: 'tid',
      tokenisedpayment: 'tokenisedpayment',
      tokentype: 'tokentype',
      transactionreference: 'transactionreference',
      transactionstartedtimestamp: 'transactionstartedtimestamp',
      walletdisplayname: 'walletdisplayname',
      walletsource: 'walletsource',
    }

    it('sends payment authorization query and complete payment', () => {
      processPaymentResponse.errorcode = '0';
      when(frameQueryingServiceMock.query(anything(), CONTROL_FRAME_IFRAME)).thenReturn(of(processPaymentResponse));

      paymentAuthorizationService.init(applePaySession, config);

      applePaySession.onpaymentauthorized(event);

      verify(frameQueryingServiceMock.query(deepEqual({
        type: PUBLIC_EVENTS.APPLE_PAY_AUTHORIZATION_2,
        data: {
          billingamount: '',
          billingemail: '',
          billingfirstname: '',
          walletsource: 'APPLEPAY',
          wallettoken: JSON.stringify(event.payment),
          termurl: 'https://termurl.com',
        },
      }), CONTROL_FRAME_IFRAME)).once();

      verify(applePaySessionMock.completePayment(deepEqual({ status: ApplePayStatus.STATUS_SUCCESS }))).once();
      verify(googleAnalyticsMock.sendGaData('event', 'Apple Pay', 'payment', 'Apple Pay payment completed')).once();
    });

    it('sends payment authorization query and propagate failure when response errorcode!=0', () => {
      const errorResponse = { ...processPaymentResponse, errorcode: '123' };

      when(frameQueryingServiceMock.query(anything(), CONTROL_FRAME_IFRAME)).thenReturn(of(errorResponse));

      paymentAuthorizationService.init(applePaySession, config);

      applePaySession.onpaymentauthorized(event);

      verify(applePaySessionMock.completePayment(deepEqual({ status: ApplePayStatus.STATUS_FAILURE }))).once();
      verify(googleAnalyticsMock.sendGaData('event', 'Apple Pay', 'payment', 'Apple Pay payment failure')).once();
    });

    it('sends payment authorization query and propagate failure when request fails', () => {
      when(frameQueryingServiceMock.query(anything(), CONTROL_FRAME_IFRAME)).thenReturn(throwError(() => new Error()));

      paymentAuthorizationService.init(applePaySession, config);

      applePaySession.onpaymentauthorized(event);

      verify(applePaySessionMock.completePayment(deepEqual({ status: ApplePayStatus.STATUS_FAILURE }))).once();
      verify(googleAnalyticsMock.sendGaData('event', 'Apple Pay', 'payment', 'Apple Pay payment error')).once();
    });
  });
});
