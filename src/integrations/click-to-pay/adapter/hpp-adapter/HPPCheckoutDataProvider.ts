import { Service } from 'typedi';
import { fromEvent, Observable } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { IInitialCheckoutData } from '../../digital-terminal/interfaces/IInitialCheckoutData';
import { IConsumer } from '../../digital-terminal/ISrc';
import { ICardData } from '../../digital-terminal/interfaces/ICardData';
import { DomMethods } from '../../../../application/core/shared/dom-methods/DomMethods';
import { NewCardFieldName } from '../../card-list/NewCardFieldName';
import { HPPFormFieldName } from './HPPFormFieldName';

@Service()
export class HPPCheckoutDataProvider {
  private formElement: HTMLFormElement;

  getCheckoutData(formId: string): Observable<IInitialCheckoutData> {
    this.formElement = document.querySelector(`form#${formId}`);

    return this.captureCheckoutDataOnSubmit();
  }

  private captureCheckoutDataOnSubmit(): Observable<IInitialCheckoutData> {
    return fromEvent(this.formElement, 'submit').pipe(
      filter(() => this.shouldClickToPayBeUsed()),
      tap(event => event.preventDefault()),
      map(() => this.getCheckoutDataFromForm())
    );
  }

  private getCheckoutDataFromForm(): IInitialCheckoutData {
    return {
      consumer: this.getConsumerData(),
      srcDigitalCardId: this.getFormFieldValue(HPPFormFieldName.srcCardId),
      newCardData: this.isCardListVisible() ? this.getRecognizedUserNewCardData() : this.getNewCardData(),
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

  private getRecognizedUserNewCardData(): ICardData {
    return {
      primaryAccountNumber: this.getFormFieldValue(NewCardFieldName.pan),
      panExpirationMonth: this.getFormFieldValue(NewCardFieldName.expiryMonth),
      panExpirationYear: this.getFormFieldValue(NewCardFieldName.expiryYear),
      cardSecurityCode: this.getFormFieldValue(NewCardFieldName.securityCode),
      cardholderFullName: null, // TODO confirm if it is needed
    };
  }

  private getFormFieldValue(fieldName: HPPFormFieldName | NewCardFieldName): string {
    const element = this.formElement?.elements.namedItem(fieldName);

    if (!element) {
      return '';
    }

    if (DomMethods.isRadioNodeList(element)) {
      return element.value;
    }

    if (element.attributes.getNamedItem('type')?.value === 'radio') {
      return (element as HTMLInputElement).checked ? (element as HTMLInputElement).value : '';
    }

    return (element as HTMLInputElement).value || '';
  }

  private isRegisterCardEnabled(): boolean {
    return (this.formElement?.elements.namedItem(HPPFormFieldName.register) as HTMLInputElement)?.checked;
  }

  private isCardListVisible(): boolean {
    return !!this.formElement.elements.namedItem(NewCardFieldName.pan);
  }

  private shouldClickToPayBeUsed(): boolean {
    return this.isRegisterCardEnabled() || this.isCardListVisible();
  }
}
