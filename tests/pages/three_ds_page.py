import json
from urllib.parse import urlparse, parse_qs

from assertpy import assert_that

from configuration import CONFIGURATION
from pages.base_page import BasePage
from pages.locators.payment_methods_locators import PaymentMethodsLocators
from pages.locators.three_ds_locators import ThreeDSMethodsLocators
from utils.configurations import jwt_generator
from utils.enums.auth_data import AuthData
from utils.enums.auth_type import AuthType
from utils.enums.field_type import FieldType
from utils.enums.payment_type import PaymentType
from utils.helpers.request_executor import add_to_shared_dict


class ThreeDSPage(BasePage):

    def validate_3ds_challenge_modal_appears(self):
        self._actions.switch_to_iframe(ThreeDSMethodsLocators.three_ds_iframe)
        if self._waits.wait_and_check_is_element_displayed(ThreeDSMethodsLocators.three_ds_challenge_input):
            if self._waits.wait_and_check_is_element_displayed(ThreeDSMethodsLocators.three_ds_challenge_submit_button):
                self._actions.switch_to_default_iframe()
                return True
        return False

    def fill_3ds_challenge_modal(self, data):
        self._actions.switch_to_iframe(ThreeDSMethodsLocators.three_ds_iframe)
        self._actions.send_keys(ThreeDSMethodsLocators.three_ds_challenge_input, data)
        self._actions.click(ThreeDSMethodsLocators.three_ds_challenge_submit_button)
        self._actions.switch_to_default_iframe()

    def cancel_3ds_authentication(self):
        try:
            self._actions.find_element(ThreeDSMethodsLocators.three_ds_challenge_popup_cancel_button)
        except:
            self._actions.click(ThreeDSMethodsLocators.three_ds_challenge_cancel_button)
        else:
            self._actions.click(ThreeDSMethodsLocators.three_ds_challenge_popup_cancel_button)
