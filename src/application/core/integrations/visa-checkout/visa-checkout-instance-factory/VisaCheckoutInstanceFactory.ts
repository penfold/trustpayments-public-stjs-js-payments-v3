import { VisaCheckout } from '../VisaCheckout';

export class VisaCheckoutInstanceFactory {
  create<T extends VisaCheckout>(visaClass: new () => T): T {
    return new visaClass();
  }
}
