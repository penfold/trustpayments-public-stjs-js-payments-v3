from enum import Enum


class E2eConfig(Enum):
    BASIC_CONFIG = 'e2eBasicConfig.json'
    BYPASS_MASTERCARD_CONFIG = 'e2eConfigBypassMastercard.json'
    BYPASS_MASTERCARD_REQUEST_TYPE_CONFIG = 'e2eConfigBypassMastercardRequestType.json'
    BYPASS_MASTERCARD_WITH_STYLING_CONFIG = 'e2eConfigBypassMastercardWithStyling.json'
    CYBERTONICA_CONFIG = 'e2eConfigCybertonica.json'
    CYBERTONICA_WITH_BYPASSCARDS_CONFIG = 'e2eConfigCybertonicaWithBypass.json'
    CYBERTONICA_START_ON_LOAD_CONFIG = 'e2eConfigCybertonicaStartOnLoadTrue.json'
    BYPASS_CARDS_CONFIG = 'e2eConfigForBypassCards.json'
    START_ON_LOAD_CONFIG = 'e2eConfigStartOnLoadTrue.json'
    START_ON_LOAD_REQUEST_TYPES_CONFIG = 'e2eConfigStartOnLoadRequestTypes.json'
    START_ON_LOAD_REQUEST_TYPES_SUB_CONFIG = 'e2eConfigStartOnLoadRequestTypesSub.json'
    START_ON_LOAD_SUBMIT_ON_SUCCESS_CONFIG = 'e2eConfigStartOnLoadSubmitOnSuccess.json'
    START_ON_LOAD_SUBMIT_ON_ERROR_CONFIG = 'e2eConfigStartOnLoadSubmitOnError.json'
    SUBMIT_ON_ERROR_CONFIG = 'e2eConfigSubmitOnError.json'
    SUBMIT_ON_ERROR_ONLY_CONFIG = 'e2eConfigSubmitOnErrorOnly.json'
    SUBMIT_ON_ERROR_CONFIG_ERROR_CALLBACK = 'e2eConfigSubmitOnErrorCallback.json'
    SUBMIT_ON_ERROR_CONFIG_SUBMIT_CALLBACK = 'e2eConfigSubmitOnErrorCallbackSubmit.json'
    SUBMIT_ON_CANCEL_CONFIG_CANCEL_CALLBACK = 'e2eConfigSubmitOnCancelCallback.json'
    SUBMIT_ON_SUCCESS_CONFIG = 'e2eConfigSubmitOnSuccess.json'
    SUBMIT_ON_SUCCESS_CONFIG_SUCCESS_CALLBACK = 'e2eConfigSubmitOnSuccessCallback.json'
    SUBMIT_ON_SUCCESS_CONFIG_SUBMIT_CALLBACK = 'e2eConfigSubmitOnSuccessCallbackSubmit.json'
    SUBMIT_ON_SUCCESS_SECURITY_CODE_CONFIG = 'e2eConfigSubmitOnSuccessSecurityCode.json'
    SUBMIT_ON_ERROR_REQUEST_TYPES_CONFIG = 'e2eConfigSubmitOnErrorRequestTypes.json'
    SUBMIT_ON_SUCCESS_ERROR_REQUEST_TYPES_CONFIG = 'e2eConfigSubmitOnSuccessErrorRequestTypes.json'
    SUBMIT_ON_SUCCESS_CACHETOKEN_FIELD = 'e2eConfigSubmitOnSuccessCachetokenField.json'
    SUBMIT_ON_SUCCESS_CACHETOKEN_FIELD_START_ON_LOAD = 'e2eConfigSubmitOnSuccessCachetokenStartOnLoad.json'
    SUBMIT_ON_SUCCESS_ERROR_CONFIG = 'e2eConfigSubmitOnSuccessErrorRequestTypes.json'
    DEFER_INIT_CONFIG = 'e2eConfigWithDeferinitTrue.json'
    DEFER_INIT_AND_SUBMIT_ON_SUCCESS_CONFIG = 'e2eConfigWithDeferinitTrueAndSumitOnSuccess.json'
    TOKENISATION_CONFIG = 'e2eForTokenisation.json'
    TOKENISATION_WITH_DEFER_INIT_CONFIG = 'e2eForTokenisationAndDeferInit.json'
    TOKENISATION_AND_SUBMIT_ON_SUCCESS_CONFIG = 'e2eConfigTokenisationAndSubmitOnSuccess.json'
    REQUEST_TYPES_CONFIG = 'e2eConfigRequestTypes.json'
    REQUEST_TYPES_CONFIG_INVALID_ORDER = 'e2eConfigRequestTypesInvalidOrder.json'
    REQUEST_TYPE_ACC_TDQ_AUTH_RISK_CONFIG = 'e2eConfigRequestTypesAccTdqAuthRisk.json'
    SUBMIT_ON_SUCCESS_ONLY_CONFIG = 'e2eConfigSubmitOnSuccessOnly.json'
    REQUEST_TYPE_ACHECK_TDQ_AUTH_SUB_CONFIG = 'e2eConfigRequestTypesAcheckTdqAuthSub.json'
    REQUEST_TYPE_ACHECK_TDQ_WITH_DEFER_INIT = 'e2eConfigRequestTypesAcheckTdqWithDeferInit.json'
    VISA_CHECKOUT_CONFIG = 'e2eConfigVisaCheckout.json'
    VISA_CHECKOUT_WITH_SUBMIT_ON_SUCCESS_CONFIG = 'e2eConfigVisaCheckoutWithSubmitOnSuccess.json'
    VISA_CHECKOUT_WITH_CYBERTONICA_CONFIG = 'e2eConfigVisaCheckoutWithCybertonica.json'
    VISA_CHECKOUT_WITH_DEFERINIT_TRUE_CONFIG = 'e2eConfigVisaCheckoutWithDeferInitTrue.json'
    VISA_CHECKOUT_WITH_REQUEST_TYPES_CONFIG = 'e2eConfigVisaCheckoutWithRequestTypes.json'
    BUTTON_ID_CONFIG = 'e2eButtonIdConfig.json'
    ANIMATED_CARD_PAN_ICON_CONFIG = 'ConfigAnimatedCardAndPanIcon.json'
    PLACEHOLDERS_CONFIG = 'ConfigPlaceholders.json'
    STYLES_CONFIG = 'ConfigStyles.json'
    VALIDATION_STYLES_CONFIG = 'e2eConfigWithValidationStyling.json'
    CUSTOM_TRANSLATION_CONFIG = 'ConfigCustomTranslation.json'
    DISABLE_NOTIFICATION_CONFIG = 'ConfigDisableNotification.json'
    CHANGED_FORM_ID_CONFIG = 'e2eFormIdConfig.json'
