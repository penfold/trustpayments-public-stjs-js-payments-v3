export interface IApplePayError {
  code: 'shippingContactInvalid' | 'billingContactInvalid' | 'addressUnserviceable' | 'unknown';
  contactField?: string;
  message?: string;
}
