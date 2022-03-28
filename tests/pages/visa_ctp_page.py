import re
import time

from assertpy import assert_that

import random
import re
import time

from assertpy import assert_that

from pages.base_page import BasePage
from pages.locators.payment_methods_locators import PaymentMethodsLocators
from pages.locators.visa_ctp_locators import VisaClickToPayLocators
from utils.enums.shared_dict_keys import SharedDictKey
from utils.helpers import gmail_service
from utils.enums.card import Card
from utils.enums.shared_dict_keys import SharedDictKey
from utils.helpers import gmail_service
from utils.helpers.random_data_generator import get_string
from utils.helpers.request_executor import add_to_shared_dict


class VisaClickToPayPage(BasePage):
    # pylint: disable=too-many-public-methods

    def fill_payment_form(self, card_number, expiry_date, cvv):
        self._actions.send_keys(VisaClickToPayLocators.card_number_input, card_number)
        self._actions.select_element_by_text(VisaClickToPayLocators.expiry_month_select, expiry_date[:2])
        self._actions.select_element_by_text(VisaClickToPayLocators.expiry_year_select, '20' + expiry_date[3::])
        self._actions.send_keys(VisaClickToPayLocators.security_code_input, cvv)

    def click_pay_securely_button(self):

        self._waits.wait_for_element_to_be_displayed(VisaClickToPayLocators.pay_securely_btn)
        self._actions.click(VisaClickToPayLocators.pay_securely_btn)

    def click_look_up_my_cards_btn(self):
        self._actions.click(VisaClickToPayLocators.look_up_my_cards_btn)

    def is_look_up_my_cards_btn_displayed(self):
        self._waits.wait_for_element_to_be_displayed(VisaClickToPayLocators.look_up_my_cards_btn)
        return self._actions.is_element_displayed(VisaClickToPayLocators.look_up_my_cards_btn)

    def click_register_card_checkbox(self):
        self._actions.click(VisaClickToPayLocators.register_card_checkbox)

    def fill_billing_details_form(self):
        billing_fields = {
            'title': 'Mr',
            'first-name': 'John',
            'last-name': 'Test',
            'house-name': '2',
            'street': 'Willow Grove',
            'town': 'Willow Grove',
            'county': 'Montgomery',
            'country': 'USA',
            'post-code': '19001',
            'email': f'{get_string(5, 1)}@testemail.com',
            'telephone': '9343242342',
            'telephone-type': '1'
        }
        for field_locator, value in billing_fields.items():
            self._actions.send_keys(VisaClickToPayLocators.get_billing_details_field_locator(field_locator), value)

    def fill_delivery_details_form(self):
        delivery_fields = {
            'title': 'Mr',
            'first-name': 'John',
            'last-name': 'Test',
            'house-name': '2',
            'street': 'Willow Grove',
            'town': 'Willow Grove',
            'county': 'Montgomery',
            'country': 'USA',
            'post-code': '19001',
            'email': f'{get_string(5, 1)}@testemail.com',
            'telephone': '9343242342',
            'telephone-type': '1'
        }
        for field_locator, value in delivery_fields.items():
            self._actions.send_keys(VisaClickToPayLocators.get_delivery_details_field_locator(field_locator), value)

    def fill_email_input(self, email):
        self._actions.send_keys(VisaClickToPayLocators.email_input, email)

    def click_submit_email_btn(self):
        self._actions.click(VisaClickToPayLocators.submit_email_btn)

    def fill_otp_field_and_check(self):
        self._waits.wait_for_element_to_be_displayed(VisaClickToPayLocators.otp_input)

        self.get_code_and_fill_otp_field()
        # if self._actions.is_element_displayed(VisaClickToPayLocators.otp_input):
        #     mail_ids = gmail_service.get_last_five_mail_ids_with_wait(3)
        #     self.get_code_and_fill_otp_field(mail_ids)

    def get_code_and_fill_otp_field(self):
        self._waits.wait_for_element_to_be_displayed(VisaClickToPayLocators.otp_input)
        while self._actions.is_element_displayed(VisaClickToPayLocators.otp_input):
            code = self.get_last_unseen_otp()
            self.fill_otp_field(code)
            self.click_submit_otp_btn()
            time.sleep(3)

    def fill_otp_field(self, one_time_code):
        self._waits.wait_for_element_to_be_displayed(VisaClickToPayLocators.otp_input)
        while self._actions.get_element_attribute(VisaClickToPayLocators.otp_input, 'value'):
            self._actions.delete_on_input(VisaClickToPayLocators.otp_input)
        self._actions.send_keys(VisaClickToPayLocators.otp_input, one_time_code)

    def get_last_unseen_otp(self):
        mail_ids = gmail_service.get_unseen_mail_ids_with_wait(10)
        code = gmail_service.get_verification_code_from_email_subject(str(int(mail_ids[len(mail_ids) - 1])))
        return code

    def click_submit_otp_btn(self):
        self._actions.click(VisaClickToPayLocators.submit_otp_btn)

    def get_validation_message(self):
        return self._actions.get_text_with_wait(VisaClickToPayLocators.validation_message)

    def clear_email_input(self):
        self._actions.clear_input(VisaClickToPayLocators.email_input)

    def clear_card_details_inputs(self):
        self._actions.clear_input(VisaClickToPayLocators.card_number_input)
        self._actions.clear_input(VisaClickToPayLocators.security_code_input)

    def click_cancel_button(self):
        self._actions.click(VisaClickToPayLocators.cancel_btn)

    def is_login_form_displayed(self):
        self._waits.wait_for_element_to_be_displayed(VisaClickToPayLocators.submit_email_btn)
        return self._actions.is_element_displayed(VisaClickToPayLocators.submit_email_btn)

    def click_resend_code_button(self):
        self._actions.click(VisaClickToPayLocators.resend_otp_btn)

    # Card list view
    def click_add_new_card_btn(self):
        self._actions.click(VisaClickToPayLocators.add_card_button)

    def select_card_from_cards_list_by_index(self, card_number):
        self._actions.click(VisaClickToPayLocators.get_card_locator_from_cards_list(card_number))

    def select_card_from_cards_list_by_number(self, number):
        cards_number_list = self._actions.find_elements(VisaClickToPayLocators.masked_card_number_list)
        for card in cards_number_list:
            if number in card.text:
                card.click()

    def fill_card_details_in_modal(self, card_number, expiration_date, cvv):
        self._actions.switch_to_default_iframe()
        self._actions.send_keys(VisaClickToPayLocators.card_number_modal_input, card_number)
        self._actions.select_element_by_text(VisaClickToPayLocators.expiry_date_list_month, expiration_date[:2])
        self._actions.select_element_by_text(VisaClickToPayLocators.expiry_date_list_year, '20' + expiration_date[3::])
        self._actions.send_keys(VisaClickToPayLocators.security_code_modal_input, cvv)

    def get_masked_card_number_from_card_list(self, number):
        masked_card_number = self._actions.get_text_with_wait(
            VisaClickToPayLocators.get_masked_card_number_locator_from_cards_list(number))[-4:]
        return masked_card_number

    def is_first_card_auto_selected(self):
        self._waits.wait_for_element_to_be_displayed(VisaClickToPayLocators.cards_section)
        return self._actions.is_checkbox_selected(VisaClickToPayLocators.get_selected_card_locator_from_cards_list('1'))

    def is_cards_section_displayed(self):
        self._waits.wait_for_element_to_be_not_displayed(VisaClickToPayLocators.cards_section)
        return self._actions.is_element_displayed(VisaClickToPayLocators.cards_section)

    def click_not_you_btn(self):
        self._actions.click(VisaClickToPayLocators.not_you_btn)

    # Visa Checkout view
    def fill_required_address_fields(self):
        address_fields = {
            'firstName': 'John',
            'lastName': 'Test',
            'line1': 'Willow Grove',
            'city': 'Willow Grove',
            'stateProvinceCode': 'PA',
            'postalCode': '19001',
            'phone-number-field': '9343242342',
            'email': f'{get_string(5, 1)}@testemail.com',
        }

        self._actions.switch_to_iframe(VisaClickToPayLocators.vctp_iframe)
        for field_locator, value in address_fields.items():
            self._actions.send_keys(VisaClickToPayLocators.get_address_field_locator_from_visa_popup(field_locator),
                                    value)
        self._actions.click(VisaClickToPayLocators.continue_btn)

    def get_masked_card_number_from_visa_ctp_popup(self):
        self._actions.switch_to_iframe(VisaClickToPayLocators.vctp_iframe)
        masked_card_number = self._actions.get_text_with_wait(VisaClickToPayLocators.masked_card_number_on_visa_popup)[-4:]
        return masked_card_number

    def confirm_user_address(self):
        self._waits.wait_for_element_visibility(VisaClickToPayLocators.continue_btn)
        self._waits.wait_for_element_to_be_clickable(VisaClickToPayLocators.continue_btn)
        self._actions.click(VisaClickToPayLocators.continue_btn)

    def confirm_payment(self):
        self._waits.wait_for_element_to_be_clickable(VisaClickToPayLocators.pay_now_btn)
        self._actions.click(VisaClickToPayLocators.pay_now_btn)

    def fill_cvv_field_on_visa_popup(self):
        if self._waits.wait_and_check_is_element_displayed(VisaClickToPayLocators.cvv_input_on_visa_popup):
            self._actions.send_keys(VisaClickToPayLocators.cvv_input_on_visa_popup, '123')
            self._actions.click(VisaClickToPayLocators.pay_now_btn)

    def click_pay_now_btn(self):
        self._actions.switch_to_iframe(VisaClickToPayLocators.vctp_iframe)
        self._actions.click(VisaClickToPayLocators.pay_now_btn)

    def click_remember_me_checkbox(self, iframe):
        if iframe:
            self._actions.switch_to_iframe(VisaClickToPayLocators.vctp_iframe)
        self._actions.click(VisaClickToPayLocators.remember_me_checkbox)

    def click_cancel_checkout_btn(self):
        self._actions.switch_to_iframe(VisaClickToPayLocators.vctp_iframe)
        self._actions.click(VisaClickToPayLocators.cancel_checkout_btn)

    def click_card_menu_btn(self):
        self._actions.switch_to_iframe(VisaClickToPayLocators.vctp_iframe)
        self._actions.click(VisaClickToPayLocators.card_menu_btn)

    def click_add_card_btn(self):
        self._actions.click(VisaClickToPayLocators.add_card_btn)

    def click_edit_card_details(self):
        self._actions.click(VisaClickToPayLocators.edit_card_btn)

    def click_switch_card_details(self):
        self._actions.click(VisaClickToPayLocators.switch_card_btn)

    def click_address_menu_btn(self):
        self._actions.click(VisaClickToPayLocators.address_menu_btn)

    def click_add_address_btn(self):
        self._actions.click(VisaClickToPayLocators.add_address_btn)

    def click_add_new_address_plus_btn(self):
        self._actions.click(VisaClickToPayLocators.add_new_address_plus_btn)

    def is_register_checkbox_available(self):
        return self._waits.wait_and_check_is_element_displayed(VisaClickToPayLocators.register_card_checkbox)

    def is_card_validation_message_visible(self, expected_text):
        assert self._waits.wait_and_check_is_element_displayed(VisaClickToPayLocators.card_validation_message)
        actual_text = self._actions.get_text(VisaClickToPayLocators.card_validation_message)
        assertion_message = f'Card validation text is not correct: ' \
                            f' should be {expected_text} but is {actual_text}'
        add_to_shared_dict(SharedDictKey.ASSERTION_MESSAGE.value, assertion_message)
        assert actual_text == expected_text, assertion_message

    def get_logs(self, expected_name, max_try=5):
        self._waits.wait_for_element_to_be_displayed(PaymentMethodsLocators.logs_textarea)
        logs = ''
        while max_try:
            logs = self._actions.get_value(PaymentMethodsLocators.logs_textarea)
            if expected_name in logs:
                break
            max_try -= 1
            time.sleep(1)
        result = re.findall(f'"{expected_name}": "(.*)"', logs)
        return result

    def check_if_value_is_present_in_logs(self, expected_name, expected_value):
        logs = self.get_logs(expected_name)
        assertion_message = f'{expected_value} step is not present in {expected_name} logs'
        if 'should not be none' in expected_value:
            assert_that(logs, f'Missing value for {expected_name}').is_not_empty()
        else:
            assert expected_value in logs, assertion_message

    def click_first_masked_address_on_the_list(self):
        self._actions.click(VisaClickToPayLocators.masked_address_on_visa_popup)

    def click_add_new_card_on_vctp_popup(self):
        self._actions.click(VisaClickToPayLocators.add_new_card_btn)

    def confirm_user_address(self):
        self._waits.wait_for_element_visibility(VisaClickToPayLocators.continue_btn)
        self._waits.wait_for_element_to_be_clickable(VisaClickToPayLocators.continue_btn)
        self._actions.click(VisaClickToPayLocators.continue_btn)

    def clik_remove_card(self):
        self._actions.click(VisaClickToPayLocators.delete_card_upon_editing_btn)
        self._actions.click(VisaClickToPayLocators.confirm_card_delete_upon_editing_btn)

    def click_cancel_card_editing_on_popup(self):
        self._actions.click(VisaClickToPayLocators.cancel_card_editing_btn)

    def click_switch_address_btn(self):
        self._actions.click(VisaClickToPayLocators.switch_address_btn)

    def click_remove_address(self):
        self._actions.click(VisaClickToPayLocators.delete_address_btn)
        self._actions.click(VisaClickToPayLocators.confirm_card_delete_upon_editing_btn)
        assert self._waits.wait_and_check_is_element_displayed(VisaClickToPayLocators.address_success_delete_message)

    def edit_expiration_date_and_cvv_on_popup(self, expiration_date, security_code):
        self._waits.wait_for_element_to_be_displayed(VisaClickToPayLocators.edit_expiration_date_input)
        self._waits.wait_for_element_to_be_displayed(VisaClickToPayLocators.edit_security_code_input)
        for i in range(5):
            self._actions.delete_on_input(VisaClickToPayLocators.edit_expiration_date_input)
        self._actions.delete_on_input(VisaClickToPayLocators.edit_security_code_input)
        self._actions.send_keys(VisaClickToPayLocators.edit_expiration_date_input, expiration_date)
        self._actions.send_keys(VisaClickToPayLocators.edit_security_code_input, security_code)
        self._actions.click(VisaClickToPayLocators.add_new_card_btn)
        assert self._waits.wait_and_check_is_element_displayed(VisaClickToPayLocators.card_update_success_message)

    def switch_address_from_list(self, iframe):
        if iframe:
            self._actions.switch_to_iframe(VisaClickToPayLocators.vctp_iframe)
        self._waits.wait_for_element_to_be_displayed(VisaClickToPayLocators.available_addresses_container)
        available_addresses = self._actions.find_elements(VisaClickToPayLocators.available_addresses_container)
        chosen_address = random.randrange(1, len(available_addresses))
        self._actions.scroll_directly_to_element(VisaClickToPayLocators.get_available_address_from_list(chosen_address))
        self._actions.click_by_javascript(VisaClickToPayLocators.get_available_address_from_list(chosen_address))
