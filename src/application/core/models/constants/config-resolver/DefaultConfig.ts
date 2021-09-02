import { environment } from '../../../../../environments/environment';
import { DefaultFieldsToSubmit } from './DefaultFieldsToSubmit';
import { DefaultSubmitFields } from './DefaultSubmitFields';
import { DefaultComponentsIds } from './DefaultComponentsIds';
import { IConfig } from '../../../../../shared/model/config/IConfig';
import { DefaultComponents } from './DefaultComponents';
import { DefaultPlaceholders } from './DefaultPlaceholders';
import { DefaultInit } from './DefaultInit';
import { MERCHANT_FORM_SELECTOR } from '../Selectors';
import { ChallengeDisplayMode, LoggingLevel, ProcessingScreenMode } from '@trustpayments/3ds-sdk-js';
import { APPLE_PAY_BUTTON_ID } from '../../../integrations/apple-pay/apple-pay-button-service/ApplePayButtonProperties';

export const DefaultConfig: IConfig = {
  analytics: false,
  animatedCard: false,
  applePay: undefined,
  buttonId: '',
  stopSubmitFormOnEnter: false,
  cancelCallback: null,
  componentIds: DefaultComponentsIds,
  components: DefaultComponents,
  cybertonicaApiKey: 'stfs',
  datacenterurl: environment.GATEWAY_URL,
  deferInit: false,
  disableNotification: false,
  errorCallback: null,
  errorReporting: true,
  fieldsToSubmit: DefaultFieldsToSubmit,
  formId: MERCHANT_FORM_SELECTOR,
  init: DefaultInit,
  jwt: '',
  livestatus: 0,
  origin: window.location.origin,
  panIcon: false,
  placeholders: DefaultPlaceholders,
  styles: {},
  submitCallback: null,
  submitFields: DefaultSubmitFields,
  submitOnError: false,
  submitOnSuccess: true,
  successCallback: null,
  translations: {},
  threeDSecure: {
    loggingLevel: LoggingLevel.ERROR,
    challengeDisplayMode: ChallengeDisplayMode.POPUP,
    translations: {},
    processingScreenMode: ProcessingScreenMode.OVERLAY,
  },
};
