import { IApplePayPaymentRequest } from '../../../../application/core/integrations/apple-pay/apple-pay-payment-data/IApplePayPaymentRequest';
import { IApplePaySession } from './IApplePaySession';
import { Inject, Service } from 'typedi';
import { WINDOW } from '../../../../shared/dependency-injection/InjectionTokens';
import { IApplePaySessionConstructor } from './IApplePaySessionConstructor';
import { IApplePaySessionWrapper } from './IApplePaySessionWrapper';

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

  createInstance(applePayVersion: number, applePayPaymentRequest: IApplePayPaymentRequest): IApplePaySession {
    this.assertApplePaySessionIsAvailable();

    return new this.applePaySession(applePayVersion, applePayPaymentRequest);
  }

  private assertApplePaySessionIsAvailable(): void {
    if (!this.isApplePaySessionAvailable()) {
      throw new Error('ApplePaySession is not available.');
    }
  }
}
