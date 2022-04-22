from dataclasses import dataclass

from selenium.webdriver.common.by import By


@dataclass
class VisaClickToPayLocators:
    # pylint: disable=too-many-instance-attributes

    # VCTP example page
    card_number_input: By = (By.ID, 'st-form-card-number')
    expiry_month_select: By = (By.ID, 'st-form-expiry-date-month')
    expiry_year_select: By = (By.ID, 'st-form-expiry-date-year')
    security_code_input: By = (By.ID, 'st-form-security-code')
    look_up_my_cards_btn: By = (By.ID, 'st-ctp-lookup-btn')
    register_card_checkbox: By = (By.ID, 'register')
    pay_securely_btn: By = (By.ID, 'merchant-submit-button')

    @classmethod
    def get_billing_details_field_locator(cls, billing_field) -> By.ID:
        return By.ID, f'st-form-{billing_field}'

    @classmethod
    def get_delivery_details_field_locator(cls, delivery_field) -> By.ID:
        return By.ID, f'st-form-{delivery_field}-d'

    # Visa login view
    email_input: By = (By.NAME, 'st-ctp-email')
    submit_email_btn: By = (By.XPATH, '//div[@id=\'st-ctp-login\']//button')
    submit_otp_btn: By = (By.XPATH, '//div[@id=\'st-ctp-login\']//button')
    resend_otp_btn: By = (By.ID, 'st-ctp-opt-resend')
    login_validation_message: By = (By.XPATH, '//span[contains(@class,\'field-error\')]')
    login_invalid_input: By = (By.XPATH, '//label[contains(@class,\'field--invalid\')]')
    otp_validation_message: By = (By.XPATH, '//span[contains(@class,\'otp-input-error\')]')
    otp_invalid_input: By = (By.XPATH, '//div[contains(@class,\'otp-inputs--invalid\')]')
    cancel_btn: By = (By.ID, 'st-hpp-prompt__close-btn')

    @classmethod
    def get_otp_input_field(cls, value) -> By.XPATH:
        return By.XPATH, f'//input[@name=\'st-ctp-code{value}\']'

    # Card list view
    add_card_button: By = (By.ID, 'st-add-card__button')
    cards_section: By = (By.XPATH, '//div[@id=\'st-ctp-cards\']/div[@class=\'st-card\']')
    pan_input: By = (By.ID, 'vctp-pan')
    expiry_date_list_month: By = (By.ID, 'vctp-expiryDateMonthId')
    expiry_date_list_year: By = (By.ID, 'vctp-expiryDateYearId')
    cvv_input: By = (By.ID, 'vctp-cvv')
    masked_card_number_list: By = (By.XPATH, '//span[@class=\'st-card__description\']')
    card_validation_message: By = (By.ID, 'vctp-pan-validation-status')
    not_you_btn: By = (By.ID, 'st-ctp-user-details__not--you')
    merchant_submit_label: By = (By.ID, 'merchant-submit-label')

    @classmethod
    def get_masked_card_number_locator_from_cards_list(cls, value) -> By.XPATH:
        return By.XPATH, f'//div[@class=\'st-card\'][{value}]/span[@class=\'st-card__description\']'

    @classmethod
    def get_card_locator_from_cards_list(cls, value) -> By.XPATH:
        return By.XPATH, f'//div[@class=\'st-card\'][{value}]'

    @classmethod
    def get_selected_card_locator_from_cards_list(cls, value) -> By.XPATH:
        return By.XPATH, f'//div[@class=\'st-card\'][{value}]//input'

    @classmethod
    def get_address_field_locator_from_visa_popup(cls, address_field) -> By.ID:
        return By.ID, address_field

    # Visa Checkout view
    vctp_iframe: By = (By.ID, 'vcop-dcf')
    continue_btn: By = (By.XPATH, '//button[@name=\'btnContinue\']')
    masked_card_number_on_visa_popup: By = (By.XPATH, '//section[@class=\'card-info-container\']//span[2]')
    masked_address_on_visa_popup: By = (By.XPATH, '//div[@class=\'v-list\']//li[1]')
    add_new_card_btn: By = (By.ID, 'btnAddCard')
    pay_now_btn: By = (By.XPATH, '//button[@name=\'btnContinue\']')
    remember_me_checkbox: By = (By.XPATH, '//label[@for=\'remember-me\']')
    cancel_checkout_btn: By = (By.XPATH, '//button[@aria-label=\'Cancel and return to merchant\']')
    terms_of_service_checkbox: By = (By.XPATH, '//label[@for=\'termsOfService\']/div[1]')

    # Alternative methods
    card_menu_btn: By = (By.XPATH, '//div[@class=\'paylayer-card-row\']//button[contains(@id,\'menubutton\')]')
    switch_card_btn: By = (By.XPATH, '//button[@aria-label=\'Switch Card\']')
    edit_card_btn: By = (By.XPATH, '//button[@aria-label=\'Edit Card\']')
    add_card_btn: By = (By.XPATH, '//button[@aria-label=\'Add Card\']')
    address_menu_btn: By = (By.XPATH, '//div[@class=\'paylayer-address-row\']//button[contains(@id,\'menubutton\')]')
    switch_address_btn: By = (By.XPATH, '//button[@aria-label=\'Switch Delivery Address\']')
    delete_address_btn: By = (By.XPATH, '//button[@aria-label=\'Delete Delivery Address\']')
    add_address_btn: By = (By.XPATH, '//button[@aria-label=\'Add Delivery Address\']')
    add_new_address_plus_btn: By = (By.XPATH, '//button[@aria-label=\'Add new\']')
    order_total_text: By = (By.XPATH, '//div[@class=\'paylayer-order-total\']/span')
    cvv_input_on_visa_popup: By = (By.ID, 'code')
    available_addresses_container: By = (
        By.XPATH, '//*[@id="app"]/div//section/main//div[contains(@aria-label, \'Address\')]')
    edit_expiration_date_input: By = (By.ID, 'exp-date')
    edit_security_code_input: By = (By.ID, 'cvv')
    cancel_card_editing_btn: By = (By.ID, 'btnCancel')
    delete_card_upon_editing_btn: By = (By.ID, 'btnDelete')
    confirm_card_delete_upon_editing_btn: By = (By.ID, 'btnContinue')
    card_update_success_message: By = (By.XPATH,
                                       '//*[@id="app"]//div/p/span[2][contains(text(), \'success\')]')
    address_success_delete_message: By = (By.XPATH,
                                          '//span[contains(text(), \'Your address was deleted successfully\')]')
    add_address_popup_btn: By = (By.XPATH, '//button[@aria-label=\'Add Address\']')
    sign_out_btn: By = (By.XPATH, '//*[@id="app"]//section//section[1]/div//button[contains(@aria-label, \'account information\')]')
    sign_out_btn_confirm: By = (By.XPATH, '//*[@id="app"]//section//section[1]//div//ul//button')
    card_number_modal_input: By = (By.ID, 'pan')
    expiry_date_list_month_modal: By = (By.ID, 'expiryDateMonthId')
    expiry_date_list_year_modal: By = (By.ID, 'expiryDateYearId')
    security_code_modal_input: By = (By.ID, 'cvv')

    @classmethod
    def get_available_address_from_list(cls, value) -> By.XPATH:
        return By.XPATH, f'//*[@id="app"]//button//div[contains(@aria-label, \'Address {value}\' )]'

    # Unregister user popup options
    use_address_for_delivery_input: By = (By.ID, 'use_billing_as_delivery')
    use_address_for_delivery_div: By = (By.XPATH, '//*[@id="app"]//section/main//form//section[1]'
                                                  '/label/div[contains(@class, \'visa-ui-checkbox-element-wrapper-focus\')]')
    edit_card_unregistered_btn: By = (
        By.XPATH, '//*[@id="app"]//section/main//form/section[1]'
                  '//button[contains(@name, \'btnReturn\')]')
    edit_address_unregistered_btn: By = (By.XPATH, '//button[@aria-label=\'EDIT DELIVERY ADDRESS\']')
    close_warning_banner_btn: By = (By.XPATH, '//*[@id="app"]//section/main/div[1]/section'
                                              '//button[contains(@title, \'Close Banner\')]')
