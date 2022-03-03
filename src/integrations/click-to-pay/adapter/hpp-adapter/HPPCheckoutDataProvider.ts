import { Service } from 'typedi';
import { Observable, Subject } from 'rxjs';
import { IInitialCheckoutData } from '../../digital-terminal/interfaces/IInitialCheckoutData';
import { IConsumer } from '../../digital-terminal/ISrc';
import { ICardData } from '../../digital-terminal/interfaces/ICardData';
import { HPPFormFieldName } from './HPPFormFieldName';

@Service()
export class HPPCheckoutDataProvider {
  private formElement: HTMLFormElement;

  getCheckoutData(formId: string): Observable<IInitialCheckoutData> {
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
      consumer: this.getConsumerData(),
      srcDigitalCardId: null,// TODO add when card list ready
      newCardData: this.getNewCardData(),
    };
  }

  private getConsumerData(): IConsumer {
    const consumerData: IConsumer = {};
    const billingEmail = this.getFormFieldValue(HPPFormFieldName.billingEmail);
    const billingCountry = this.getFormFieldValue(HPPFormFieldName.billingCountryIso2a);
    const billingFullName = `${this.getFormFieldValue(HPPFormFieldName.billingFirstName)} ${this.getFormFieldValue(HPPFormFieldName.billingLastName)}`.trim();
    const billingFirstName = this.getFormFieldValue(HPPFormFieldName.billingFirstName);
    const billingLastName = this.getFormFieldValue(HPPFormFieldName.billingLastName);

    if (billingFirstName) {
      consumerData.firstName = billingFirstName;
    }
    if (billingLastName) {
      consumerData.lastName = billingLastName;
    }

    if (billingEmail) {
      consumerData.emailAddress = billingEmail;
      consumerData.consumerIdentity = {
        type: 'EMAIL',
        identityValue: billingEmail,
      };
    }

    if (billingCountry) {
      consumerData.countryCode = billingCountry;
    }

    if (billingFullName) {
      consumerData.fullName = billingFullName;
    }

    return consumerData;
  }

  private getNewCardData(): ICardData {
    return {
      primaryAccountNumber: this.getFormFieldValue(HPPFormFieldName.pan),
      panExpirationMonth: this.getFormFieldValue(HPPFormFieldName.cardExpiryMonth),
      panExpirationYear: this.getFormFieldValue(HPPFormFieldName.cardExpiryYear),
      cardSecurityCode: this.getFormFieldValue(HPPFormFieldName.cardSecurityCode),
      cardholderFullName: `${this.getFormFieldValue(HPPFormFieldName.billingFirstName)} ${this.getFormFieldValue(HPPFormFieldName.billingLastName)}`.trim() || null,
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
