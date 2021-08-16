// predefined callbacks
//@ts-ignore
import { displayPopup } from './popup';

declare global {
  function displayCallbackCounter(id, title, color);
}

function submitCallback(data) {
  const stringified = JSON.stringify(data, null, 2);
  const testVariable = 'This is what we have got after submit' + '\n' + stringified;
  displayPopup('data-popup', 'Error code: ' + (!data || data.errorcode != '0' ? 'Error' : 'OK'), 'blue');
  displayPopup('data-popup-jwt', 'JWT: ' + data.jwt, 'blue');
  displayPopup('data-popup-threedresponse', 'THREEDRESPONSE: ' + data.threedresponse, 'blue');

  window.displayCallbackCounter('submit-callback-counter', 'submit', 'blue');
  console.error(testVariable);
}

function successCallback() {
  displayPopup('success-popup', 'This is success message', 'green');

  window.displayCallbackCounter('success-callback-counter', 'success', 'green');
}

function errorCallback() {
  displayPopup('error-popup', 'This is error message', 'red');

  window.displayCallbackCounter('error-callback-counter', 'error', 'red');
}

function cancelCallback() {
  displayPopup('cancel-popup', 'This is cancel message', '#ffc23a');

  window.displayCallbackCounter('cancel-callback-counter', 'cancel', '#ffc23a');
}

function redirectionCallback(){
    const form=document.getElementById('st-form') as HTMLFormElement;
    form.action='https://example.org';
    form.submit();
}

function errorCodeCheckAndRedirectCallback(data) {
  const form = document.getElementById('st-form') as HTMLFormElement;
  if (data.errorcode=='0'){
    form.action = 'https://example.org';
    form.submit();
  }
}

// @ts-ignore
window.predefinedCallbacks = {
  submitCallback,
  successCallback,
  errorCallback,
  cancelCallback,
  redirectionCallback,
  errorCodeCheckAndRedirectCallback,
};
