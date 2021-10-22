from pages.base_page import BasePage
from pages.locators.payment_methods_locators import PaymentMethodsLocators


class ApmModulePaymentPage(BasePage):

    def select_zip_payment_method(self):
        self._waits.wait_for_element_to_be_clickable(PaymentMethodsLocators.zip_button)
        self._actions.click(PaymentMethodsLocators.zip_button)

    def click_payu_payment_method(self, override_placement):
        if not override_placement:
            self._waits.wait_for_element_to_be_displayed(PaymentMethodsLocators.payu_button)
            self._actions.click(PaymentMethodsLocators.payu_button)
        else:
            self._waits.wait_for_element_to_be_displayed(PaymentMethodsLocators.payu_button_placement_override)
            self._actions.click(PaymentMethodsLocators.payu_button_placement_override)

    def click_mybank_payment_method(self, override_placement):
        if not override_placement:
            self._waits.wait_for_element_to_be_displayed(PaymentMethodsLocators.mybank_button)
            self._actions.click(PaymentMethodsLocators.mybank_button)
        else:
            self._waits.wait_for_element_to_be_displayed(PaymentMethodsLocators.mybank_button_placement_override)
            self._actions.click(PaymentMethodsLocators.mybank_button_placement_override)

    def scroll_to_apms(self):
        self._actions.scroll_directly_to_element(PaymentMethodsLocators.apm_group)

    def select_simulator_page_response_by_text(self, text):
        self._actions.select_element_by_text(PaymentMethodsLocators.apm_simulator_drop_down, text)

    def submit_simulator_page_response(self):
        self._actions.click(PaymentMethodsLocators.apm_simulator_submit)

    def wait_for_simulator_page_submit_btn_active(self):
        self._waits.wait_for_element_to_be_clickable(PaymentMethodsLocators.apm_simulator_submit)

    def wait_for_payu_payment_method_invisibility(self):
        return self._waits.wait_for_element_invisibility(PaymentMethodsLocators.payu_button)

    def wait_for_payu_payment_method_visibility(self):
        return self._waits.wait_for_element_visibility(PaymentMethodsLocators.payu_button)

    def wait_for_mybank_payment_method_invisibility(self):
        return self._waits.wait_for_element_invisibility(PaymentMethodsLocators.mybank_button)

    def wait_for_mybank_payment_method_visibility(self):
        return self._waits.wait_for_element_visibility(PaymentMethodsLocators.mybank_button)
