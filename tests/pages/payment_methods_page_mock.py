import time

from pages.base_page import BasePage
from utils.enums.shared_dict_keys import SharedDictKey
from utils.helpers.request_executor import add_to_shared_dict, get_number_of_requests_with_data, \
    get_number_of_wallet_verify_requests, get_number_of_thirdparty_requests, get_number_of_requests_without_data, \
    get_number_of_requests_with_fraudcontroltransactionid_flag, \
    get_number_of_requests_with_data_and_fraudcontroltransactionid_flag, get_number_of_requests_with_updated_jwt, \
    get_number_of_requests_with_updated_jwt_for_visa, get_number_of_tokenisation_requests


class PaymentMethodsPageMock(BasePage):
    # pylint: disable=too-many-public-methods

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
