from pages.base_page import BasePage
from pages.locators.apm_module_locators import ApmModulePaymentLocators
from utils.helpers.request_executor import retrieve_sms_code


class ApmModulePaymentPage(BasePage):
    # pylint: disable=too-many-public-methods

    def click_specific_apm_button(self, override_placement, apm_type):
        if not override_placement:
            self._waits.wait_for_element_to_be_displayed(ApmModulePaymentLocators.get_apm_button_locator(apm_type))
            self._actions.click(ApmModulePaymentLocators.get_apm_button_locator(apm_type))
        else:
            self._waits.wait_for_element_to_be_displayed(ApmModulePaymentLocators.get_apm_button_override_locator(apm_type))
            self._actions.click(ApmModulePaymentLocators.get_apm_button_override_locator(apm_type))

    def scroll_to_apm_list(self):
        self._actions.scroll_directly_to_element(ApmModulePaymentLocators.apm_group)

    def select_simulator_page_response_by_text(self, text):
        self._actions.select_element_by_text(ApmModulePaymentLocators.apm_simulator_drop_down, text)

    def submit_simulator_page_response(self):
        self._actions.click(ApmModulePaymentLocators.apm_simulator_submit)

    def wait_for_simulator_page_submit_btn_active(self):
        self._waits.wait_for_element_to_be_clickable(ApmModulePaymentLocators.apm_simulator_submit)

    def wait_for_specific_apm_payment_method_invisibility(self, apm_type):
        return self._waits.wait_for_element_invisibility(ApmModulePaymentLocators.get_apm_button_locator(apm_type))

    def wait_for_specific_apm_payment_method_visibility(self, apm_type):
        return self._waits.wait_for_element_visibility(ApmModulePaymentLocators.get_apm_button_locator(apm_type))

    # sofort simulator page
    def click_accept_cookies_btn_on_sofort_page(self):
        self._actions.click_by_javascript(ApmModulePaymentLocators.sofort_accept_cookies_btn)

    def select_bank_on_sofort_page_by_text(self, text):
        self._actions.select_element_by_text(ApmModulePaymentLocators.sofort_bank_drop_down, text)

    def click_next_btn_on_sofort_page(self):
        self._actions.click(ApmModulePaymentLocators.sofort_next_btn)

    def fill_test_credentials_on_sofort_page(self, user_id, pin):
        self._actions.send_keys(ApmModulePaymentLocators.sofort_user_id_input, user_id)
        self._actions.send_keys(ApmModulePaymentLocators.sofort_pin_input, pin)

    def fill_confirmation_code_on_sofort_page(self, code):
        self._actions.send_keys(ApmModulePaymentLocators.sofort_confirmation_code_input, code)

    def click_cancel_btn_on_sofort_page(self):
        self._actions.click_by_javascript(ApmModulePaymentLocators.sofort_cancel_btn)

    def click_cancel_transaction_btn_on_sofort_page(self):
        self._actions.click_by_javascript(ApmModulePaymentLocators.sofort_cancel_transaction_btn)

    def click_cancel_btn_on_zip_sandbox_page(self):
        self._actions.click(ApmModulePaymentLocators.zip_cancel_btn)

    # A2A
    def select_uk_from_country_dropdown(self):
        self._waits.wait_for_element_to_be_displayed(ApmModulePaymentLocators.a2a_country_dropdown)
        self._actions.click(ApmModulePaymentLocators.a2a_country_dropdown)
        self._actions.click(ApmModulePaymentLocators.a2a_uk_option_from_country_dropdown)

    def select_ozone_modelo_bank_from__dropdown(self):
        self._actions.click(ApmModulePaymentLocators.bank_selector_input)
        self._actions.click(ApmModulePaymentLocators.ozone_modelo_bank_option)

    def scroll_to_token_terms_link(self):
        self._waits.wait_for_element_to_be_displayed(ApmModulePaymentLocators.token_terms_link)
        self._actions.scroll_directly_to_element(ApmModulePaymentLocators.token_terms_link)

    def click_accept_button(self):
        self._waits.wait_for_element_to_be_clickable(ApmModulePaymentLocators.accept_btn)
        self._actions.click(ApmModulePaymentLocators.accept_btn)

    def fill_login_input(self, login):
        self._waits.wait_for_element_to_be_displayed(ApmModulePaymentLocators.login_input)
        self._actions.send_keys(ApmModulePaymentLocators.login_input, login)

    def fill_password_input(self, login):
        self._waits.wait_for_element_to_be_displayed(ApmModulePaymentLocators.password_input)
        self._actions.send_keys(ApmModulePaymentLocators.password_input, login)

    def click_login_button(self):
        self._actions.click(ApmModulePaymentLocators.login_btn)

    def click_confirm_button(self):
        self._waits.wait_for_element_to_be_displayed(ApmModulePaymentLocators.confirm_btn)
        self._actions.click(ApmModulePaymentLocators.confirm_btn)

    def click_cancel_button(self):
        self._waits.wait_for_element_to_be_displayed(ApmModulePaymentLocators.confirm_btn)
        self._actions.click(ApmModulePaymentLocators.cancel_btn)

    def fill_phone_number(self, number):
        self._waits.wait_for_element_to_be_displayed(ApmModulePaymentLocators.zip_phone_number_field)
        self._waits.wait_for_element_to_be_displayed(ApmModulePaymentLocators.zip_next_button)
        self._actions.send_keys(ApmModulePaymentLocators.zip_phone_number_field, number)
        self._waits.wait_for_element_to_be_clickable(ApmModulePaymentLocators.zip_next_button)
        self._actions.click(ApmModulePaymentLocators.zip_next_button)

    def fill_sms_code(self):
        self._waits.wait_for_element_to_be_displayed(ApmModulePaymentLocators.zip_phone_code_input_1)
        code = retrieve_sms_code()
        self._actions.send_keys(ApmModulePaymentLocators.zip_phone_code_input_1, code[0])
        self._actions.send_keys(ApmModulePaymentLocators.zip_phone_code_input_2, code[1])
        self._actions.send_keys(ApmModulePaymentLocators.zip_phone_code_input_3, code[2])
        self._actions.send_keys(ApmModulePaymentLocators.zip_phone_code_input_4, code[3])
        self._actions.send_keys(ApmModulePaymentLocators.zip_phone_code_input_5, code[4])
        self._actions.send_keys(ApmModulePaymentLocators.zip_phone_code_input_6, code[5])

    def accept_terms_and_confirm_payment(self):
        self._waits.wait_for_element_to_be_displayed(ApmModulePaymentLocators.zip_order_summary_header)
        # self._waits.wait_for_element_to_be_displayed(ApmModulePaymentLocators.zip_terms_div)
        # self._actions.click(ApmModulePaymentLocators.zip_terms_div)
        self._waits.wait_for_element_to_be_clickable(ApmModulePaymentLocators.zip_confirm_payment_button)
        self._actions.click(ApmModulePaymentLocators.zip_confirm_payment_button)
