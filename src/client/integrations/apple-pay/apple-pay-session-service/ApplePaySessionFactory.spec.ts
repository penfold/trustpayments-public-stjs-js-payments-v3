import { ApplePaySessionWrapper } from './ApplePaySessionWrapper';
import { IApplePaySession } from './IApplePaySession';
import { ApplePaySessionFactory } from './ApplePaySessionFactory';
import { anyNumber, anything, instance, mock, when } from 'ts-mockito';
import { IApplePayPaymentRequest } from '../../../../application/core/integrations/apple-pay/apple-pay-payment-data/IApplePayPaymentRequest';

describe('ApplePaySessionFactory', () => {
  let applePaySessionWrapperMock: ApplePaySessionWrapper;
  let applePaySessionMock: IApplePaySession;
  let applePaySessionFactory: ApplePaySessionFactory;

  beforeEach(() => {
    applePaySessionWrapperMock = mock(ApplePaySessionWrapper);
    applePaySessionMock = instance(mock<IApplePaySession>());
    applePaySessionFactory = new ApplePaySessionFactory(instance(applePaySessionWrapperMock));
    when(applePaySessionWrapperMock.createInstance(anyNumber(), anything())).thenReturn(applePaySessionMock);
  });

  it('creates returns a new instance of ApplePaySession', () => {
    const request: IApplePayPaymentRequest = {
      countryCode: 'GB',
      currencyCode: 'GBP',
      merchantCapabilities: [],
      supportedNetworks: [],
      total: { amount: '123', label: '' }
    };

    expect(applePaySessionFactory.create(123, request)).toBe(applePaySessionMock);
  });
});
