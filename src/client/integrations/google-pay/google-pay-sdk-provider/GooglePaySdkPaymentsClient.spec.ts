import { IGooglePlayIsReadyToPayRequest } from '../../../../integrations/google-pay/models/IGooglePayPaymentRequest';
import { IGooglePaySessionPaymentsClient } from '../../../../integrations/google-pay/models/IGooglePayPaymentsClient';
import { googlePayConfigMock } from '../GooglePayConfigMock';
import { googlePaySdkPaymentsClientMock } from './GooglePaySdkPaymentsClientMock'
import { paymentResponseMock } from './GooglePaySdkPaymentsClientMock'

describe('GooglePaySdkProvider', () => {
  let sut: IGooglePaySessionPaymentsClient;
  const requestMock: IGooglePlayIsReadyToPayRequest = {
    apiVersion: 0,
    apiVersionMinor: 2,
    allowedPaymentMethods: [{
      parameters: {
        allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
        allowedCardNetworks: ['AMEX', 'DISCOVER', 'INTERAC', 'JCB', 'MASTERCARD', 'VISA'],
      },
      tokenizationSpecification: {
        parameters: {
          gateway: 'trustpayments',
          gatewayMerchantId: 'test_jsautocardinal91923',
        },
        type: 'PAYMENT_GATEWAY',
      },
      type: 'CARD',
    }],
  }

  beforeEach(() => {
    sut = googlePaySdkPaymentsClientMock;
  })

  it('returns correct value for isReadyToPay', done => {
    sut.isReadyToPay(requestMock).then(value => {
      expect(value).toStrictEqual({ result: true });
      done();
    });
  });

  it('returns correct value for loadPaymentData', done => {
    sut.loadPaymentData(googlePayConfigMock.paymentRequest).then(value => {
      expect(value).toStrictEqual(paymentResponseMock);
      done();
    });
  });
});
