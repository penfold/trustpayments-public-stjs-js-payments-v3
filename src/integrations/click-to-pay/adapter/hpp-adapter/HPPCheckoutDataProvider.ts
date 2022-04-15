import { Service } from 'typedi';
import { fromEvent, Observable, switchMap } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { IInitialCheckoutData } from '../../digital-terminal/interfaces/IInitialCheckoutData';
import { IConsumer } from '../../digital-terminal/ISrc';
import { ICardData } from '../../digital-terminal/interfaces/ICardData';
import { NewCardFieldName } from '../../card-list/NewCardFieldName';
import { environment } from '../../../../environments/environment';
import { JwtProvider } from '../../../../shared/services/jwt-provider/JwtProvider';
import { IStJwtPayload } from '../../../../application/core/models/IStJwtPayload';
import { HPPFormValues } from '../interfaces/HPPFormValues';
import { HPPFormFieldName } from './HPPFormFieldName';
import { HPPFormValuesProvider } from './HPPFormValuesProvider';

@Service()
export class HPPCheckoutDataProvider {
  private formElement: HTMLFormElement;

  constructor(private jwtProvider: JwtProvider, private hppFormValuesProvider: HPPFormValuesProvider) {
  }

  getCheckoutData(formId: string): Observable<IInitialCheckoutData> {
    this.formElement = document.querySelector(`form#${formId}`);
    this.preventExistingCallbacks();

    return this.jwtProvider.getJwtPayload()
      .pipe(
        switchMap(jwtPayload => this.captureCheckoutDataOnSubmit(jwtPayload))
      );
  }

  private captureCheckoutDataOnSubmit(jwtPayload): Observable<IInitialCheckoutData> {
    return fromEvent(this.formElement, 'submit').pipe(
      filter(() => this.shouldClickToPayBeUsed()),
      tap(event => event.preventDefault()),
      map(() => this.getCheckoutDataFromForm(jwtPayload))
    );
  }

  private getCheckoutDataFromForm(jwtPayload: IStJwtPayload, formValues: HPPFormValues = this.hppFormValuesProvider.getFormValues(this.formElement)): IInitialCheckoutData {
    const data: IInitialCheckoutData = {
      consumer: this.getConsumerData(jwtPayload, formValues),
      srcDigitalCardId: formValues.srcDigitalCardId,
      newCardData: this.hppFormValuesProvider.isCardListVisible(this.formElement) ? this.getRecognizedUserNewCardData(jwtPayload, formValues) : this.getNewCardData(jwtPayload, formValues),
    };

    return this.normalizeCheckoutData(data);
  }

  private getConsumerData(jwtPayload: IStJwtPayload, formValues: HPPFormValues): IConsumer {
    const consumerData: IConsumer = {};
    const billingEmail = formValues[HPPFormFieldName.billingEmail] || jwtPayload.billingemail;
    const billingCountry = formValues[HPPFormFieldName.billingCountryIso2a] || jwtPayload.billingcountryiso2a;
    const billingFullName = this.getFullName(jwtPayload, formValues);
    const billingFirstName = formValues[HPPFormFieldName.billingFirstName] || jwtPayload.billingfirstname;
    const billingLastName = formValues[HPPFormFieldName.billingLastName] || jwtPayload.billinglastname;

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

  private getNewCardData(jwtPayload: IStJwtPayload, formValues: HPPFormValues): ICardData {
    return {
      primaryAccountNumber: formValues[HPPFormFieldName.pan] || jwtPayload.pan,
      panExpirationMonth: formValues[HPPFormFieldName.cardExpiryMonth] || jwtPayload.expirydate?.split('/')[0],
      panExpirationYear: formValues[HPPFormFieldName.cardExpiryYear] || jwtPayload.expirydate?.split('/')[1],
      cardSecurityCode: formValues[HPPFormFieldName.cardSecurityCode] || jwtPayload.securitycode,
      cardholderFullName: this.getFullName(jwtPayload, formValues),
      cardholderFirstName: formValues[HPPFormFieldName.billingFirstName] || jwtPayload.billingfirstname,
      cardholderLastName: formValues[HPPFormFieldName.billingLastName] || jwtPayload.billinglastname,
      billingAddress: {
        name: '',
        city: formValues[HPPFormFieldName.billingTown] || jwtPayload.billingtown,
        countryCode: formValues[HPPFormFieldName.billingCountryIso2a] || jwtPayload.billingcountryiso2a,
        line1: formValues[HPPFormFieldName.billingPremise] || jwtPayload.billingpremise,
        line2: formValues[HPPFormFieldName.billingStreet] || jwtPayload.billingstreet,
        line3: '',
        zip: formValues[HPPFormFieldName.billingPostCode] || jwtPayload.billingpostcode,
        state: formValues[HPPFormFieldName.billingCounty] || jwtPayload.billingcounty,
      },

    };
  }

  private getRecognizedUserNewCardData(jwtPayload: IStJwtPayload, formValues: HPPFormValues): ICardData {
    return {
      primaryAccountNumber: this.normalizePan(formValues[NewCardFieldName.pan]), // ??????
      panExpirationMonth: formValues[NewCardFieldName.expiryMonth],
      panExpirationYear: formValues[NewCardFieldName.expiryYear],
      cardSecurityCode: formValues[NewCardFieldName.securityCode],
      cardholderFullName: this.getFullName(jwtPayload, formValues),
      cardholderFirstName: formValues[HPPFormFieldName.billingFirstName] || jwtPayload.billingfirstname,
      cardholderLastName: formValues[HPPFormFieldName.billingLastName] || jwtPayload.billinglastname,
      billingAddress: {
        name: '',
        city: formValues[HPPFormFieldName.billingTown] || jwtPayload.billingtown,
        countryCode: formValues[HPPFormFieldName.billingCountryIso2a] || jwtPayload.billingcountryiso2a,
        line1: formValues[HPPFormFieldName.billingPremise] || jwtPayload.billingpremise,
        line2: formValues[HPPFormFieldName.billingStreet] || jwtPayload.billingstreet,
        line3: '',
        zip: formValues[HPPFormFieldName.billingPostCode] || jwtPayload.billingpostcode,
        state: formValues[HPPFormFieldName.billingCounty] || jwtPayload.billingcounty,
      },
    };
  }

  private getFullName(jwtPayload: IStJwtPayload, formValues: HPPFormValues) {
    const firstName = formValues[HPPFormFieldName.billingFirstName] || jwtPayload.billingfirstname || '';
    const lastName = formValues[HPPFormFieldName.billingLastName] || jwtPayload.billinglastname || '';
    return `${firstName} ${lastName}`.trim();
  }

  private shouldClickToPayBeUsed(): boolean {
    return this.hppFormValuesProvider.isRegisterCardEnabled(this.formElement)
      || this.hppFormValuesProvider.isCardListVisible(this.formElement);
  }

  private normalizePan(originalPan: string): string {
    return originalPan?.replace(/\s/g, '');
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
        existingOnSubmitCallback.call(window, window);
      };
    }

    if (existingSubmitClickCallback) {
      submitInput.onclick = () => {
        if (this.shouldClickToPayBeUsed()) {
          return true;
        }
        existingSubmitClickCallback.call(window, window);
      };
    }

  }
}

