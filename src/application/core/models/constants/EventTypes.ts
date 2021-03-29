export const PRIVATE_EVENTS = {
  BLUR_CARD_NUMBER: 'BLUR_CARD_NUMBER',
  BLUR_EXPIRATION_DATE: 'BLUR_EXPIRATION_DATE',
  BLUR_SECURITY_CODE: 'BLUR_SECURITY_CODE',
  CHANGE_CARD_NUMBER: 'CHANGE_CARD_NUMBER',
  CHANGE_EXPIRATION_DATE: 'CHANGE_EXPIRATION_DATE',
  CHANGE_SECURITY_CODE: 'CHANGE_SECURITY_CODE',
  CHANGE_SECURITY_CODE_LENGTH: 'CHANGE_SECURITY_CODE_LENGTH',
  FOCUS_CARD_NUMBER: 'FOCUS_CARD_NUMBER',
  FOCUS_EXPIRATION_DATE: 'FOCUS_EXPIRATION_DATE',
  FOCUS_SECURITY_CODE: 'FOCUS_SECURITY_CODE',
  IS_CARD_WITHOUT_CVV: 'IS_CARD_WITHOUT_CVV',
  VALIDATE_CARD_NUMBER_FIELD: 'VALIDATE_CARD_NUMBER_FIELD',
  VALIDATE_EXPIRATION_DATE_FIELD: 'VALIDATE_EXPIRATION_DATE_FIELD',
  VALIDATE_FORM: 'VALIDATE_FORM',
  VALIDATE_MERCHANT_FIELD: 'VALIDATE_MERCHANT_FIELD',
  VALIDATE_SECURITY_CODE_FIELD: 'VALIDATE_SECURITY_CODE_FIELD'
};

export const PUBLIC_EVENTS = {
  BIN_PROCESS: 'BIN_PROCESS',
  BLOCK_FORM: 'BLOCK_FORM',
  BLOCK_CARD_NUMBER: 'BLOCK_CARD_NUMBER',
  BLOCK_EXPIRATION_DATE: 'BLOCK_EXPIRATION_DATE',
  BLOCK_SECURITY_CODE: 'BLOCK_SECURITY_CODE',
  BLUR_FIELDS: 'BLUR_FIELDS',
  BY_PASS_CARDINAL: 'BY_PASS_CARDINAL',
  BY_PASS_INIT: 'BY_PASS_INIT',
  CALL_SUBMIT_EVENT: 'CALL_SUBMIT_EVENT',
  DESTROY: 'DESTROY',
  LOAD_CARDINAL: 'LOAD_CARDINAL',
  LOAD_CONTROL_FRAME: 'LOAD_CONTROL_FRAME',
  NOTIFICATION: 'NOTIFICATION',
  PROCESS_PAYMENTS: 'PROCESS_PAYMENTS',
  SET_REQUEST_TYPES: 'SET_REQUEST_TYPES',
  CALL_MERCHANT_ERROR_CALLBACK: 'CALL_MERCHANT_ERROR_CALLBACK',
  CALL_MERCHANT_CANCEL_CALLBACK: 'CALL_MERCHANT_CANCEL_CALLBACK',
  CALL_MERCHANT_SUCCESS_CALLBACK: 'CALL_MERCHANT_SUCCESS_CALLBACK',
  CALL_MERCHANT_SUBMIT_CALLBACK: 'CALL_MERCHANT_SUBMIT_CALLBACK',
  SUBMIT_FORM: 'SUBMIT_FORM',
  THREEDINIT_REQUEST: 'THREEDINIT_REQUEST',
  THREEDINIT_RESPONSE: 'THREEDINIT_RESPONSE',
  THREEDQUERY: 'THREEDQUERY',
  THREED_CANCEL: 'THREED_CANCEL',
  TRANSACTION_COMPLETE: 'TRANSACTION_COMPLETE',
  UPDATE_JWT: 'ST_UPDATE_JWT',
  JWT_UPDATED: 'ST_JWT_UPDATED',
  JWT_REPLACED: 'ST_JWT_REPLACED',
  JWT_RESET: 'ST_JWT_RESET',
  UPDATE_MERCHANT_FIELDS: 'UPDATE_MERCHANT_FIELDS',
  SUBSCRIBE: 'SUBSCRIBE',
  CONFIG_CHECK: 'ST_CONFIG_CHECK',
  CARDINAL_COMMERCE_TOKENS_ACQUIRED: 'ST_CARDINAL_COMMERCE_TOKENS_ACQUIRED',
  CONTROL_FRAME_SHOW: 'ST_CONTROL_FRAME_SHOW',
  CONTROL_FRAME_HIDE: 'ST_CONTROL_FRAME_HIDE',
  JSINIT_RESPONSE: 'JSINIT_RESPONSE',
  CONFIG_CHANGED: 'ST_CONFIG_CHANGED',
  CONFIG_CLEARED: 'ST_CONFIG_CLEARED',
  UNLOCK_BUTTON: 'UNLOCK_BUTTON',
  INIT_CONTROL_FRAME: 'ST_INIT_CONTROL_FRAME',
  STORAGE_SYNC: 'ST_STORAGE_SYNC',
  STORAGE_SET_ITEM: 'ST_STORAGE_SET_ITEM',
  SAMPLE_MESSAGE: 'ST_SAMPLE_MESSAGE',
  CARD_PAYMENTS_INIT: 'ST_CARD_PAYMENTS_INIT',
  CARDINAL_SETUP: 'ST_CARDINAL_SETUP',
  CARDINAL_TRIGGER: 'ST_CARDINAL_TRIGGER',
  CARDINAL_CONTINUE: 'ST_CARDINAL_CONTINUE',
  CARDINAL_START: 'ST_CARDINAL_START',
  VISA_CHECKOUT_INIT: 'ST_VISA_CHECKOUT_INIT',
  VISA_CHECKOUT_CONFIG: 'ST_VISA_CHECKOUT_CONFIG',
  VISA_CHECKOUT_STATUS: 'ST_VISA_CHECKOUT_STATUS',
  APPLE_PAY_INIT: 'ST_APPLE_PAY_INIT',
  APPLE_PAY_CONFIG: 'ST_APPLE_PAY_CONFIG',
  APPLE_PAY_CONFIG_MOCK: 'ST_APPLE_PAY_CONFIG_MOCK',
  APPLE_PAY_STATUS: 'ST_APPLE_PAY_STATUS',
  APPLE_PAY_STATUS_VALIDATE_MERCHANT: 'ST_APPLE_PAY_STATUS_VALIDATE_MERCHANT',
  APPLE_PAY_VALIDATE_MERCHANT: 'ST_APPLE_PAY_VALIDATE_MERCHANT',
  APPLE_PAY_AUTHORIZATION: 'ST_APPLE_PAY_AUTHORIZATION',
  INIT_PAYMENT_METHOD: 'ST_INIT_PAYMENT_METHOD',
  START_PAYMENT_METHOD: 'ST_START_PAYMENT_METHOD',
  SUBMIT_PAYMENT_RESULT: 'ST_SUBMIT_PAYMENT_RESULT',
  LOCALE_CHANGED: 'ST_LOCALE_CHANGED',
};
