from enum import Enum


class ConfigCardPaymentsAndDigitalWallets(Enum):
    BASIC_CONFIG = 'e2eBasicConfig.json'
    DEFAULT_CONFIG = 'e2eDefaultConfig.json'
    VISUAL_BASIC_CONFIG = 'visualBaseConfig.json'
    VISUAL_MOCK_BASIC_CONFIG = 'visualMockBaseConfig.json'
    VISUAL_BASIC_WITH_STYLES_CONFIG = 'visualBaseConfigWithStyling.json'
    VALIDATION_STYLES_CONFIG = 'e2eConfigWithValidationStyling.json'
    START_ON_LOAD_CONFIG = 'e2eConfigStartOnLoadTrue.json'
    PLACEHOLDERS_CONFIG = 'ConfigPlaceholders.json'
    STYLES_CONFIG = 'ConfigStyles.json'
    TOKENIZED_PAYMENTS_STYLES_CONFIG = 'TokenizedPaymentsStylesConfig.json'
    CUSTOM_TRANSLATION_CONFIG = 'ConfigCustomTranslation.json'

    THREE_DS_SDK_INLINE_CONFIG = 'e2eConfig3dsLibraryInline.json'
    THREE_DS_SDK_POPUP_CONFIG = 'e2eConfig3dsLibraryPopup.json'
    THREE_DS_SDK_INLINE_PROCESSING_SCREEN_OVERLAY_CONFIG = 'e2eConfig3dsLibraryInlineProcessingScreenOverlay.json'
    THREE_DS_SDK_POPUP_PROCESSING_SCREEN_OVERLAY_CONFIG = 'e2eConfig3dsLibraryPopupProcessingScreenOverlay.json'
    THREE_DS_SDK_INLINE_PROCESSING_SCREEN_ATTACH_TO_ELEMENT_CONFIG = 'e2eConfig3dsLibraryInlineProcessingScreenAttachToElement.json'
    THREE_DS_SDK_POPUP_PROCESSING_SCREEN_ATTACH_TO_ELEMENT_CONFIG = 'e2eConfig3dsLibraryInPopupProcessingScreenAttachToElement.json'

    APPLE_PAY_CONFIG = 'e2eConfigApplePay.json'
    APPLE_PAY_DEFAULT_CONFIG = 'e2eConfigDefaultApplePay.json'
    GOOGLE_PAY_CONFIG = 'e2eConfigGooglePay.json'
    VISA_CHECKOUT_CONFIG = 'e2eConfigVisaCheckout.json'
    VISA_CHECKOUT_DEFAULT_CONFIG = 'e2eConfigDefaultVisaCheckout.json'
    WALLETS_CUSTOM_TRANSLATION_CONFIG = 'ConfigWalletsCustomTranslation.json'
