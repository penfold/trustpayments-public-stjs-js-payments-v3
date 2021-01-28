import { IApplePaySession } from './IApplePaySession';
import { IApplePaySessionConstructor } from './IApplePaySessionConstructor';

const ApplePaySession: IApplePaySessionConstructor | undefined = (window as any).ApplePaySession;

export const ApplePayStatus = {
  STATUS_SUCCESS: ApplePaySession ? ApplePaySession.STATUS_SUCCESS : undefined,
  STATUS_FAILURE: ApplePaySession ? ApplePaySession.STATUS_FAILURE : undefined,
  STATUS_INVALID_BILLING_POSTAL_ADDRESS: ApplePaySession
    ? ApplePaySession.STATUS_INVALID_BILLING_POSTAL_ADDRESS
    : undefined,
  STATUS_INVALID_SHIPPING_POSTAL_ADDRESS: ApplePaySession
    ? ApplePaySession.STATUS_INVALID_SHIPPING_POSTAL_ADDRESS
    : undefined,
  STATUS_INVALID_SHIPPING_CONTACT: ApplePaySession ? ApplePaySession.STATUS_INVALID_SHIPPING_CONTACT : undefined,
  STATUS_PIN_INCORRECT: ApplePaySession ? ApplePaySession.STATUS_PIN_INCORRECT : undefined,
  STATUS_PIN_LOCKOUT: ApplePaySession ? ApplePaySession.STATUS_PIN_LOCKOUT : undefined,
  STATUS_PIN_REQUIRED: ApplePaySession ? ApplePaySession.STATUS_PIN_REQUIRED : undefined
};
