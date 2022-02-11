from dataclasses import dataclass

from selenium.webdriver.common.by import By


@dataclass
class VisaClickToPayLocators:
    # pylint: disable=too-many-instance-attributes

    @classmethod
    def get_billing_details_field_locator(cls, billing_field) -> By.ID:
        return By.ID, f'st-form-{billing_field}'

    card_number_input: By = (By.ID, 'st-form-card-number')
    expiry_date_input: By = (By.ID, 'st-form-expiry-date')
    security_code_input: By = (By.ID, 'st-form-security-code')
    look_up_my_cards_btn: By = (By.ID, 'todo')
    register_card_checkbox: By = (By.ID, 'register')
    submit_button: By = (By.ID, 'merchant-submit-button')
