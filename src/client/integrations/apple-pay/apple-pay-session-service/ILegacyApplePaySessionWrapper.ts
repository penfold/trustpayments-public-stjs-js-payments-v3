import { IApplePayPaymentRequest } from '../../../../application/core/integrations/apple-pay/apple-pay-payment-data/IApplePayPaymentRequest';
import { IApplePaySession } from './IApplePaySession';
import { Service } from 'typedi';

@Service()
export abstract class ILegacyApplePaySessionWrapper {
  abstract isApplePaySessionAvailable(): boolean;
  abstract canMakePayments(): boolean;
  abstract canMakePaymentsWithActiveCard(merchantId: string): Promise<boolean>;
  abstract supportsVersion(version: number): boolean;
  abstract createInstance(applePayVersion: number, applePayPaymentRequest: IApplePayPaymentRequest): IApplePaySession;
}
