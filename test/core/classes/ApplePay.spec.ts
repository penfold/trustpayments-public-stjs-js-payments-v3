import ApplePay from './../../../src/core/classes/ApplePay.class';

// given
describe('Class Apple Pay', () => {
  // given
  describe('On init', () => {
    // then
    it('should set instance with proper settings', () => {
      const { instance } = ApplePayFixture();
      expect(instance).toBeTruthy();
    });
  });

  // given
  describe('Method ifApplePayIsAvailable', () => {
    // then
    it('should return undefined if device is not Mac', () => {
      const { instance } = ApplePayFixture();
      expect(instance.ifApplePayIsAvailable()).toBeFalsy();
    });
  });

  // given
  describe('Method ifBrowserSupportsApplePayVersion', () => {
    // then
    it('should return undefined if device is not Mac', () => {
      const { instance } = ApplePayFixture();
      // expect(instance.ifBrowserSupportsApplePayVersion(3)).toBeFalsy();
    });
  });
});

function ApplePayFixture() {
  const config = {
    name: 'APPLEPAY',
    props: {
      sitereference: 'test_site',
      paymentRequest: {
        total: { label: 'Your Merchant Name', amount: '10.00' },
        countryCode: 'US',
        currencyCode: 'USD',
        merchantCapabilities: ['supports3DS', 'supportsCredit', 'supportsDebit'],
        requiredBillingContactFields: ['postalAddress'],
        requiredShippingContactFields: ['postalAddress', 'name', 'phone', 'email'],
        supportedNetworks: ['visa', 'masterCard', 'amex', 'discover']
      },
      merchantId: 'merchant.net.securetrading',
      sitesecurity: 'gABC123DEFABC'
    }
  };
  const jwt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJsaXZlMl9hdXRvand0IiwiaWF0IjoxNTUzMjcwODAwLCJwYXlsb2FkIjp7ImJhc2VhbW91bnQiOiIxMDAwIiwiY3VycmVuY3lpc28zYSI6IkdCUCIsInNpdGVyZWZlcmVuY2UiOiJsaXZlMiIsImFjY291bnR0eXBlZGVzY3JpcHRpb24iOiJFQ09NIn19.SGLwyTcqh6JGlrgzEabOLvCWRx_jeroYk67f_xSQpLM';
  const instance = new ApplePay(config, jwt);

  return {
    config,
    jwt,
    instance
  };
}
