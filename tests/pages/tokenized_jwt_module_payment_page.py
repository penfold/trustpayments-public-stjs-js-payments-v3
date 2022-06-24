from pages.base_page import BasePage
from pages.locators.tokenized_payments_locators import TokenizedPaymentsLocators
from utils.enums.field_type import FieldType
from utils.enums.shared_dict_keys import SharedDictKey
from utils.helpers.request_executor import add_to_shared_dict


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

    def validate_security_code_css_style(self, property_name, expected_style):
        self._actions.switch_to_iframe(TokenizedPaymentsLocators.security_code_iframe)
        element = self._actions.find_element(TokenizedPaymentsLocators.security_code_input)
        actual_css_style = element.value_of_css_property(property_name)
        self._actions.switch_to_default_iframe()
        assertion_message = 'Tokenized security code style is not correct, ' \
                            f'should be "{expected_style}" but is "{actual_css_style}"'
        add_to_shared_dict(SharedDictKey.ASSERTION_MESSAGE.value, assertion_message)
        assert expected_style in actual_css_style, assertion_message

    def validate_security_code_placeholder(self, expected_placeholder):
        actual_placeholder = self.get_security_code_attribute('placeholder')
        assertion_message = 'Placeholder for Tokenized security code field is not correct, ' \
                            f'should be "{expected_placeholder}" but is "{actual_placeholder}"'
        add_to_shared_dict(SharedDictKey.ASSERTION_MESSAGE.value, assertion_message)
        assert expected_placeholder in actual_placeholder, assertion_message

    def validate_security_code_is_highlighted(self):
        attribute_value = self.get_security_code_attribute('class')
        assertion_message = 'Tokenized security code is not highlighted but should be'
        add_to_shared_dict(SharedDictKey.ASSERTION_MESSAGE.value, assertion_message)
        assert 'error' in attribute_value, assertion_message

    def get_security_code_attribute(self, attribute):
        attribute_value = self._actions.switch_to_iframe_and_get_element_attribute(
            TokenizedPaymentsLocators.security_code_iframe,
            TokenizedPaymentsLocators.security_code_input,
            attribute)
        return attribute_value
