import { DefaultPlaceholders } from '../../../application/core/models/constants/config-resolver/DefaultPlaceholders';
import { ITokenizedCardPaymentConfig } from './ITokenizedCardPayment';

export const TokenizedCardPaymentMethodName= 'TokenizedCard';

export const TokenizedCardPaymentConfigName = 'tokenizedCard';

export const TokenizedCardPaymentSecurityCode = 'securitycode';

export const DefaultTokenizedCardPaymentConfig: ITokenizedCardPaymentConfig = {
  buttonId: 'tokenized-submit-button',
  securityCodeSlotId: 'st-tokenized-security-code',
  formId: 'st-form-tokenized',
  placeholder: DefaultPlaceholders.securitycode,
};
