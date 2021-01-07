import { ApplePayErrorService } from './ApplePayErrorService';
import { when } from 'ts-mockito';
import { ApplePayErrorCode } from './ApplePayErrorCode';
import { ApplePayErrorContactField } from './ApplePayErrorContactField';

describe('ApplePayErrorService', () => {
  it.skip('should create and return new ApplePayError', () => {
    const instance: ApplePayErrorService = new ApplePayErrorService();
    when(
      instance.create(
        ApplePayErrorCode.ADDRESS_UNSERVICEABLE,
        'en_GB',
        ApplePayErrorContactField.POSTAL_CODE,
        'test message'
      )
    ).thenReturn({ code: ApplePayErrorCode.ADDRESS_UNSERVICEABLE, contactField: '', message: '' });
  });
});
