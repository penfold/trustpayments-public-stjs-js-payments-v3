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
  VALIDATE_SECURITY_CODE_FIELD: 'VALIDATE_SECURITY_CODE_FIELD',
};

export const PUBLIC_EVENTS = {
  APPEND_FORM_DATA: 'ST_APPEND_FORM_DATA',
  APPLE_PAY_AUTHORIZATION: 'ST_APPLE_PAY_AUTHORIZATION',
  APPLE_PAY_AUTHORIZATION_2: 'ST_APPLE_PAY_AUTHORIZATION_2',
  APPLE_PAY_CONFIG: 'ST_APPLE_PAY_CONFIG',
  APPLE_PAY_CONFIG_MOCK: 'ST_APPLE_PAY_CONFIG_MOCK',
  APPLE_PAY_INIT: 'ST_APPLE_PAY_INIT',
  APPLE_PAY_STATUS: 'ST_APPLE_PAY_STATUS',
  APPLE_PAY_STATUS_VALIDATE_MERCHANT: 'ST_APPLE_PAY_STATUS_VALIDATE_MERCHANT',
  APPLE_PAY_VALIDATE_MERCHANT: 'ST_APPLE_PAY_VALIDATE_MERCHANT',
  APPLE_PAY_VALIDATE_MERCHANT_2: 'ST_APPLE_PAY_VALIDATE_MERCHANT_2',
  APPLE_PAY_CANCELLED: 'ST_APPLE_PAY_CANCELLED',
  BIN_PROCESS: 'BIN_PROCESS',
  BLOCK_CARD_NUMBER: 'BLOCK_CARD_NUMBER',
  BLOCK_EXPIRATION_DATE: 'BLOCK_EXPIRATION_DATE',
  BLOCK_FORM: 'BLOCK_FORM',
  BLOCK_SECURITY_CODE: 'BLOCK_SECURITY_CODE',
  BLUR_FIELDS: 'BLUR_FIELDS',
  BY_PASS_CARDINAL: 'BY_PASS_CARDINAL',
  BY_PASS_INIT: 'BY_PASS_INIT',
  CALL_MERCHANT_CANCEL_CALLBACK: 'CALL_MERCHANT_CANCEL_CALLBACK',
  CALL_MERCHANT_ERROR_CALLBACK: 'CALL_MERCHANT_ERROR_CALLBACK',
  CALL_MERCHANT_SUBMIT_CALLBACK: 'CALL_MERCHANT_SUBMIT_CALLBACK',
  CALL_MERCHANT_SUCCESS_CALLBACK: 'CALL_MERCHANT_SUCCESS_CALLBACK',
  CALL_SUBMIT_EVENT: 'CALL_SUBMIT_EVENT',
  CARDINAL_COMMERCE_TOKENS_ACQUIRED: 'ST_CARDINAL_COMMERCE_TOKENS_ACQUIRED',
  CARDINAL_CONTINUE: 'ST_CARDINAL_CONTINUE',
  CARDINAL_SETUP: 'ST_CARDINAL_SETUP',
  CARDINAL_START: 'ST_CARDINAL_START',
  CARDINAL_TRIGGER: 'ST_CARDINAL_TRIGGER',
  CARD_PAYMENTS_INIT: 'ST_CARD_PAYMENTS_INIT',
  CONFIG_CHANGED: 'ST_CONFIG_CHANGED',
  CONFIG_CHECK: 'ST_CONFIG_CHECK',
  CONFIG_CLEARED: 'ST_CONFIG_CLEARED',
  CONTROL_FRAME_HIDE: 'ST_CONTROL_FRAME_HIDE',
  CONTROL_FRAME_SHOW: 'ST_CONTROL_FRAME_SHOW',
  DESTROY: 'DESTROY',
  INIT_CONTROL_FRAME: 'ST_INIT_CONTROL_FRAME',
  INIT_PAYMENT_METHOD: 'ST_INIT_PAYMENT_METHOD',
  JSINIT_RESPONSE: 'JSINIT_RESPONSE',
  JWT_REPLACED: 'ST_JWT_REPLACED',
  JWT_RESET: 'ST_JWT_RESET',
  JWT_UPDATED: 'ST_JWT_UPDATED',
  LOAD_CARDINAL: 'LOAD_CARDINAL',
  LOAD_CONTROL_FRAME: 'LOAD_CONTROL_FRAME',
  LOCALE_CHANGED: 'ST_LOCALE_CHANGED',
  NOTIFICATION: 'NOTIFICATION',
  PAYMENT_METHOD_INIT_STARTED: 'ST_PAYMENT_METHOD_INIT_STARTED',
  PAYMENT_METHOD_INIT_COMPLETED: 'ST_PAYMENT_METHOD_INIT_COMPLETED',
  PAYMENT_METHOD_INIT_FAILED: 'ST_PAYMENT_METHOD_INIT_FAILED',
  PAYMENT_METHOD_STARTED: 'ST_PAYMENT_METHOD_STARTED',
  PAYMENT_METHOD_COMPLETED: 'ST_PAYMENT_METHOD_COMPLETED',
  PAYMENT_METHOD_FAILED: 'ST_PAYMENT_METHOD_FAILED',
  PAYMENT_METHOD_CANCELED: 'ST_PAYMENT_METHOD_CANCELED',
  PROCESS_PAYMENTS: 'PROCESS_PAYMENTS',
  SAMPLE_MESSAGE: 'ST_SAMPLE_MESSAGE',
  SET_REQUEST_TYPES: 'SET_REQUEST_TYPES',
  START_PAYMENT_METHOD: 'ST_START_PAYMENT_METHOD',
  STORAGE_SET_ITEM: 'ST_STORAGE_SET_ITEM',
  STORAGE_SYNC: 'ST_STORAGE_SYNC',
  SUBMIT_FORM: 'SUBMIT_FORM',
  SUBMIT_PAYMENT_RESULT: 'ST_SUBMIT_PAYMENT_RESULT',
  SUBSCRIBE: 'SUBSCRIBE',
  THREEDINIT_REQUEST: 'THREEDINIT_REQUEST',
  THREEDINIT_RESPONSE: 'THREEDINIT_RESPONSE',
  THREEDQUERY: 'THREEDQUERY',
  THREED_CANCEL: 'THREED_CANCEL',
  TRANSACTION_COMPLETE: 'TRANSACTION_COMPLETE',
  UNLOCK_BUTTON: 'UNLOCK_BUTTON',
  UPDATE_JWT: 'ST_UPDATE_JWT',
  UPDATE_MERCHANT_FIELDS: 'UPDATE_MERCHANT_FIELDS',
  VISA_CHECKOUT_CONFIG: 'ST_VISA_CHECKOUT_CONFIG',
  THREE_D_SECURE_INIT: 'ST_THREE_D_SECURE_INIT',
  THREE_D_SECURE_METHOD_URL: 'ST_THREE_D_SECURE_METHOD_URL',
  THREE_D_SECURE_CHALLENGE: 'ST_THREE_D_SECURE_CHALLENGE',
  THREE_D_SECURE_BROWSER_DATA: 'ST_THREE_D_SECURE_BROWSER_DATA',
  THREE_D_SECURE_PROCESSING_SCREEN_SHOW: 'ST_THREE_D_SECURE_PROCESSING_SCREEN_SHOW',
  THREE_D_SECURE_PROCESSING_SCREEN_HIDE: 'ST_THREE_D_SECURE_PROCESSING_SCREEN_HIDE',
  VISA_CHECKOUT_INIT: 'ST_VISA_CHECKOUT_INIT',
  VISA_CHECKOUT_STATUS: 'ST_VISA_CHECKOUT_STATUS',

  APPLE_PAY_INIT_CLIENT: 'ST_APPLE_PAY_INIT_CLIENT',
};
