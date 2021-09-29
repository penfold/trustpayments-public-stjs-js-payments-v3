import { PUBLIC_EVENTS } from './EventTypes';

export enum ExposedEventsName {
  SUCCESS = 'success',
  ERROR = 'error',
  SUBMIT = 'submit',
  CANCEL = 'cancel',
  PAYMENT_INIT_STARTED = 'paymentInitStarted',
  PAYMENT_INIT_COMPLETED = 'paymentInitCompleted',
  PAYMENT_INIT_FAILED = 'paymentInitFailed',
  PAYMENT_STARTED = 'paymentStarted',
  PAYMENT_COMPLETED = 'paymentCompleted',
  PAYMENT_FAILED = 'paymentFailed',
  PAYMENT_CANCELED = 'paymentCanceled',
}

export const ExposedEvents = {
  cancel: PUBLIC_EVENTS.CALL_MERCHANT_CANCEL_CALLBACK,
  success: PUBLIC_EVENTS.CALL_MERCHANT_SUCCESS_CALLBACK,
  error: PUBLIC_EVENTS.CALL_MERCHANT_ERROR_CALLBACK,
  submit: PUBLIC_EVENTS.CALL_MERCHANT_SUBMIT_CALLBACK,
  paymentInitStarted: PUBLIC_EVENTS.PAYMENT_METHOD_INIT_STARTED,
  paymentInitCompleted: PUBLIC_EVENTS.PAYMENT_METHOD_INIT_COMPLETED,
  paymentInitFailed: PUBLIC_EVENTS.PAYMENT_METHOD_INIT_FAILED,
  paymentStarted: PUBLIC_EVENTS.PAYMENT_METHOD_STARTED,
  paymentCompleted: PUBLIC_EVENTS.PAYMENT_METHOD_COMPLETED,
  paymentFailed: PUBLIC_EVENTS.PAYMENT_METHOD_FAILED,
  paymentCanceled: PUBLIC_EVENTS.PAYMENT_METHOD_CANCELED,
};
