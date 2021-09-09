import PageOptions from '@/services/page-options/page-options';
import Config from '@/interfaces/config';

export default function mergeOptions(config: Config, options: PageOptions): Config {
  return {
    ...config,
    jwt: options.jwt || config.jwt,
    formId: options.formId || config.formId,
    buttonId: options.submitButtonId || config.buttonId,
    submitCallback: options.submitCallback,
    errorCallback: options.errorCallback,
    successCallback: options.successCallback,
    cancelCallback: options.cancelCallback,
  };
}
