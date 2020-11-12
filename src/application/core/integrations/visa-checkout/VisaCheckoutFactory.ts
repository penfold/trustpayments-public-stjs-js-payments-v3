import { VisaCheckout } from './VisaCheckout';

export class VisaCheckoutFactory {
  create<T extends VisaCheckout>(visaClass: new () => T): T;
}
