import { Service } from 'typedi';
import { IApplePayPaymentRequest } from './IApplePayPaymentRequest';
import { IApplePaySession } from './../IApplePaySession';

@Service()
export abstract class IApplePaySessionWrapper {
  abstract isApplePaySessionAvailable(): boolean;
  abstract canMakePayments(): boolean;
  abstract canMakePaymentsWithActiveCard(merchantId: string): Promise<boolean>;
  abstract supportsVersion(version: number): boolean;
  abstract createInstance(applePayVersion: number, applePayPaymentRequest: IApplePayPaymentRequest): IApplePaySession;
}
