from enum import Enum


class E2eConfig(Enum):
    BASIC_CONFIG = 'e2eBasicConfig.json'
    BASIC_CONFIG_WITH_IGNORE_JS_INIT_ERRORS = 'e2eBasicConfigIgnoreJsInitErrors.json'
    VISUAL_BASIC_CONFIG = 'visualBaseConfig.json'
    VISUAL_BASIC_WITH_STYLES_CONFIG = 'visualBaseConfigWithStyling.json'
    CYBERTONICA_CONFIG = 'e2eConfigCybertonica.json'
    CYBERTONICA_START_ON_LOAD_CONFIG = 'e2eConfigCybertonicaStartOnLoadTrue.json'
    START_ON_LOAD_CONFIG = 'e2eConfigStartOnLoadTrue.json'
    START_ON_LOAD_SUBMIT_ON_SUCCESS_CONFIG = 'e2eConfigStartOnLoadSubmitOnSuccess.json'
    START_ON_LOAD_SUBMIT_ON_ERROR_CONFIG = 'e2eConfigStartOnLoadSubmitOnError.json'
    SUBMIT_ON_ERROR_CONFIG = 'e2eConfigSubmitOnError.json'
    SUBMIT_ON_ERROR_CONFIG_WITH_IGNORE_JS_INIT_ERRORS = 'e2eConfigSubmitOnErrorIgnoreJsInitErrors.json'
    SUBMIT_ON_ERROR_ONLY_CONFIG = 'e2eConfigSubmitOnErrorOnly.json'
    SUBMIT_ON_CANCEL_CONFIG = 'e2eConfigSubmitOnCancel.json'
    SUBMIT_ON_SUCCESS_CONFIG = 'e2eConfigSubmitOnSuccess.json'
    SUBMIT_ON_SUCCESS_SECURITY_CODE_CONFIG = 'e2eConfigSubmitOnSuccessSecurityCode.json'
    SUBMIT_ON_ERROR_REQUEST_TYPES_CONFIG = 'e2eConfigSubmitOnErrorRequestTypes.json'
    SUBMIT_ON_SUCCESS_CACHETOKEN_FIELD = 'e2eConfigSubmitOnSuccessCachetokenField.json'
    SUBMIT_ON_SUCCESS_CACHETOKEN_FIELD_START_ON_LOAD = 'e2eConfigSubmitOnSuccessCachetokenStartOnLoad.json'
    SUBMIT_ON_SUCCESS_ERROR_CONFIG = 'e2eConfigSubmitOnSuccessError.json'
    SUBMIT_ON_SUCCESS_ERROR_WITH_REDIRECT_CALLBACK_CONFIG = 'e2eConfigSubmitOnSuccessErrorWithRedirectCallback.json'
    SUBMIT_ON_WITH_REDIRECT_SUBMIT_CALLBACK_CONFIG = 'e2eConfigSubmitOnWithRedirectSubmitCallback.json'
    REDIRECT_ON_SUCCESS_CALLBACK_CONFIG = 'e2eConfigRedirectOnSuccessCallback.json'
    REDIRECT_ON_ERROR_CALLBACK_CONFIG = 'e2eConfigRedirectOnErrorCallback.json'
    REDIRECT_ON_SUBMIT_CALLBACK_CONFIG = 'e2eConfigRedirectOnSubmitCallback.json'
    REDIRECT_ON_SUBMIT_CALLBACK_WITH_ERROR_CODE_CHECK_CONFIG = 'e2eConfigRedirectOnSubmitCallbackWithErrorcodeCheck.json'
    TOKENISATION_CONFIG = 'e2eForTokenisation.json'
    TOKENISATION_AND_SUBMIT_ON_SUCCESS_CONFIG = 'e2eConfigTokenisationAndSubmitOnSuccess.json'
    REQUEST_TYPES_CONFIG = 'e2eConfigRequestTypes.json'
    REQUEST_TYPES_CONFIG_INVALID_ORDER = 'e2eConfigRequestTypesInvalidOrder.json'
    REQUEST_TYPE_ACC_TDQ_AUTH_RISK_CONFIG = 'e2eConfigRequestTypesAccTdqAuthRisk.json'
    SUBMIT_ON_SUCCESS_ONLY_CONFIG = 'e2eConfigSubmitOnSuccessOnly.json'
    REQUEST_TYPE_ACHECK_TDQ_AUTH_SUB_CONFIG = 'e2eConfigRequestTypesAcheckTdqAuthSub.json'
    VISA_CHECKOUT_CONFIG = 'e2eConfigVisaCheckout.json'
    VISA_CHECKOUT_WITH_SUBMIT_ON_SUCCESS_CONFIG = 'e2eConfigVisaCheckoutWithSubmitOnSuccess.json'
    VISA_CHECKOUT_WITH_CYBERTONICA_CONFIG = 'e2eConfigVisaCheckoutWithCybertonica.json'
    VISA_CHECKOUT_WITH_REQUEST_TYPES_CONFIG = 'e2eConfigVisaCheckoutWithRequestTypes.json'
    BUTTON_ID_CONFIG = 'e2eButtonIdConfig.json'
    ANIMATED_CARD_PAN_ICON_CONFIG = 'ConfigAnimatedCardAndPanIcon.json'
    PLACEHOLDERS_CONFIG = 'ConfigPlaceholders.json'
    STYLES_CONFIG = 'ConfigStyles.json'
    VALIDATION_STYLES_CONFIG = 'e2eConfigWithValidationStyling.json'
    CUSTOM_TRANSLATION_CONFIG = 'ConfigCustomTranslation.json'
    DISABLE_NOTIFICATION_CONFIG = 'ConfigDisableNotification.json'
    CHANGED_FORM_ID_CONFIG = 'e2eFormIdConfig.json'
    STOP_SUBMIT_FORM_ON_ENTER = 'e2eConfigStopSubmitFormOnEnter.json'
    STOP_SUBMIT_FORM_ON_ENTER_FALSE = 'e2eConfigStopSubmitFormOnEnterFalse.json'
    SUBMIT_ON_SUCCESS_STOP_SUBMIT_FORM_ON_ENTER = 'e2eSubmitOnSuccessStopSubmitFormOnEnter.json'
    THREE_DS_SDK_SUBMIT_ON_SUCCESS_CONFIG = 'e2eConfig3dsLibrarySubmitOnSuccess.json'
    THREE_DS_SDK_INLINE_CONFIG = 'e2eConfig3dsLibraryInline.json'
    THREE_DS_SDK_POPUP_CONFIG = 'e2eConfig3dsLibraryPopup.json'
    THREE_DS_SDK_POPUP_TRANSLATIONS_CONFIG = 'e2eConfig3dsLibraryPopupTranslations.json'
    THREE_DS_SDK_INLINE_PROCESSING_SCREEN_OVERLAY_CONFIG = 'e2eConfig3dsLibraryInlineProcessingScreenOverlay.json'
    THREE_DS_SDK_POPUP_PROCESSING_SCREEN_OVERLAY_CONFIG = 'e2eConfig3dsLibraryPopupProcessingScreenOverlay.json'
    THREE_DS_SDK_INLINE_PROCESSING_SCREEN_ATTACH_TO_ELEMENT_CONFIG = 'e2eConfig3dsLibraryInlineProcessingScreenAttachToElement.json'
    THREE_DS_SDK_POPUP_PROCESSING_SCREEN_ATTACH_TO_ELEMENT_CONFIG = 'e2eConfig3dsLibraryInPopupProcessingScreenAttachToElement.json'
