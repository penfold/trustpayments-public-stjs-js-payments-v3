from dataclasses import dataclass

from selenium.webdriver.common.by import By

from utils.enums.field_type import FieldType


@dataclass
class PaymentMethodsLocators:
    # pylint: disable=too-many-instance-attributes

    # merchant input fields
    merchant_name: By = (By.ID, 'st-form-last-name')
    merchant_email: By = (By.ID, 'st-form-email')
    merchant_phone: By = (By.ID, 'st-form-phone')
    amount_field: By = (By.ID, 'example-form-amount')

    # Credit card form
    card_number_input_field: By = (By.ID, 'st-card-number-input')
    expiration_date_input_field: By = (By.ID, 'st-expiration-date-input')
    security_code_input_field: By = (By.ID, 'st-security-code-input')

    # Fields validation messages
    card_number_field_validation_message: By = (By.ID, 'st-card-number-message')
    expiration_date_field_validation_message: By = (By.ID, 'st-expiration-date-message')
    security_code_field_validation_message: By = (By.ID, 'st-security-code-message')

    # Notification frame
    notification_frame: By = (By.CSS_SELECTOR, '#st-notification-frame.notification-frame')

    # Iframe
    control_form_iframe: By = (By.ID, 'st-control-frame-iframe')
    card_number_iframe: By = (By.ID, FieldType.CARD_NUMBER.value)
    expiration_date_iframe: By = (By.ID, FieldType.EXPIRATION_DATE.value)
    security_code_iframe: By = (By.ID, FieldType.SECURITY_CODE.value)
    animated_card_iframe: By = (By.ID, FieldType.ANIMATED_CARD.value)
    parent_iframe: By = (By.ID, FieldType.PARENT_IFRAME.value)

    # payment methods
    pay_button: By = (By.ID, 'merchant-submit-button')
    visa_checkout_mock_button: By = (By.ID, 'v-button')
    apple_pay_mock_button: By = (By.ID, 'st-apple-pay')
    google_pay_mock_button: By = (By.ID, 'gp-mocked-button')

    # labels
    page_title: By = (By.XPATH, '//*[@id=\'st-form\']/h1')
    card_number_label: By = (By.XPATH, '//label[@for=\'st-card-number-input\']')
    expiration_date_label: By = (By.XPATH, '//label[@for=\'st-expiration-date-input\']')
    security_code_label: By = (By.XPATH, '//label[@for=\'st-security-code-input\']')
    pay_button_label: By = (By.XPATH, '//button[@type=\'submit\']')
    purchase_authentication_label: By = (By.XPATH, '//*[text()="Purchase Authentication"]')
    please_submit_label: By = (By.XPATH, '//*[contains(text(),"Please submit")]')

    # logs
    logs_textarea: By = (By.ID, 'st-log-area')

    popups: By = (By.CSS_SELECTOR, '.st-popup div')
    callback_success_popup: By = (By.ID, 'success-popup')
    callback_error_popup: By = (By.ID, 'error-popup')
    callback_cancel_popup: By = (By.ID, 'cancel-popup')
    callback_data_popup: By = (By.ID, 'data-popup')
    submit_callback_jwt_response: By = (By.ID, 'data-popup-jwt')
    submit_callback_threedresponse: By = (By.ID, 'data-popup-threedresponse')
    callback_success_counter: By = (By.ID, 'success-callback-counter')
    callback_error_counter: By = (By.ID, 'error-callback-counter')
    callback_cancel_counter: By = (By.ID, 'cancel-callback-counter')
    callback_submit_counter: By = (By.ID, 'submit-callback-counter')
    browser_info_callback: By = (By.ID, 'st-browser-info')

    card_icon_in_input_field: By = (By.ID, 'card-icon')

    cardinal_modal: By = (By.ID, 'Cardinal-Modal')
    cardinal_iframe: By = (By.ID, FieldType.CARDINAL_IFRAME.value)

    cardinal_v2_authentication_code_field: By = (By.CLASS_NAME, 'input-field')
    cardinal_v2_authentication_submit_btn: By = (By.CLASS_NAME, 'primary')
    cardinal_v2_authentication_cancel_btn: By = (By.XPATH, '//input[@value=\'CANCEL\']')
    additional_button: By = (By.ID, 'additional-button')

    cardinal_v1_iframe: By = (By.ID, FieldType.V1_PARENT_IFRAME.value)
    cardinal_v1_authentication_code_field: By = (By.ID, 'password')
    cardinal_v1_authentication_submit_btn: By = (By.NAME, 'UsernamePasswordEntry')

    not_private_connection_text: By = (By.XPATH, '//*[contains(text(),\'This Connection Is Not Private\')]')
    animated_card: By = (By.ID, 'st-animated-card')

    # Js library actions (API methods)
    actions_bar_toggle: By = (By.ID, 'st-actions-toggler')
    action_btn_remove_frames: By = (By.ID, 'st-action-remove')
    action_btn_destroy_st: By = (By.ID, 'st-action-destroy')
    action_btn_start_st: By = (By.ID, 'st-action-start')
    action_btn_cancel_3ds: By = (By.ID, 'st-action-cancel-3ds')

    # ApplePay mock popup
    apple_pay_proceed_btn: By = (By.ID, 'apple-pay-authorize-payment-button')
    apple_pay_cancel_btn: By = (By.ID, 'apple-pay-cancel-payment-button')
