import { Service } from 'typedi';
import { Observable, Subject } from 'rxjs';
import { IInitialCheckoutData } from '../../digital-terminal/interfaces/IInitialCheckoutData';
import { IConsumer } from '../../digital-terminal/ISrc';
import { ICardData } from '../../digital-terminal/interfaces/ICardData';
import { DomMethods } from '../../../../application/core/shared/dom-methods/DomMethods';
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
      console.log(event)
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
      srcDigitalCardId: this.getFormFieldValue(HPPFormFieldName.srcCardId),// TODO add when card list ready
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
    console.group('FIELD VALUE',fieldName)

    if (DomMethods.isRadioNodeList(element)) {
      console.log('is radio nodelist')
      console.groupEnd();
      return element.value;
    }
    if (element.attributes.getNamedItem('type')?.value === 'radio') {
      console.log('is radio')
      console.groupEnd();
      return (element as HTMLInputElement).checked ? (element as HTMLInputElement).value : '';
    }

    console.log('is no')
    return (element as HTMLInputElement).value;
    console.groupEnd();

  }

  private shouldClickToPayBeUsed(): boolean {
    const registerCardEnabled = (this.formElement?.elements.namedItem(HPPFormFieldName.register) as HTMLInputElement)?.checked;
    const cardSelected = !!this.getFormFieldValue(HPPFormFieldName.srcCardId);
    console.log(this.getFormFieldValue(HPPFormFieldName.srcCardId));

    return registerCardEnabled || cardSelected;
  }
}
