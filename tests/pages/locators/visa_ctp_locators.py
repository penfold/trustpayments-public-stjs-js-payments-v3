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
    card_number_modal_input: By = (By.ID, 'pan')
    expiry_date_list_month: By = (By.ID, 'expiryDateMonthId')
    expiry_date_list_year: By = (By.ID, 'expiryDateYearId')
    security_code_modal_input: By = (By.ID, 'cvv')
    masked_card_number: By = (By.XPATH, '//div[@class=\'st-card\'][1]/span[@class=\'st-card__description\']')
    masked_card_number_list: By = (By.XPATH, '//span[@class=\'st-card__description\']')


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

    vctp_iframe: By = (By.ID, 'vcop-dcf')
    continue_btn: By = (By.XPATH, '//button[@name=\'btnContinue\']')
    pay_now_btn: By = (By.XPATH, '//button[@name=\'btnContinue\']')
    remember_me_checkbox: By = (By.XPATH, '//label[@for=\'remember-me\']')
    cancel_checkout_btn: By = (By.XPATH, '//button[@aria-label=\'Cancel and return to merchant\']')
    card_menu_btn: By = (By.XPATH, '//div[@class=\'paylayer-card-row\']//button[contains(@id,\'menubutton\')]')
    switch_card_btn: By = (By.XPATH, '//button[@aria-label=\'Switch card\']')
    edit_card_btn: By = (By.XPATH, '//button[@aria-label=\'Edit Card\']')
    add_card_btn: By = (By.XPATH, '//button[@aria-label=\'Add Card\']')
    address_menu_btn: By = (By.XPATH, '//div[@class=\'paylayer-address-row\']//button[contains(@id,\'menubutton\')]')
    switch_address_btn: By = (By.XPATH, '//button[@aria-label=\'Switch Delivery Address\']')
    delete_address_btn: By = (By.XPATH, '//button[@aria-label=\'Delete Delivery Address\']')
    add_address_btn: By = (By.XPATH, '//button[@aria-label=\'ADD DELIVERY ADDRESSs\']')
    add_new_address_plus_btn: By = (By.XPATH, '//button[@aria-label=\'Add new\']')
    order_total_text: By = (By.XPATH, '//div[@class=\'paylayer-order-total\']/span')


