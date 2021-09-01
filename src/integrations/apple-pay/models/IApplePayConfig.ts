export const ApplePayConfigName = 'applePay2';

export interface IApplePay2Config {
  buttonStyle: 'black' | 'white' | 'white-outline';
  buttonText: 'plain' | 'buy' | 'book' | 'donate' | 'check-out' | 'subscribe';
  merchantId: string;
  merchantUrl?: string;
  paymentRequest: any;
  placement: string;
}