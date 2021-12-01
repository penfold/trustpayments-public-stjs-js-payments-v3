import { ApplePayNetworksService } from './ApplePayNetworksService';

describe('ApplePayNetworksService', () => {
  let applePayNetworksService: ApplePayNetworksService;

  beforeEach(() => {
    applePayNetworksService = new ApplePayNetworksService();
  });

  it.each([1, 2, 3, 4, 5])('setSupportedNetworks() should return default networks if none has been specified', (version: number) => {
    expect(applePayNetworksService.setSupportedNetworks(version, [])).toEqual(['amex', 'chinaUnionPay', 'discover', 'interac', 'jcb', 'masterCard', 'privateLabel', 'visa']);
  });

  it('setSupportedNetworks() should check stage 1 network', () => {
    expect(applePayNetworksService.setSupportedNetworks(1, ['amex', 'vPay', 'cartesBancaires'])).toEqual(['amex']);
    expect(applePayNetworksService.setSupportedNetworks(1, ['vPay', 'cartesBancaires'])).toEqual([]);
    expect(applePayNetworksService.setSupportedNetworks(2, ['amex', 'vPay', 'cartesBancaires'])).toEqual(['amex']);
    expect(applePayNetworksService.setSupportedNetworks(3, ['amex', 'vPay', 'cartesBancaires'])).toEqual(['amex']);
  });

  it('setSupportedNetworks() should check stage 2 network', () => {
    expect(applePayNetworksService.setSupportedNetworks(4, ['amex', 'cartesBancaires', 'mada'])).toEqual([
      'amex',
      'cartesBancaires',
    ]);
    expect(applePayNetworksService.setSupportedNetworks(4, ['mada'])).toEqual([]);
  });

  it('setSupportedNetworks() should check stage 3 network', () => {
    expect(applePayNetworksService.setSupportedNetworks(5, ['amex', 'cartesBancaires', 'mada'])).toEqual([
      'amex',
      'mada',
    ]);
    expect(applePayNetworksService.setSupportedNetworks(6, ['amex', 'cartesBancaires', 'mada'])).toEqual([
      'amex',
      'mada',
    ]);
  });
});
