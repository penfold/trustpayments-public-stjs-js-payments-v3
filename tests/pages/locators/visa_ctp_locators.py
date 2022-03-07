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
    submit_button: By = (By.ID, 'merchant-submit-button')

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

    @classmethod
    def get_card_locator_from_cards_list(cls, value) -> By.ID:
        return By.XPATH, f'//div[@class=\'st-card\'][{value}]'

    # Visa Checkout view
    visa_click_two_pay_name_field: By = (By.ID, "firstName")
    visa_click_two_pay_surname: By = (By.ID, "lastName")
    visa_click_two_pay_address_line_1: By = (By.ID, "line1")
    visa_click_two_pay_city_address: By = (By.ID, "city")
    visa_click_two_pay_state_field: By = (By.ID, "stateProvinceCode")
    visa_click_two_pay_postal_code: By = (By.ID, "postalCode")
    visa_click_two_pay_phone_number_field: By = (By.ID, "phone-number-field")
    visa_click_two_pay_phone_finish_setup_header: By = (
    By.XPATH, '//*[@id="app"]/div/div[2]/div/div/section/main/div[2]/div[2]/div/div/section/h1')


