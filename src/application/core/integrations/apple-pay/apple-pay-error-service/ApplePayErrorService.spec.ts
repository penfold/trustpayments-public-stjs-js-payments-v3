import { ApplePayErrorService } from './ApplePayErrorService';
import { when } from 'ts-mockito';
import { ApplePaySessionErrorCode } from './ApplePaySessionErrorCode';
import { ApplePayErrorContactField } from './ApplePayErrorContactField';

describe('ApplePayErrorService', () => {
  it('should create and return new ApplePayError', () => {
    const instance: ApplePayErrorService = new ApplePayErrorService();
    when(
      instance.create(
        ApplePaySessionErrorCode.ADDRESS_UNSERVICEABLE,
        'en_GB',
        ApplePayErrorContactField.POSTAL_CODE,
        'test message'
      )
    ).thenReturn({ code: ApplePaySessionErrorCode.ADDRESS_UNSERVICEABLE, contactField: '', message: '' });
  });
});
