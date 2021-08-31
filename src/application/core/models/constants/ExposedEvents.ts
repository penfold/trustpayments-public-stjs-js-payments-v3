import { PUBLIC_EVENTS } from './EventTypes';

export enum ExposedEventsName {
  SUCCESS = 'success',
  ERROR = 'error',
  SUBMIT = 'submit',
  CANCEL = 'cancel',
}

export const ExposedEvents = {
  cancel: PUBLIC_EVENTS.CALL_MERCHANT_CANCEL_CALLBACK,
  success: PUBLIC_EVENTS.CALL_MERCHANT_SUCCESS_CALLBACK,
  error: PUBLIC_EVENTS.CALL_MERCHANT_ERROR_CALLBACK,
  submit: PUBLIC_EVENTS.CALL_MERCHANT_SUBMIT_CALLBACK,
};
