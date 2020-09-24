import IPageOptions from '@/services/page-options/page-options';
import IConfig from '@/interfaces/config';

export default function mergeOptions(config: IConfig, options: IPageOptions): IConfig {
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
