from enum import Enum, auto


class FieldType(Enum):
    ALL = 'all'
    CARD_NUMBER = 'st-card-number-iframe'
    EXPIRATION_DATE = 'st-expiration-date-iframe'
    EXPIRATION_DATE_INPUT = 'st-expiration-date-input'
    SECURITY_CODE = 'st-security-code-iframe'
    ANIMATED_CARD = 'st-animated-card-iframe'
    NOTIFICATION_FRAME = 'st-notification-frame-iframe'
    CONTROL_FRAME = 'st-control-frame-iframe'
    CT_FRAME = 'Cardinal-collector'
    CARDINAL_IFRAME = 'Cardinal-CCA-IFrame'
    PARENT_IFRAME = 'st-parent-frame'
    V1_PARENT_IFRAME = 'authWindow'
    VISA_CHECKOUT = 'vcop-src-frame'
    SUBMIT_BUTTON = auto()
    ADDITIONAL_SUBMIT_BUTTON = auto()
    NAME = auto()
    EMAIL = auto()
    PHONE = auto()
    CARD_ICON = auto()
    TOKENIZED_SECURITY_CODE = 'st-security-code-tokenized-iframe'
    TOKENIZED_SUBMIT_BUTTON = 'tokenized-submit-button'
