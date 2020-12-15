export class ApplePayErrorMock {
  private errorCode: string;
  private contactField: string;
  private message: string;

  constructor(errorCode: string, contactField?: string, message?: string) {
    this.errorCode = errorCode;
    this.contactField = contactField;
    this.message = message;
  }
}
