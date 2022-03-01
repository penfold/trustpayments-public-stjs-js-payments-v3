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

    # Visa modal
    email_input: By = (By.NAME, 'st-ctp-email')
    submit_email_btn: By = (By.XPATH, '//div[@id=\'st-ctp-login\']//button')
    submit_otp_btn: By = (By.XPATH, '//div[@id=\'st-ctp-login\']//button')
    otp_input: By = (By.NAME, 'st-ctp-code')
    resend_otp_btn: By = (By.ID, 'st-ctp-opt-resend')
    validation_message: By = (By.XPATH, '//div[@class=\'st-hpp-prompt__notification\']')
    add_card_button: By = (By.ID, 'st-add-card__button')
    #cos jest nie tak z tym elementem i nie mozna go znalezc
    card_number_modal_input: By = (By.ID, 'pan')
    expiry_date_list_month: By = (By.ID, 'expiryDateMonthId')
    expiry_date_list_year: By = (By.ID, 'expiryDateYearId')
    security_code_modal_input: By = (By.ID, 'cvv')

    @classmethod
    def get_card_by_name(cls, card_name) -> By.XPATH:
        return By.XPATH, f"""//*[@id="st-ctp-cards"]/div[1]/span[3][contains(text(), '{card_name}')]"""
