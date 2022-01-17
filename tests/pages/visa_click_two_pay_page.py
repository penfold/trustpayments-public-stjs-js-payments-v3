import time
from pages.base_page import BasePage
from pages.locators.visa_click_two_pay_locators import VisaClickTwoPayLocators
from utils.helpers import gmail_service


class VisaClickTwoPay(BasePage):

    def dismiss_alert(self):
        self._browser_executor.dismiss_alert()

    def accept_alert(self):
        self._browser_executor.accept_alert()

    def click_visa_click_two_pay_button(self, context):
        if 'switch_to_parent_iframe' in context.scenario.tags:
            self._actions.switch_to_default_iframe()
        self._waits.wait_for_element_to_be_clickable(VisaClickTwoPayLocators.visa_click_two_pay_button)
        self._actions.click(VisaClickTwoPayLocators.visa_click_two_pay_button)

    def fill_required_address_fields(self, first_name, last_name, address_line1, city, state, postal_code, phone_number,
                                     email):
        self._actions.switch_to_iframe(
            VisaClickTwoPayLocators.visa_click_two_pay_iframe)
        self._waits.wait_for_element_visibility(VisaClickTwoPayLocators.visa_click_two_pay_name_field)
        self._actions.send_keys(VisaClickTwoPayLocators.visa_click_two_pay_name_field, first_name)
        self._actions.send_keys(VisaClickTwoPayLocators.visa_click_two_pay_surname, last_name)
        self._actions.send_keys(VisaClickTwoPayLocators.visa_click_two_pay_address_line_1, address_line1)
        self._actions.send_keys(VisaClickTwoPayLocators.visa_click_two_pay_city_address, city)
        self._actions.send_keys(VisaClickTwoPayLocators.visa_click_two_pay_state_field, state)
        self._actions.send_keys(VisaClickTwoPayLocators.visa_click_two_pay_postal_code, postal_code)
        self._actions.send_keys(VisaClickTwoPayLocators.visa_click_two_pay_phone_number_field, phone_number)
        self._waits.wait_for_element_visibility(VisaClickTwoPayLocators.visa_click_two_pay_email_field)
        self._actions.send_keys(VisaClickTwoPayLocators.visa_click_two_pay_email_field, email)
        self._actions.scroll_directly_to_element(VisaClickTwoPayLocators.visa_click_two_pay_email_field)
        self._waits.wait_for_element_to_be_clickable(VisaClickTwoPayLocators.visa_click_two_pay_continue_btn)
        self._actions.click(VisaClickTwoPayLocators.visa_click_two_pay_continue_btn)

    def confirm_user_address(self):
        # self._actions.switch_to_iframe(
        #     VisaClickTwoPayLocators.visa_click_two_pay_iframe)
        self._waits.wait_for_element_visibility(VisaClickTwoPayLocators.visa_click_two_pay_continue_btn)
        self._waits.wait_for_element_to_be_clickable(VisaClickTwoPayLocators.visa_click_two_pay_continue_btn)
        self._actions.click(VisaClickTwoPayLocators.visa_click_two_pay_continue_btn)

    def confirm_payment(self):
        # self._actions.switch_to_iframe(
        #     VisaClickTwoPayLocators.visa_click_two_pay_iframe)
        self._waits.wait_for_element_visibility(VisaClickTwoPayLocators.visa_click_two_pay_phone_finish_setup_header)
        self._waits.wait_for_element_to_be_clickable(VisaClickTwoPayLocators.visa_click_two_pay_continue_btn)
        self._actions.click_by_javascript(VisaClickTwoPayLocators.visa_click_two_pay_continue_btn)
        self._actions.switch_to_default_iframe()
        time.sleep(5)


    def get_one_time_password(self):
        mail_ids = gmail_service.get_unseen_mail_ids_with_wait(5)
        mail_index = len(mail_ids)
        code = gmail_service.get_verification_code_from_email_subject(str(int(mail_ids[mail_index - 1])))
        return code
