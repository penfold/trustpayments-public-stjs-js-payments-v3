import IPageOptions from '@/services/page-options/page-options';
import environment from '@/environment/environment';

function parseBool(value: string): boolean {
  return Boolean(value && JSON.parse(value));
}

function parseCallback(callbackFunction: string): ((data: any) => void) | undefined {
  if (!callbackFunction) {
    return undefined;
  }

  return (data: any) => eval(callbackFunction);
}

export default function resolvePageOptions(queryParams: {[param: string]: any}): IPageOptions {
  const DEFAULT_FORM_ID = 'st-form';
  const DEFAULT_SUBMIT_BUTTON_ID = 'merchant-submit-button';
  const DEFAULT_ADDITIONAL_BUTTON_ID = 'additional-button';

  return {
    configUrl: queryParams.configUrl || environment.configUrl,
    formId: queryParams.formId || DEFAULT_FORM_ID,
    submitButtonId: queryParams.submitButtonId || DEFAULT_SUBMIT_BUTTON_ID,
    noSubmitButton: parseBool(queryParams.noSubmitButton),
    additionalButton: parseBool(queryParams.additionalButton),
    additionalButtonId: queryParams.additionalButtonId || DEFAULT_ADDITIONAL_BUTTON_ID,
    jwt: queryParams.jwt,
    updatedJwt: queryParams.updatedJwt,
    submitCallback: parseCallback(queryParams.submitCallback),
    errorCallback: parseCallback(queryParams.errorCallback),
    successCallback: parseCallback(queryParams.successCallback),
    cancelCallback: parseCallback(queryParams.cancelCallback),
  };
}
