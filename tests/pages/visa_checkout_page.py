import time

from configuration import CONFIGURATION
from pages.locators.visa_checkout_locators import VisaCheckoutLocators
from pages.base_page import BasePage
from utils.enums.field_type import FieldType
from utils.enums.visa_checkout_field import VisaCheckoutField
from utils.helpers import gmail_service


class VisaCheckoutPage(BasePage, VisaCheckoutLocators):

    def click_visa_checkout_button(self, context):
        if 'switch_to_parent_iframe' in context.scenario.tags:
            self._actions.switch_to_default_iframe()
        self._waits.wait_for_element_to_be_clickable(VisaCheckoutLocators.visa_checkout_button)
        self._actions.click(VisaCheckoutLocators.visa_checkout_button)

    def click_visa_checkout_close_button(self):
        self._waits.wait_for_element_with_id_to_be_displayed(FieldType.VISA_CHECKOUT.value)
        self._waits.wait_until_iframe_is_presented_and_switch_to_it(FieldType.VISA_CHECKOUT.value)
        self._waits.wait_for_element_to_be_displayed(VisaCheckoutLocators.visa_close_popup_button)
        self._actions.click(VisaCheckoutLocators.visa_close_popup_button)
        self._waits.wait_for_element_to_be_not_displayed(VisaCheckoutLocators.visa_close_popup_button)
        self._actions.switch_to_example_page_parent_iframe()

    def fill_selected_field(self, field):
        if field == VisaCheckoutField.EMAIL_ADDRESS.name:
            pass
            # self.fill_email_address(EMAIL_LOGIN)
        elif field == VisaCheckoutField.ONE_TIME_PASSWORD.name:
            self._waits.wait_for_element_to_be_displayed(VisaCheckoutLocators.visa_one_time_code)
            mail_ids = gmail_service.get_unseen_mail_ids_with_wait(5)
            self.fill_one_time_password_with_wait(mail_ids)
            if self._actions.is_element_displayed(VisaCheckoutLocators.visa_one_time_code):
                mail_ids = gmail_service.get_last_five_mail_ids_with_wait(3)
                self.fill_one_time_password_with_wait(mail_ids)

    def fill_one_time_password_with_wait(self, mail_ids):
        mail_index = len(mail_ids)
        while mail_index and self._actions.is_element_displayed(VisaCheckoutLocators.visa_one_time_code):
            code = gmail_service.get_verification_code_from_email_subject(str(int(mail_ids[mail_index - 1])))
            self.fill_one_time_code(code)
            self.click_continue_checkout_process()
            mail_index -= 1
            time.sleep(4)

    def fill_email_address(self, email):
        self._waits.wait_until_iframe_is_presented_and_switch_to_it(FieldType.VISA_CHECKOUT.value)
        self._waits.wait_for_element_to_be_displayed(VisaCheckoutLocators.visa_returning)
        self._actions.click(VisaCheckoutLocators.visa_returning)
        self._actions.send_keys(VisaCheckoutLocators.visa_email, email)

    def click_continue_checkout_process(self):
        self._waits.wait_for_element_to_be_clickable(VisaCheckoutLocators.visa_confirm_process)
        self._actions.click(VisaCheckoutLocators.visa_confirm_process)

    def click_continue_visa_payment_process(self):
        self._waits.wait_for_element_to_be_clickable(VisaCheckoutLocators.visa_continue_payment_process)
        self._actions.click(VisaCheckoutLocators.visa_continue_payment_process)

    def fill_one_time_code(self, one_time_code):
        self._waits.wait_for_element_to_be_displayed(VisaCheckoutLocators.visa_one_time_code)
        while self._actions.get_element_attribute(VisaCheckoutLocators.visa_one_time_code, 'value'):
            self._actions.delete_on_input(VisaCheckoutLocators.visa_one_time_code)
        self._actions.send_keys(VisaCheckoutLocators.visa_one_time_code, one_time_code)

    def select_card_by_ending_number(self, card_number):
        self.visa_card_with_ending_number = card_number
        self._waits.wait_for_element_to_be_displayed(self.visa_card_with_ending_number)
        self._actions.click(self.visa_card_with_ending_number)

    def fill_security_code(self):
        self._waits.wait_for_element_to_be_displayed(VisaCheckoutLocators.visa_security_code)
        self._actions.send_keys(VisaCheckoutLocators.visa_security_code, '123')

    def is_security_code_displayed(self):
        CONFIGURATION.TIMEOUT = 3
        if self._waits.wait_and_check_is_element_displayed(VisaCheckoutLocators.visa_security_code) is True:
            self.fill_security_code()
            self.click_continue_visa_payment_process()
