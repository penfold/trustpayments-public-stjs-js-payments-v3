from configuration import CONFIGURATION
from pages.base_page import BasePage
from pages.locators.payment_methods_locators import PaymentMethodsLocators
from utils.enums.payment_type import PaymentType
from utils.enums.shared_dict_keys import SharedDictKey
from utils.helpers.request_executor import add_to_shared_dict, get_number_of_requests_with_data, \
    get_number_of_wallet_verify_requests, get_number_of_thirdparty_requests, get_number_of_requests_without_data, \
    get_number_of_requests_with_fraudcontroltransactionid_flag, \
    get_number_of_requests_with_data_and_fraudcontroltransactionid_flag, get_number_of_requests_with_updated_jwt, \
    get_number_of_requests_with_updated_jwt_for_visa, get_number_of_tokenisation_requests


class PaymentMethodsPageMock(BasePage):
    # pylint: disable=too-many-public-methods

    def choose_payment_methods(self, payment_type):
        if payment_type == PaymentType.VISA_CHECKOUT.name:
            self.select_visa_checkout_payment()
        elif payment_type == PaymentType.APPLE_PAY.name:
            self.select_apple_pay_payment()
        elif payment_type == PaymentType.CARDINAL_COMMERCE.name:
            self.select_cardinal_commerce_payment()
        elif payment_type == PaymentType.GOOGLE_PAY.name:
            self.select_google_pay_payment()

    def select_cardinal_commerce_payment(self):
        if 'Catalina' in CONFIGURATION.REMOTE_OS_VERSION or 'Google Nexus 6' in CONFIGURATION.REMOTE_DEVICE:
            self.scroll_to_bottom()
            self._waits.wait_for_javascript()
            self._actions.click_by_javascript(PaymentMethodsLocators.pay_button)
        else:
            self.scroll_to_bottom()
            self._waits.wait_for_element_to_be_clickable(PaymentMethodsLocators.pay_button)
            self._actions.click(PaymentMethodsLocators.pay_button)

    def select_apple_pay_payment(self):
        self._waits.wait_for_javascript()
        self.scroll_to_bottom()
        if 'Catalina' in CONFIGURATION.REMOTE_OS_VERSION:
            self._actions.click_by_javascript(PaymentMethodsLocators.apple_pay_mock_button)
        else:
            self._actions.click(PaymentMethodsLocators.apple_pay_mock_button)

    def select_visa_checkout_payment(self):
        self._waits.wait_for_javascript()
        self.scroll_to_bottom()
        self._waits.wait_for_element_to_be_displayed(PaymentMethodsLocators.visa_checkout_mock_button)
        if 'Catalina' in CONFIGURATION.REMOTE_OS_VERSION:
            self._actions.click_by_javascript(PaymentMethodsLocators.visa_checkout_mock_button)
        else:
            self._actions.click(PaymentMethodsLocators.visa_checkout_mock_button)

    def select_google_pay_payment(self):
        self._waits.wait_for_javascript()
        self.scroll_to_bottom()
        self._waits.wait_for_element_to_be_displayed(PaymentMethodsLocators.google_pay_mock_button)
        if 'Catalina' in CONFIGURATION.REMOTE_OS_VERSION:
            self._actions.click_by_javascript(PaymentMethodsLocators.google_pay_mock_button)
        else:
            self._actions.click(PaymentMethodsLocators.google_pay_mock_button)


    def validate_number_of_requests_with_data(self, request_type, pan, expiry_date, cvv, expected_number_of_requests):
        actual_number_of_requests = get_number_of_requests_with_data(request_type, pan, expiry_date, cvv)
        assertion_message = f'Number of {request_type} request(s) is not correct, ' \
                            f'should be: "{expected_number_of_requests}" but is: "{actual_number_of_requests}"'
        add_to_shared_dict(SharedDictKey.ASSERTION_MESSAGE.value, assertion_message)
        assert expected_number_of_requests == actual_number_of_requests, assertion_message

    def validate_number_of_requests_without_data(self, request_type, expected_number_of_requests):
        actual_number_of_requests = get_number_of_requests_without_data(request_type)
        assertion_message = f'Number of {request_type} request(s) is not correct, ' \
                            f'should be: "{expected_number_of_requests}" but is: "{actual_number_of_requests}"'
        add_to_shared_dict(SharedDictKey.ASSERTION_MESSAGE.value, assertion_message)
        assert expected_number_of_requests == actual_number_of_requests, assertion_message

    def validate_number_of_tokenisation_requests(self, request_type, cvv, expected_number_of_requests):
        actual_number_of_requests = get_number_of_tokenisation_requests(request_type, cvv)
        assertion_message = f'Number of {request_type} requests is not correct, ' \
                            f'should be: "{expected_number_of_requests}" but is: "{actual_number_of_requests}"'
        add_to_shared_dict(SharedDictKey.ASSERTION_MESSAGE.value, assertion_message)
        assert expected_number_of_requests == actual_number_of_requests, assertion_message

    def validate_number_of_wallet_verify_requests(self, url, expected_number_of_requests):
        actual_number_of_requests = get_number_of_wallet_verify_requests(url)
        assertion_message = f'Number of {url} requests is not correct, ' \
                            f'should be: "{expected_number_of_requests}" but is: "{actual_number_of_requests}"'
        add_to_shared_dict(SharedDictKey.ASSERTION_MESSAGE.value, assertion_message)
        assert expected_number_of_requests == actual_number_of_requests, assertion_message

    def validate_number_of_thirdparty_requests(self, request_type, walletsource, expected_number_of_requests):
        actual_number_of_requests = get_number_of_thirdparty_requests(request_type, walletsource)
        assertion_message = f'Number of request with {request_type} is not correct, ' \
                            f'should be: "{expected_number_of_requests}" but is: "{actual_number_of_requests}"'
        add_to_shared_dict(SharedDictKey.ASSERTION_MESSAGE.value, assertion_message)
        assert expected_number_of_requests == actual_number_of_requests, assertion_message

    def validate_number_of_requests_with_data_and_fraudcontroltransactionid_flag(self, request_type, pan, expiry_date,
                                                                                 cvv, expected_number_of_requests):
        actual_number_of_requests = get_number_of_requests_with_data_and_fraudcontroltransactionid_flag(request_type,
                                                                                                        pan,
                                                                                                        expiry_date,
                                                                                                        cvv)
        assertion_message = f'Number of {request_type} requests or request data are not correct, ' \
                            f'should be: "{expected_number_of_requests}" but is: "{actual_number_of_requests}"'
        add_to_shared_dict(SharedDictKey.ASSERTION_MESSAGE.value, assertion_message)
        assert expected_number_of_requests == actual_number_of_requests, assertion_message

    def validate_number_of_requests_with_fraudcontroltransactionid_flag(self, request_type,
                                                                        expected_number_of_requests):
        actual_number_of_requests = get_number_of_requests_with_fraudcontroltransactionid_flag(request_type)
        assertion_message = f'Number of {request_type} requests or request data are not correct, ' \
                            f'should be: "{expected_number_of_requests}" but is: "{actual_number_of_requests}"'
        add_to_shared_dict(SharedDictKey.ASSERTION_MESSAGE.value, assertion_message)
        assert expected_number_of_requests == actual_number_of_requests, assertion_message

    def validate_updated_jwt_in_request(self, request_type, url, update_jwt, expected_number_of_requests):
        actual_number_of_requests = get_number_of_requests_with_updated_jwt(request_type, url, update_jwt)
        assertion_message = f'Number of {request_type} with updated jwt is not correct, ' \
                            f'should be: "{expected_number_of_requests}" but is: "{actual_number_of_requests}"'
        add_to_shared_dict(SharedDictKey.ASSERTION_MESSAGE.value, assertion_message)
        assert expected_number_of_requests == actual_number_of_requests, assertion_message

    def validate_updated_jwt_in_request_for_visa(self, payment_type, update_jwt, expected_number_of_requests):
        actual_number_of_requests = get_number_of_requests_with_updated_jwt_for_visa(payment_type, update_jwt)
        assertion_message = f'Number of {payment_type} with updated jwt is not correct, ' \
                            f'should be: "{expected_number_of_requests}" but is: "{actual_number_of_requests}"'
        add_to_shared_dict(SharedDictKey.ASSERTION_MESSAGE.value, assertion_message)
        assert expected_number_of_requests == actual_number_of_requests, assertion_message
