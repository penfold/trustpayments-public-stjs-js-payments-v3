export enum PaymentStatus {
  SUCCESS = 'success',
  CANCEL = 'cancel',
  FAILURE = 'failure',
  ERROR = 'error'
}

export const GetPaymentStatus = (errorCode: string): PaymentStatus => {
  switch (errorCode) {
    case '0':
      return PaymentStatus.SUCCESS;
    default:
      PaymentStatus.ERROR;
  }
};
