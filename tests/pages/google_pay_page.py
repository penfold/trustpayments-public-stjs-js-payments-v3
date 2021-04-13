import json

from configuration import CONFIGURATION
from pages.locators.google_pay_locators import GooglePayLocators
from pages.locators.payment_methods_locators import PaymentMethodsLocators
from pages.base_page import BasePage
from utils.enums.field_type import FieldType
from utils.helpers.request_executor import add_to_shared_dict


class GooglePayPage(BasePage):

    def click_google_pay_button(self):
        self._waits.wait_for_element_to_be_clickable(GooglePayLocators.gpay_button)
        self._actions.click(GooglePayLocators.gpay_button)

    def fill_email_address_field(self, email):
        pass

    def fill_password_field(self, password):
        pass
