import { Service } from 'typedi';
import { fromEvent, Observable } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { IInitialCheckoutData } from '../../digital-terminal/interfaces/IInitialCheckoutData';
import { IConsumer } from '../../digital-terminal/ISrc';
import { ICardData } from '../../digital-terminal/interfaces/ICardData';
import { DomMethods } from '../../../../application/core/shared/dom-methods/DomMethods';
import { NewCardFieldName } from '../../card-list/NewCardFieldName';
import { environment } from '../../../../environments/environment';
import { HPPFormFieldName } from './HPPFormFieldName';

@Service()
export class HPPCheckoutDataProvider {
  private formElement: HTMLFormElement;

  getCheckoutData(formId: string): Observable<IInitialCheckoutData> {
    this.formElement = document.querySelector(`form#${formId}`);
    this.preventExistingCallbacks();

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
    const data: IInitialCheckoutData = {
      consumer: this.getConsumerData(),
      srcDigitalCardId: this.getFormFieldValue(HPPFormFieldName.srcCardId),
      newCardData: this.isCardListVisible() ? this.getRecognizedUserNewCardData() : this.getNewCardData(),
    };

    return this.normalizeCheckoutData(data);
  }

  private getConsumerData(): IConsumer {
    const consumerData: IConsumer = {};
    const billingEmail = this.getFormFieldValue(HPPFormFieldName.billingEmail);
    const billingCountry = this.getFormFieldValue(HPPFormFieldName.billingCountryIso2a);
    const billingFullName = `${this.getFormFieldValue(HPPFormFieldName.billingFirstName)} ${this.getFormFieldValue(HPPFormFieldName.billingLastName)}`.trim() || null;
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
      cardholderFullName: `${this.getFormFieldValue(HPPFormFieldName.billingFirstName)} ${this.getFormFieldValue(HPPFormFieldName.billingLastName)}`.trim(),
      cardholderFirstName: this.getFormFieldValue(HPPFormFieldName.billingFirstName),
      cardholderLastName: this.getFormFieldValue(HPPFormFieldName.billingLastName),
      billingAddress: {
        name: '',
        city: this.getFormFieldValue(HPPFormFieldName.billingTown),
        countryCode: this.getFormFieldValue(HPPFormFieldName.billingCountryIso2a),
        line1: this.getFormFieldValue(HPPFormFieldName.billingPremise),
        line2: this.getFormFieldValue(HPPFormFieldName.billingStreet),
        line3: '',
        zip: this.getFormFieldValue(HPPFormFieldName.billingPostCode),
        state: this.getFormFieldValue(HPPFormFieldName.billingCounty),
      },

    };
  }

  private getRecognizedUserNewCardData(): ICardData {
    return {
      primaryAccountNumber: this.normalizePan(this.getFormFieldValue(NewCardFieldName.pan)),
      panExpirationMonth: this.getFormFieldValue(NewCardFieldName.expiryMonth),
      panExpirationYear: this.getFormFieldValue(NewCardFieldName.expiryYear),
      cardSecurityCode: this.getFormFieldValue(NewCardFieldName.securityCode),
      cardholderFullName: `${this.getFormFieldValue(HPPFormFieldName.billingFirstName)} ${this.getFormFieldValue(HPPFormFieldName.billingLastName)}`.trim(),
      cardholderFirstName: this.getFormFieldValue(HPPFormFieldName.billingFirstName),
      cardholderLastName: this.getFormFieldValue(HPPFormFieldName.billingLastName),
      billingAddress: {
        name: '',
        city: this.getFormFieldValue(HPPFormFieldName.billingTown),
        countryCode: this.getFormFieldValue(HPPFormFieldName.billingCountryIso2a),
        line1: this.getFormFieldValue(HPPFormFieldName.billingPremise),
        line2: this.getFormFieldValue(HPPFormFieldName.billingStreet),
        line3: '',
        zip: this.getFormFieldValue(HPPFormFieldName.billingPostCode),
        state: this.getFormFieldValue(HPPFormFieldName.billingCounty),
      },
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

  private normalizePan(originalPan: string): string {
    return originalPan.replace(/\s/g, '');
  }

  private normalizeCheckoutData(data: IInitialCheckoutData) {
    const normalizedData: IInitialCheckoutData = { ...data };
    const removeEmptyValues = (data: Record<string, any>) => Object.fromEntries(Object.entries(data).filter(([key, value]) => !!value)) as unknown as any;
    const normalizedBillingData = removeEmptyValues(data.newCardData.billingAddress);
    if (!Object.values(normalizedBillingData).length) {
      normalizedData.newCardData.billingAddress = null;
    } else {
      normalizedData.newCardData.billingAddress = normalizedBillingData;
    }

    normalizedData.newCardData.primaryAccountNumber = this.normalizePan(normalizedData.newCardData.primaryAccountNumber);

    if (!environment.production) {
      console.log('Selected card id:', data.srcDigitalCardId);
      console.log('Consumer data:', data.consumer);
      console.log('New card data:', data.newCardData);
    }

    return normalizedData;
  }

  private preventExistingCallbacks() {
    const existingOnSubmitCallback = this.formElement.onsubmit;
    const submitInput: HTMLElement = this.formElement.querySelector('input[type="submit"]');
    const existingSubmitClickCallback = submitInput?.onclick;

    if (existingOnSubmitCallback) {
      this.formElement.onsubmit = () => {
        if (this.shouldClickToPayBeUsed()) {
          return true;
        }
        existingOnSubmitCallback.call(window);
      };
    }

    if (existingSubmitClickCallback) {
      submitInput.onclick = () => {
        if (this.shouldClickToPayBeUsed()) {
          return true;
        }
        existingSubmitClickCallback.call(window);
      };
    }

  }
}

