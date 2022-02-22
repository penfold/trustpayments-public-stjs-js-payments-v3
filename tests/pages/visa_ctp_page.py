import string
from pages.base_page import BasePage
from pages.locators.visa_ctp_locators import VisaClickToPayLocators
from utils.helpers.random_data_generator import get_string


class VisaClickToPayPage(BasePage):

    def fill_payment_form(self, card_number, expiry_date, cvv):
        self._actions.send_keys(VisaClickToPayLocators.card_number_input, card_number)
        self._actions.send_keys(VisaClickToPayLocators.expiry_date_input, expiry_date)
        self._actions.send_keys(VisaClickToPayLocators.security_code_input, cvv)

    def click_submit_button(self):
        self._actions.click(VisaClickToPayLocators.submit_button)

    def click_look_up_my_cards_btn(self):
        self._actions.click(VisaClickToPayLocators.look_up_my_cards_btn)

    def click_register_card_checkbox(self):
        self._actions.click(VisaClickToPayLocators.register_card_checkbox)

    def fill_billing_details_form(self):
        billing_fields = {
            'title': 'Mr',
            'first-name': get_string(5, 1, string.ascii_letters),
            'last-name': get_string(5, 1, string.ascii_letters),
            'house-name': get_string(5, 1),
            'street': get_string(5, 1, string.ascii_letters),
            'town': 'London',
            'county': get_string(5, 1, string.ascii_letters),
            'country': 'Great Britain',
            'post-code': get_string(5, 1, string.digits),
            'email': f'{get_string(5, 1)}@testemail.com',
            'telephone': get_string(8, 1, string.digits),
            'telephone-type': get_string(4, 1),
        }
        for field_locator, value in billing_fields.items():
            self._actions.send_keys(VisaClickToPayLocators.get_billing_details_field_locator(field_locator), value)
