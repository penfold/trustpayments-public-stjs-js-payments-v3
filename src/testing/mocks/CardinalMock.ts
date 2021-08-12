import { ICardinal, IOrderObject } from '../../client/integrations/cardinal-commerce/ICardinal';
import { PaymentEvents } from '../../application/core/models/constants/PaymentEvents';
import { ajax } from 'rxjs/ajax';
import { environment } from '../../environments/environment';
import { IValidationResult } from '../../client/integrations/cardinal-commerce/data/IValidationResult';

export class CardinalMock implements ICardinal {
  private callbacks = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    [PaymentEvents.SETUP_COMPLETE]: (...args: unknown[]): unknown => void 0,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    [PaymentEvents.VALIDATED]: (...args: unknown[]): unknown => void 0,
  };

  constructor(private manualCallbackTrigger: boolean = false) {
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  configure(config: unknown): void {
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  continue(paymentBrand: string, continueObject: unknown, orderObject?: unknown, cardinalJwt?: string): void {
    if (this.manualCallbackTrigger) {
      return;
    }

    ajax({
      url: environment.CARDINAL_COMMERCE.MOCK.AUTHENTICATE_CARD_URL,
      method: 'GET',
    }).subscribe((response) => {
      const { data, jwt } = response.response as unknown as { data: IValidationResult, jwt: string };
      this.callbacks[PaymentEvents.VALIDATED](data, jwt);
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  off(event: string): void {
  }

  on(eventName: string, callback: (...eventData: unknown[]) => void): void {
    this.callbacks[eventName] = callback;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setup(initializationType: 'init' | 'complete' | 'confirm', initializationData: unknown): void {
    if (this.manualCallbackTrigger) {
      return;
    }

    setTimeout(() => this.callbacks[PaymentEvents.SETUP_COMPLETE](), 100);
  }

  trigger(eventName: string, ...data: unknown[]): void {
    if (this.callbacks[eventName]) {
      this.callbacks[eventName].apply(this, data);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  start(paymentBrand: string, orderObject: IOrderObject, jwt?: string): void {
    if (this.manualCallbackTrigger) {
      return;
    }

    this.callbacks[PaymentEvents.VALIDATED](
      {
        ActionCode: 'ERROR',
        ErrorDescription: '',
        ErrorNumber: 4000,
        Validated: false,
      },
      '',
    );
  }
}
