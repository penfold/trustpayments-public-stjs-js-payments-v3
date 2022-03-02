import { Service } from 'typedi';
import { Observable, Subject } from 'rxjs';
import { IInitialCheckoutData } from '../../digital-terminal/interfaces/IInitialCheckoutData';
import { HPPFormFieldName } from './HPPFormFieldName';

@Service()
export class HPPCheckoutDataProvider {
  private formElement: HTMLFormElement;

  init(formId: string): Observable<IInitialCheckoutData> {
    this.formElement = document.querySelector(`form#${formId}`);

    return this.captureCheckoutData();
  }

  private captureCheckoutData(): Observable<IInitialCheckoutData> {
    const checkoutData = new Subject<IInitialCheckoutData>();

    this.formElement.addEventListener('submit', event => {
      if (this.shouldClickToPayBeUsed()) {
        event.preventDefault();
        checkoutData.next(this.getCheckoutDataFromForm());
      }
    });

    return checkoutData.asObservable();
  }

  private getCheckoutDataFromForm(): IInitialCheckoutData {
    return {
      consumer: {}, // TODO add implementation
      srcDigitalCardId: null,// TODO add when card list ready
      newCardData: {
        primaryAccountNumber: this.getFormFieldValue(HPPFormFieldName.pan),
        panExpirationMonth: this.getFormFieldValue(HPPFormFieldName.cardExpiryMonth),
        panExpirationYear: this.getFormFieldValue(HPPFormFieldName.cardExpiryYear),
        cardSecurityCode: this.getFormFieldValue(HPPFormFieldName.cardSecurityCode),
        cardholderFullName: '',
      },
    };
  }

  private getFormFieldValue(fieldName: HPPFormFieldName): string {
    const element = this.formElement?.elements.namedItem(fieldName);

    return (element as HTMLInputElement | RadioNodeList)?.value || '';
  }

  private shouldClickToPayBeUsed(): boolean {
    const registerCardEnabled = (this.formElement?.elements.namedItem(HPPFormFieldName.register) as HTMLInputElement)?.checked;

    return registerCardEnabled;
  }
}
