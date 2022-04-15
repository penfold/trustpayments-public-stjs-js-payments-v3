import faker from '@faker-js/faker';
import { NewCardFieldName } from '../../card-list/NewCardFieldName';
import { HPPFormValues } from '../interfaces/HPPFormValues';
import { IStJwtPayload } from '../../../../application/core/models/IStJwtPayload';
import { IInitialCheckoutData } from '../../digital-terminal/interfaces/IInitialCheckoutData';
import { HPPFormFieldName } from './HPPFormFieldName';

const jwtExpirationYear = faker.date.future().getFullYear().toString();
const jwtExpirationMonth = faker.date.future().getMonth().toString();
export const testFormFieldsValues: HPPFormValues = {
  [HPPFormFieldName.cardExpiryMonth]: faker.date.future().getMonth().toString(),
  [HPPFormFieldName.cardExpiryYear]: faker.date.future().getFullYear().toString(),
  [HPPFormFieldName.pan]: faker.finance.creditCardNumber('VISA'),
  [HPPFormFieldName.cardSecurityCode]: faker.finance.creditCardCVV(),
  [HPPFormFieldName.register]: '',
  [HPPFormFieldName.billingCountryIso2a]: faker.address.countryCode(),
  [HPPFormFieldName.billingCounty]: faker.address.county(),
  [HPPFormFieldName.billingEmail]: faker.internet.email(),
  [HPPFormFieldName.billingFirstName]: faker.name.firstName(),
  [HPPFormFieldName.billingLastName]: faker.name.lastName(),
  [HPPFormFieldName.billingPostCode]: faker.address.zipCode(),
  [HPPFormFieldName.billingPrefixName]: faker.name.prefix(),
  [HPPFormFieldName.billingPremise]: faker.address.streetAddress(),
  [HPPFormFieldName.billingStreet]: faker.address.streetName(),
  [HPPFormFieldName.billingTelephone]: faker.phone.phoneNumber(),
  [HPPFormFieldName.billingTelephoneType]: 'M',
  [HPPFormFieldName.billingTown]: faker.address.cityName(),
  [HPPFormFieldName.srcCardId]: undefined,
  [NewCardFieldName.pan]: faker.finance.creditCardNumber(),
  [NewCardFieldName.expiryMonth]: faker.date.future().getMonth().toString(),
  [NewCardFieldName.expiryYear]: faker.date.future().getFullYear().toString(),
  [NewCardFieldName.securityCode]: faker.finance.creditCardCVV(),
};

export const testFormFieldsValuesIncomplete: HPPFormValues = {
  ...testFormFieldsValues,
  [HPPFormFieldName.billingCountryIso2a]: '',
  [HPPFormFieldName.billingCounty]: '',
  [HPPFormFieldName.billingEmail]: '',
  [HPPFormFieldName.billingFirstName]: '',
};
export const mockJwtPayload: IStJwtPayload = {
  pan: faker.finance.creditCardNumber(),
  expirydate: `${jwtExpirationMonth}/${jwtExpirationYear}`,
  billingcountryiso2a: faker.address.countryCode(),
  billingcounty: faker.address.county(),
  billingfirstname: faker.name.firstName(),
  billinglastname: faker.name.lastName(),
  billingmiddlename: faker.name.middleName(),
  billingpostcode: faker.address.zipCode(),
  billingprefixname: faker.name.prefix(),
  billingpremise: faker.address.streetAddress(),
  billingstreet: faker.address.streetName(),
  billingsuffixname: faker.name.suffix(),
  billingtown: faker.address.cityName(),
  billingemail: faker.internet.email(),
};

export const expectedCheckoutDataFromForm: IInitialCheckoutData = {
  consumer: {
    fullName: `${testFormFieldsValues[HPPFormFieldName.billingFirstName]} ${testFormFieldsValues[HPPFormFieldName.billingLastName]}`,
    lastName: testFormFieldsValues[HPPFormFieldName.billingLastName],
    firstName: testFormFieldsValues[HPPFormFieldName.billingFirstName],
    countryCode: testFormFieldsValues[HPPFormFieldName.billingCountryIso2a],
    consumerIdentity: {
      type: 'EMAIL',
      identityValue: testFormFieldsValues[HPPFormFieldName.billingEmail],
    },
    emailAddress: testFormFieldsValues[HPPFormFieldName.billingEmail],
  },
  srcDigitalCardId: undefined,
  newCardData: {
    primaryAccountNumber: testFormFieldsValues[HPPFormFieldName.pan],
    panExpirationYear: testFormFieldsValues[HPPFormFieldName.cardExpiryYear],
    panExpirationMonth: testFormFieldsValues[HPPFormFieldName.cardExpiryMonth],
    cardSecurityCode: testFormFieldsValues[HPPFormFieldName.cardSecurityCode],
    cardholderFullName: `${testFormFieldsValues[HPPFormFieldName.billingFirstName]} ${testFormFieldsValues[HPPFormFieldName.billingLastName]}`,
    cardholderFirstName: testFormFieldsValues[HPPFormFieldName.billingFirstName],
    cardholderLastName: testFormFieldsValues[HPPFormFieldName.billingLastName],
    billingAddress: {
      city: testFormFieldsValues[HPPFormFieldName.billingTown],
      countryCode: testFormFieldsValues[HPPFormFieldName.billingCountryIso2a],
      line1: testFormFieldsValues[HPPFormFieldName.billingPremise],
      line2: testFormFieldsValues[HPPFormFieldName.billingStreet],
      state: testFormFieldsValues[HPPFormFieldName.billingCounty],
      zip: testFormFieldsValues[HPPFormFieldName.billingPostCode],
    },
  },
};

export const expectedCheckoutDataFromJWT: IInitialCheckoutData = {
  consumer: {
    fullName: `${mockJwtPayload.billingfirstname} ${mockJwtPayload.billinglastname}`, // ?
    lastName: mockJwtPayload.billinglastname,
    firstName: mockJwtPayload.billingfirstname,
    countryCode: mockJwtPayload.billingcountryiso2a,
    consumerIdentity: {
      type: 'EMAIL',
      identityValue: mockJwtPayload.billingemail,
    },
    emailAddress: mockJwtPayload.billingemail,
  },
  srcDigitalCardId: undefined,
  newCardData: {
    primaryAccountNumber: mockJwtPayload.pan,
    panExpirationYear: jwtExpirationYear,
    panExpirationMonth: jwtExpirationMonth,
    cardSecurityCode: mockJwtPayload.securitycode,
    cardholderFullName: `${mockJwtPayload.billingfirstname} ${mockJwtPayload.billinglastname}`,
    cardholderFirstName: mockJwtPayload.billingfirstname,
    cardholderLastName: mockJwtPayload.billinglastname,
    billingAddress: {
      city: mockJwtPayload.billingtown,
      countryCode: mockJwtPayload.billingcountryiso2a,
      line1: mockJwtPayload.billingpremise,
      line2: mockJwtPayload.billingstreet,
      state: mockJwtPayload.billingcounty,
      zip: mockJwtPayload.billingpostcode,
    },
  },
};

// Expected output for using testFormFieldsValuesIncomplet with  mockJwtPayload
export const expectedCheckoutDataMixed: IInitialCheckoutData = {
  consumer: {
    fullName: `${mockJwtPayload.billingfirstname} ${testFormFieldsValues[HPPFormFieldName.billingLastName]}`,
    lastName: testFormFieldsValues[HPPFormFieldName.billingLastName],
    firstName: mockJwtPayload.billingfirstname,
    countryCode: mockJwtPayload.billingcountryiso2a,
    consumerIdentity: {
      type: 'EMAIL',
      identityValue: mockJwtPayload.billingemail,
    },
    emailAddress: mockJwtPayload.billingemail,
  },
  srcDigitalCardId: undefined,
  newCardData: {
    primaryAccountNumber: testFormFieldsValues[HPPFormFieldName.pan],
    panExpirationYear: testFormFieldsValues[HPPFormFieldName.cardExpiryYear],
    panExpirationMonth: testFormFieldsValues[HPPFormFieldName.cardExpiryMonth],
    cardSecurityCode: testFormFieldsValues[HPPFormFieldName.cardSecurityCode],
    cardholderFullName: `${mockJwtPayload.billingfirstname} ${testFormFieldsValues[HPPFormFieldName.billingLastName]}`,
    cardholderFirstName: mockJwtPayload.billingfirstname,
    cardholderLastName: testFormFieldsValues[HPPFormFieldName.billingLastName],
    billingAddress: {
      city: testFormFieldsValues[HPPFormFieldName.billingTown],
      countryCode: mockJwtPayload.billingcountryiso2a,
      line1: testFormFieldsValues[HPPFormFieldName.billingPremise],
      line2: testFormFieldsValues[HPPFormFieldName.billingStreet],
      state: mockJwtPayload.billingcounty,
      zip: testFormFieldsValues[HPPFormFieldName.billingPostCode],
    },
  },
};

export const mockJwtPayloadOnlyCard: IStJwtPayload = {
  pan: faker.finance.creditCardNumber(),
  expirydate: `${jwtExpirationMonth}/${jwtExpirationYear}`,
};

export const testFormValuesNoCard: HPPFormValues = {
  ...testFormFieldsValues,
  [HPPFormFieldName.pan]: '',
  [HPPFormFieldName.cardExpiryMonth]: '',
  [HPPFormFieldName.cardExpiryYear]: '',
};

export const expectedCheckoutDataCardFromJWT: IInitialCheckoutData = {
  ...expectedCheckoutDataFromForm,
  newCardData: {
    ...expectedCheckoutDataFromForm.newCardData,
    primaryAccountNumber: mockJwtPayloadOnlyCard.pan,
    panExpirationMonth: jwtExpirationMonth,
    panExpirationYear: jwtExpirationYear,
  },
};
