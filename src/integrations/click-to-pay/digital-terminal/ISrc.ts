export interface IIsRecognizedResponse {
  recognized: boolean;
  idTokens?: string[];
}

export interface IDpaData {
  srcdpaId: string;
  dpaPresentationName?: string;
  dpaUri?: string;
  dpaThreeDsPreference?: 'ONBEHALF' | 'SELF' | 'NONE' | 'UNKNOWN';
}

export interface IPaymentOptions {
  dpaDynamicDataTTLMinutes?: number;
  dynamicDataType?: 'TAVV' | 'DTVV';
  dpaPanRequested?: boolean;
}

export interface ITransactionAmount {
  transactionAmount: number;
  transactionCurrencyCode: string;
}

export interface IThreeDSInputData {
  requestorId: string;
  acquirerId: string;
  acquirerMid: string;
}

export interface IDpaTransactionOptions {
  dpaLocale?: string;
  dpaAcceptedBillingCountries?: string[];
  dpaAcceptedShippingCountries?: string[];
  dpaBillingPreference?: 'ALL' | 'POSTAL_COUNTRY' | 'NONE';
  dpaShippingPreference?: 'ALL' | 'POSTAL_COUNTRY' | 'NONE';
  consumerNameRequested?: boolean;
  consumerEmailAddressRequested?: boolean;
  consumerPhoneNumberRequested?: boolean;
  paymentOptions?: IPaymentOptions;
  reviewAction?: 'pay' | 'continue';
  checkoutDescription?: string;
  transactionType?: 'PURCHASE' | 'BILL_PAYMENT' | 'MONEY_TRANSFER';
  orderType?: 'REAUTHORIZATION' | 'RECURRING' | 'INSTALLMENT';
  payloadTypeIndicator?: 'FULL' | 'SUMMARY' | 'PAYMENT' | 'NON_PAYMENT' | 'NONE';
  transactionAmount?: ITransactionAmount;
  merchantOrderId?: string;
  merchantCategoryCode?: string;
  merchantCountryCode?: string;
  threeDSInputData?: IThreeDSInputData;
}

export interface ISrcInitData {
  srciTransactionId: string;
  srciDpaId?: string;
  srcInitiatorId: string;
  dpaData?: IDpaData;
  dpaTransactionOptions: IDpaTransactionOptions;
}

export interface IConsumerIdentity {
  identityProvider?: string;
  identityValue: string;
  type: 'EMAIL' | 'MOBILE_NUMBER' | 'CUSTOM_IDENTIFIER';
}

export interface IPhoneNumber {
  countryCode: string;
  phoneNumber: string;
}

export interface IConsumer {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  emailAddress?: string;
  mobileNumber?: IPhoneNumber;
  countryCode?: string;
  languageCode?: string;
  consumerIdentity?: IConsumerIdentity;
}

export interface ICheckoutData {
  srcCorrelationId: string;
  srciTransactionId?: string;
  srcDigitalCardId?: string;
  encryptedCard?: string;
  idToken?: string;
  windowRef?: Window;
  dpaTransactionOptions?: IDpaTransactionOptions;
  consumer?: IConsumer;
}

export interface IDigitalCardData {
  status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'PENDING';
  artUri: string;
  artHeight: number;
  artWidth: number;
}

export interface IDcf {
  uri: string;
  logoUri: string;
  name: string;
}

export interface IMaskedCard {
  srcDigitalCardId: string;
  panBin: string;
  panLastFour: number;
  tokenBinRange: string;
  paymentAccountReference: string;
  tokenLastFour: number;
  panExpirationMonth: number;
  panExpirationYear: number;
  digitalCardData: IDigitalCardData;
  dateOfCardCreated: string;
  dateOfCardLastUsed: string;
  dcf: IDcf;
  maskedBillingAddress: IMaskedAddress;
}

export interface IMaskedAddress {
  addressId: string;
  line1: string;
  line2: string;
  line3: string;
  city: string;
  state: string;
  zip: string;
  countryCode: string;
  createTime: string;
  lastUsedTime: number;
}

export interface IMaskedConsumer {
  firstName: string;
  lastName: string;
  fullName: string;
  emailAddress: string;
  mobileNumber: IPhoneNumber;
  countryCode: string;
  languageCode: string;
}

export interface IAssuranceData {
  cardVerificationResults: string;
  cardholderAuthenticationResults: string;
  consumerVerificationResults: string;
}

export interface ICheckoutResponse {
  checkoutResponse: ICheckoutResponseData;
  dcfActionCode: 'COMPLETE' | 'CHANGE_CARD' | 'ADD_CARD' | 'SWITCH_CONSUMER' | 'CANCEL' | 'ERROR',
  unbindAppInstance: boolean;
  idToken: string;
}

export interface ICheckoutResponseData {
  srcCorrelationId: string;
  srciTransactionId: string;
  maskedCard: IMaskedCard;
  shippingAddressZip: string;
  shippingCountryCode: string;
  maskedConsumer: IMaskedConsumer;
  encryptedPayload: string;
  assuranceData: IAssuranceData;
  isGuestCheckout: boolean;
  isNewUser: boolean;
}

export interface ISrcProfileList {
  profiles: ISrcProfile[];
  srcCorrelationId: string;
}

export interface ISrcProfile {
  idToken: string;
  maskedCards: IMaskedCard[];
  maskedConsumer: IMaskedConsumer;
}

export interface IIdentityLookupResponse {
  consumerPresent: boolean;
}

export interface IInitiateIdentityValidationResponse {
  maskedValidationChannel: string | IPhoneNumber;
}

export interface ICompleteIdValidationResponse {
  idToken: string;
}

export interface IUnbindAppInstanceResponse {
  srcCorrelatedId: string;
}

export interface ISrc {
  init(initData: ISrcInitData): Promise<void>;
  isRecognized(): Promise<IIsRecognizedResponse>;
  getSrcProfile(idTokens: string[]): Promise<ISrcProfileList>;
  identityLookup(consumerIdentity: IConsumerIdentity): Promise<IIdentityLookupResponse>;
  initiateIdentityValidation(): Promise<IInitiateIdentityValidationResponse>;
  completeIdentityValidation(validationData: string): Promise<ICompleteIdValidationResponse>;
  checkout(data: ICheckoutData): Promise<ICheckoutResponse>;
  unbindAppInstance(idToken?: string): Promise<IUnbindAppInstanceResponse>;
}
