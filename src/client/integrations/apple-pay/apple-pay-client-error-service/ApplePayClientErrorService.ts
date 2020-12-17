import { ApplePayClientErrorCode } from '../ApplePayClientErrorCode';

export class ApplePayClientErrorService {
  create(errorCode: string) {
    switch (errorCode) {
      case '0':
        return ApplePayClientErrorCode.SUCCESS;
      case '1':
        return ApplePayClientErrorCode.ERROR;
      case '2':
        return ApplePayClientErrorCode.CANCEL;
      case '50003':
        return ApplePayClientErrorCode.ERROR;
    }
  }
}
