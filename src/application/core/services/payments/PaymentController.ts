import { ContainerInstance, Service } from 'typedi';
import { IPaymentMethod } from './IPaymentMethod';
import { PaymentMethodToken } from '../../../dependency-injection/InjectionTokens';
import { IMessageBus } from '../../shared/message-bus/IMessageBus';
import { Observable } from 'rxjs';
import { ofType } from '../../../../shared/services/message-bus/operators/ofType';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { first } from 'rxjs/operators';

@Service()
export class PaymentController {
  private paymentMethods: Map<string, IPaymentMethod> = new Map();
  private destroy$: Observable<void>;

  constructor(private container: ContainerInstance, private messageBus: IMessageBus) {
    this.destroy$ = this.messageBus.pipe(ofType(PUBLIC_EVENTS.DESTROY));
  }

  init(): void {
    const paymentMethods: IPaymentMethod[] = this.container.getMany(PaymentMethodToken);

    paymentMethods.forEach(paymentMethod => this.paymentMethods.set(paymentMethod.getName(), paymentMethod));

    this.destroy$.pipe(first()).subscribe(() => {
      this.paymentMethods.clear();
    });
  }

  hasPaymentMethod(name: string): boolean {
    return this.paymentMethods.has(name);
  }

  getPaymentMethod(name: string): IPaymentMethod {
    if (!this.hasPaymentMethod(name)) {
      throw new Error(`Payment method with name ${name} not found.`);
    }

    return this.paymentMethods.get(name);
  }
}
