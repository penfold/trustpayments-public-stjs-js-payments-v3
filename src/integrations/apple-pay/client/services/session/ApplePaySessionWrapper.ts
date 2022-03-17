import { Inject, Service } from 'typedi';
import { WINDOW } from '../../../../../shared/dependency-injection/InjectionTokens';
import { ApplePayInitError } from '../../../models/errors/ApplePayInitError';
import { IApplePayPaymentRequest } from '../../models/apple-pay-payment-data/IApplePayPaymentRequest';
import { IApplePaySession } from '../../models/IApplePaySession';
import { IApplePaySessionWrapper } from '../../models/IApplePaySessionWrapper';
import { IApplePaySessionConstructor } from './models/IApplePaySessionConstructor';

@Service()
export class ApplePaySessionWrapper implements IApplePaySessionWrapper {
  private readonly applePaySession: IApplePaySessionConstructor | undefined;

  constructor(@Inject(WINDOW) private window: Window) {
    this.applePaySession = this.window.ApplePaySession;
  }

  isApplePaySessionAvailable(): boolean {
    return Boolean(this.applePaySession);
  }

  canMakePayments(): boolean {
    this.assertApplePaySessionIsAvailable();

    return this.applePaySession.canMakePayments();
  }

  canMakePaymentsWithActiveCard(merchantId: string): Promise<boolean> {
    this.assertApplePaySessionIsAvailable();

    return this.applePaySession.canMakePaymentsWithActiveCard(merchantId);
  }

  supportsVersion(version: number): boolean {
    this.assertApplePaySessionIsAvailable();

    return this.applePaySession.supportsVersion(version);
  }

  getLatestSupportedApplePayVersion(): number {
    const versions: number[] = Array.from(Array(7).keys()).slice(1).reverse();

    return versions.find((version: number) => {
      return this.supportsVersion(version);
    });
  }

  createInstance(applePayVersion: number, applePayPaymentRequest: IApplePayPaymentRequest): IApplePaySession {
    this.assertApplePaySessionIsAvailable();

    return new this.applePaySession(applePayVersion, applePayPaymentRequest);
  }

  private assertApplePaySessionIsAvailable(): void {
    if (!this.isApplePaySessionAvailable()) {
      throw new ApplePayInitError('ApplePaySession is not available.');
    }
  }
}
