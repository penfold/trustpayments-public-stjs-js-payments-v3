export enum ApplePayClientErrorCode {
  SUCCESS = 0,
  ERROR = 1,
  CANCEL = 2,
  CAN_MAKE_PAYMENT_WITH_ACTIVE_CARD = 3,
  VALIDATE_MERCHANT_ERROR = 4,
  VALIDATE_MERCHANT_SUCCESS = 5,
  NO_ACTIVE_CARDS_IN_WALLET = 6
}