from pages.base_page import BasePage
from pages.locators.tokenized_payments_locators import TokenizedPaymentsLocators
from utils.enums.field_type import FieldType


class TokenizedJwtModulePaymentPage(BasePage):
    # pylint: disable=too-many-public-methods

    def wait_for_security_code_iframe(self):
        return self._waits.wait_until_iframe_is_presented_and_check_is_possible_switch_to_it(
            TokenizedPaymentsLocators.security_code_iframe)

    def wait_for_form_to_be_loaded(self):
        self._waits.wait_for_element_to_be_displayed(TokenizedPaymentsLocators.tokenized_payment_form)
        self._waits.wait_for_element_to_be_displayed(TokenizedPaymentsLocators.pay_btn)
        if self.wait_for_security_code_iframe():
            self._waits.wait_for_element_to_be_displayed(TokenizedPaymentsLocators.security_code_input)
        self._actions.switch_to_default_iframe()

    def fill_cvv_input(self, value):
        self._actions.switch_to_iframe_and_send_keys(TokenizedPaymentsLocators.security_code_iframe,
                                                     TokenizedPaymentsLocators.security_code_input, value)

    def click_pay_button(self):
        self._actions.click(TokenizedPaymentsLocators.pay_btn)

    def clear_security_code_input(self):
        self._actions.switch_to_iframe_and_clear_input(FieldType.TOKENIZED_SECURITY_CODE.value,
                                                       TokenizedPaymentsLocators.security_code_input)
