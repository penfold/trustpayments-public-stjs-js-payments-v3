import string
import time

from pages.base_page import BasePage
from pages.locators.visa_ctp_locators import VisaClickToPayLocators
from utils.helpers import gmail_service
from utils.helpers.random_data_generator import get_string


class VisaClickToPayPage(BasePage):

    def fill_payment_form(self, card_number, expiry_date, cvv):
        self._actions.send_keys(VisaClickToPayLocators.card_number_input, card_number)
        self._actions.select_element_by_text(VisaClickToPayLocators.expiry_month_select, '12')
        self._actions.select_element_by_text(VisaClickToPayLocators.expiry_year_select, '2030')
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

    def fill_delivery_details_form(self):
        delivery_fields = {
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
        for field_locator, value in delivery_fields.items():
            self._actions.send_keys(VisaClickToPayLocators.get_delivery_details_field_locator(field_locator), value)

    def fill_email_input(self, email):
        self._actions.send_keys(VisaClickToPayLocators.email_input, email)

    def click_submit_email_btn(self):
        self._actions.click(VisaClickToPayLocators.submit_email_btn)

    def fill_otp_field_and_check(self):
        self._waits.wait_for_element_to_be_displayed(VisaClickToPayLocators.otp_input)
        mail_ids = gmail_service.get_unseen_mail_ids_with_wait(10)
        self.get_code_and_fill_otp_field(mail_ids)
        if self._actions.is_element_displayed(VisaClickToPayLocators.otp_input):
            mail_ids = gmail_service.get_last_five_mail_ids_with_wait(3)
            self.get_code_and_fill_otp_field(mail_ids)

    def get_code_and_fill_otp_field(self, mail_ids):
        mail_index = len(mail_ids)
        while mail_index and self._actions.is_element_displayed(VisaClickToPayLocators.otp_input):
            code = gmail_service.get_verification_code_from_email_subject(str(int(mail_ids[mail_index - 1])))
            self.fill_otp_field(code)
            self.click_submit_otp_btn()
            mail_index -= 1
            time.sleep(4)

    def fill_otp_field(self, one_time_code):
        self._waits.wait_for_element_to_be_displayed(VisaClickToPayLocators.otp_input)
        while self._actions.get_element_attribute(VisaClickToPayLocators.otp_input, 'value'):
            self._actions.delete_on_input(VisaClickToPayLocators.otp_input)
        self._actions.send_keys(VisaClickToPayLocators.otp_input, one_time_code)

    def click_submit_otp_btn(self):
        self._actions.click(VisaClickToPayLocators.submit_otp_btn)

    def get_validation_message(self):
        return self._actions.get_text_with_wait(VisaClickToPayLocators.validation_message)

    def clear_email_input(self):
        self._actions.clear_input(VisaClickToPayLocators.email_input)

    def select_existing_card_by_name(self, card_name):
        self._waits.wait_for_element_to_be_displayed(VisaClickToPayLocators.add_card_button)
        self._waits.wait_for_element_to_be_displayed(VisaClickToPayLocators.get_card_by_name(card_name))
        self._actions.click(VisaClickToPayLocators.get_card_by_name(card_name))
        self._actions.click(VisaClickToPayLocators.submit_button)

    def add_new_card_in_modal(self, card_number, expiration_date, cvv):
        self._actions.scroll_directly_to_element(VisaClickToPayLocators.card_number_modal_input)
        self._waits.wait_for_element_to_be_displayed(VisaClickToPayLocators.card_number_modal_input)
        self._actions.send_keys(VisaClickToPayLocators.card_number_modal_input, card_number)
        self._actions.select_element_by_text(VisaClickToPayLocators.expiry_date_list_month, expiration_date[:3])
        self._actions.select_element_by_text(VisaClickToPayLocators.expiry_date_list_year, '20' + expiration_date[3::])
        self._actions.send_keys(VisaClickToPayLocators.security_code_modal_input, cvv)
        self._actions.click(VisaClickToPayLocators.submit_button)
