from pages.base_page import BasePage
from pages.locators.payment_methods_locators import PaymentMethodsLocators


class ApmModulePaymentPage(BasePage):

    def click_specific_apm_button(self, override_placement, apm_type):
        if not override_placement:
            self._waits.wait_for_element_to_be_displayed(PaymentMethodsLocators.get_apm_button_locator(apm_type))
            self._actions.click(PaymentMethodsLocators.get_apm_button_locator(apm_type))
        else:
            self._waits.wait_for_element_to_be_displayed(PaymentMethodsLocators.get_apm_button_override_locator(apm_type))
            self._actions.click(PaymentMethodsLocators.get_apm_button_override_locator(apm_type))

    def scroll_to_apm_list(self):
        self._actions.scroll_directly_to_element(PaymentMethodsLocators.apm_group)

    def select_simulator_page_response_by_text(self, text):
        self._actions.select_element_by_text(PaymentMethodsLocators.apm_simulator_drop_down, text)

    def submit_simulator_page_response(self):
        self._actions.click(PaymentMethodsLocators.apm_simulator_submit)

    def wait_for_simulator_page_submit_btn_active(self):
        self._waits.wait_for_element_to_be_clickable(PaymentMethodsLocators.apm_simulator_submit)

    def wait_for_specific_apm_payment_method_invisibility(self, apm_type):
        return self._waits.wait_for_element_invisibility(PaymentMethodsLocators.get_apm_button_locator(apm_type))

    def wait_for_specific_apm_payment_method_visibility(self, apm_type):
        return self._waits.wait_for_element_visibility(PaymentMethodsLocators.get_apm_button_locator(apm_type))

    # sofort simulator page
    def click_accept_cookies_btn_on_sofort_page(self):
        self._actions.click_by_javascript(PaymentMethodsLocators.sofort_accept_cookies_btn)

    def select_bank_on_sofort_page_by_text(self, text):
        self._actions.select_element_by_text(PaymentMethodsLocators.sofort_bank_drop_down, text)

    def click_next_btn_on_sofort_page(self):
        self._actions.click(PaymentMethodsLocators.sofort_next_btn)

    def fill_test_credentials_on_sofort_page(self, user_id, pin):
        self._actions.send_keys(PaymentMethodsLocators.sofort_user_id_input, user_id)
        self._actions.send_keys(PaymentMethodsLocators.sofort_pin_input, pin)

    def fill_confirmation_code_on_sofort_page(self, code):
        self._actions.send_keys(PaymentMethodsLocators.sofort_confirmation_code_input, code)

    def click_cancel_btn_on_sofort_page(self):
        self._actions.click_by_javascript(PaymentMethodsLocators.sofort_cancel_btn)

    def click_cancel_transaction_btn_on_sofort_page(self):
        self._actions.click_by_javascript(PaymentMethodsLocators.sofort_cancel_transaction_btn)
