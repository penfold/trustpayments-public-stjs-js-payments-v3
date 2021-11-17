import { IApplePayErrorConstructor } from '../../../../../global-extensions';
import { ApplePayErrorContactField } from './ApplePayErrorContactField';
import { ApplePayErrorService } from './ApplePayErrorService';
import { ApplePaySessionErrorCode } from './ApplePaySessionErrorCode';

class MockedApplePayError {
  constructor(strA: ApplePaySessionErrorCode, strB?: ApplePayErrorContactField, strC?: string) {
    if (strC) {
      return { code: strA, contactField: strB, message: strC };
    }
    if (strB) {
      return { code: strA, contactField: strB };
    }
    return { code: strA };
  }
}

window.ApplePayError = MockedApplePayError as unknown as IApplePayErrorConstructor;

describe('ApplePayErrorService', () => {
  const applePayErrorService = new ApplePayErrorService();

  it('should create an error object with message', () => {
    const error = applePayErrorService.create(
      ApplePaySessionErrorCode.SHIPPING_CONTACT_INVALID,
      ApplePayErrorContactField.POSTAL_CODE,
      'ZIP Code is invalid'
    );
    expect(error.code).toContain('shippingContactInvalid');
    expect(error.contactField).toContain('postalCode');
    expect(error.message).toContain('ZIP Code is invalid');
  });

  it('should create an error object without contanctField and message', () => {
    const error = applePayErrorService.create(ApplePaySessionErrorCode.SHIPPING_CONTACT_INVALID);
    expect(error.code).toContain('shippingContactInvalid');
    expect(error).not.toHaveProperty('contactField');
    expect(error).not.toHaveProperty('message');
  });
});
