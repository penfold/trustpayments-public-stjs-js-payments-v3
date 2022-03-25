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
    otp_input: By = (By.NAME, 'st-ctp-code')
    resend_otp_btn: By = (By.ID, 'st-ctp-opt-resend')
    validation_message: By = (By.XPATH, '//div[@class=\'st-hpp-prompt__notification\']')
    cancel_btn: By = (By.ID, 'st-hpp-prompt__close-btn')

    # Card list view
    add_card_button: By = (By.ID, 'st-add-card__button')
    cards_section: By = (By.ID, '//div[@id=\'st-ctp-cards\']/div[@class=\'st-card\']')
    card_number_modal_input: By = (By.ID, 'pan')
    expiry_date_list_month: By = (By.ID, 'expiryDateMonthId')
    expiry_date_list_year: By = (By.ID, 'expiryDateYearId')
    security_code_modal_input: By = (By.ID, 'cvv')
    masked_card_number_list: By = (By.XPATH, '//span[@class=\'st-card__description\']')
    card_validation_message: By = (By.ID, 'pan-validation-status')
    not_you_btn: By = (By.ID, 'st-ctp-user-details__not--you')

    @classmethod
    def get_masked_card_number_locator_from_cards_list(cls, value) -> By.XPATH:
        return By.XPATH, f'//div[@class=\'st-card\'][{value}]/span[@class=\'st-card__description\']'

    @classmethod
    def get_card_locator_from_cards_list(cls, value) -> By.XPATH:
        return By.XPATH, f'//div[@class=\'st-card\'][{value}]'

    @classmethod
    def get_selected_card_locator_from_cards_list(cls, value) -> By.XPATH:
        return By.XPATH, f'//div[@class=\'st-card\'][{value}]//input'

    # Visa Checkout view
    @classmethod
    def get_address_field_locator_from_visa_popup(cls, address_field) -> By.ID:
        return By.ID, address_field

    # Visa popup
    vctp_iframe: By = (By.ID, 'vcop-dcf')
    continue_btn: By = (By.XPATH, '//button[@name=\'btnContinue\']')
    masked_card_number_on_visa_popup: By = (By.XPATH, '//section[@class=\'card-info-container\']//span[2]')
    masked_address_on_visa_popup: By = (By.XPATH, '//div[@class=\'v-list\']//li[1]')
    add_new_card_btn: By = (By.ID, 'btnAddCard')
    pay_now_btn: By = (By.XPATH, '//button[@name=\'btnContinue\']')
    remember_me_checkbox: By = (By.XPATH, '//label[@for=\'remember-me\']')
    cancel_checkout_btn: By = (By.XPATH, '//button[@aria-label=\'Cancel and return to merchant\']')
    card_menu_btn: By = (By.XPATH, '//div[@class=\'paylayer-card-row\']//button[contains(@id,\'menubutton\')]')
    switch_card_btn: By = (By.XPATH, '//button[@aria-label=\'Switch Card\']')
    edit_card_btn: By = (By.XPATH, '//button[@aria-label=\'Edit Card\']')
    add_card_btn: By = (By.XPATH, '//button[@aria-label=\'Add Card\']')
    address_menu_btn: By = (By.XPATH, '//div[@class=\'paylayer-address-row\']//button[contains(@id,\'menubutton\')]')
    switch_address_btn: By = (By.XPATH, '//button[@aria-label=\'Switch Delivery Address\']')
    available_addresses_container: By = (
        By.XPATH, '//*[@id="app"]/div//section/main//div[contains(@aria-label, \'Address\')]')
    delete_address_btn: By = (By.XPATH, '//button[@aria-label=\'Delete Delivery Address\']')
    add_address_btn: By = (By.XPATH, '//button[@aria-label=\'ADD DELIVERY ADDRESSs\']')
    add_new_address_plus_btn: By = (By.XPATH, '//button[@aria-label=\'Add new\']')
    order_total_text: By = (By.XPATH, '//div[@class=\'paylayer-order-total\']/span')
    edit_expiration_date_input: By = (By.ID, 'exp-date')
    edit_security_code_input: By = (By.ID, 'cvv')
    cancel_card_editing_btn: By = (By.ID, 'btnCancel')
    delete_card_upon_editing_btn: By = (By.ID, 'btnDelete')
    confirm_card_delete_upon_editing_btn: By = (By.ID, 'btnContinue')
    card_update_success_message: By = (By.XPATH, '//*[@id="app"]/div/div[2]/div/div/section/main/div[1]/section//div/p/span[2][contains(text(), \'success\')]')
    add_address_popup_btn: By = (By.XPATH, '//button[@aria-label=\'Add Address\']')

    @classmethod
    def get_available_address_from_list(cls, value) -> By.XPATH:
        return By.XPATH, f'//*[@id="app"]//button//div[contains(@aria-label, \'Address {value}\' )]'
