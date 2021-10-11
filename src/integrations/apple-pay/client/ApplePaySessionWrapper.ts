import { IApplePayPaymentRequest } from './interfaces/IApplePayPaymentRequest';
import { IApplePaySession } from './IApplePaySession';
import { Inject, Service } from 'typedi';
import { IApplePaySessionConstructor } from './interfaces/IApplePaySessionConstructor';
import { IApplePaySessionWrapper } from './interfaces/IApplePaySessionWrapper';
import { WINDOW } from '../../../shared/dependency-injection/InjectionTokens';

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
