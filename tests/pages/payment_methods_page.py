import json
import re
import time
from collections import defaultdict
from urllib.parse import urlparse, parse_qs

from assertpy import assert_that

from configuration import CONFIGURATION
from pages.base_page import BasePage
from pages.locators.payment_methods_locators import PaymentMethodsLocators
from pages.locators.tokenized_payments_locators import TokenizedPaymentsLocators
from utils.configurations import jwt_generator
from utils.configurations.jwt_generator import replace_jwt
from utils.enums.auth_data import AuthData
from utils.enums.auth_type import AuthType
from utils.enums.field_type import FieldType
from utils.enums.shared_dict_keys import SharedDictKey
from utils.helpers.request_executor import add_to_shared_dict
from utils.helpers.resources_reader import get_translation_from_json


def format_card_number(card_number):
    return ' '.join([card_number[i:i + 4] for i in range(0, len(card_number), 4)])


class PaymentMethodsPage(BasePage):
    # pylint: disable=too-many-public-methods

    def get_page_title(self):
        page_title = self._browser_executor.get_page_title()
        return page_title

    def get_page_url(self):
        page_url = self._browser_executor.get_page_url()
        return page_url

    def get_payment_status_message(self):
        return self._actions.get_text_with_wait(PaymentMethodsLocators.notification_frame)

    def get_color_of_notification_frame(self):
        return self._actions.get_element_attribute(PaymentMethodsLocators.notification_frame,
                                                   'data-notification-color')

    def get_logs(self):
        self._waits.wait_for_element_to_be_displayed(PaymentMethodsLocators.logs_textarea)
        logs = self._actions.get_value(PaymentMethodsLocators.logs_textarea)
        result = re.findall('"name": "(.*)",\n  "step": "(.*)"', logs)
        res = defaultdict(list)
        for key, value in result:
            res[key].append(value)
        return res

    def check_if_value_is_present_in_logs(self, expected_name, expected_step, max_try=5):
        logs = []
        while max_try:
            logs = self.get_logs()
            if expected_step in logs[expected_name]:
                break
            max_try -= 1
            time.sleep(1)
        assertion_message = f'{expected_step} step is not present in {expected_name} logs'
        add_to_shared_dict(SharedDictKey.ASSERTION_MESSAGE.value, assertion_message)
        assert expected_step in logs[expected_name], assertion_message

    def get_text_from_status_callback(self):
        return self._actions.get_text_with_wait(PaymentMethodsLocators.callback_data_popup)

    def get_text_from_submit_callback_jwt(self):
        return self._actions.get_text_with_wait(PaymentMethodsLocators.submit_callback_jwt_response)

    def get_text_from_submit_callback_threedresponse(self):
        return self._actions.get_text_from_last_element(PaymentMethodsLocators.submit_callback_threedresponse)

    def get_text_from_browser_info(self):
        return self._actions.get_text_with_wait(PaymentMethodsLocators.browser_info_callback)

    # Card Form

    def press_enter_button_on_security_code_field(self):
        self._actions.switch_to_iframe_and_press_enter(FieldType.SECURITY_CODE.value,
                                                       PaymentMethodsLocators.security_code_input_field)

    def clear_security_code_field(self):
        self._actions.switch_to_iframe_and_clear_input(FieldType.SECURITY_CODE.value,
                                                       PaymentMethodsLocators.security_code_input_field)

    def clear_card_number_field(self):
        self._actions.switch_to_iframe_and_clear_input(FieldType.CARD_NUMBER.value,
                                                       PaymentMethodsLocators.card_number_input_field)

    def clear_expiry_date_field(self):
        self._actions.switch_to_iframe_and_clear_input(FieldType.EXPIRATION_DATE.value,
                                                       PaymentMethodsLocators.expiration_date_input_field)

    def fill_credit_card_field(self, field_type, value):
        if field_type == FieldType.CARD_NUMBER.name:
            self._actions.switch_to_iframe_and_send_keys(PaymentMethodsLocators.card_number_iframe,
                                                         PaymentMethodsLocators.card_number_input_field, value)
        elif field_type == FieldType.EXPIRATION_DATE.name:
            self._actions.switch_to_iframe_and_send_keys(PaymentMethodsLocators.expiration_date_iframe,
                                                         PaymentMethodsLocators.expiration_date_input_field, value)
        elif field_type == FieldType.SECURITY_CODE.name:
            self._actions.switch_to_iframe_and_send_keys(PaymentMethodsLocators.security_code_iframe,
                                                         PaymentMethodsLocators.security_code_input_field, value)

    def fill_credit_card_field_ie_browser(self, field_type, value):
        if field_type == FieldType.CARD_NUMBER.name:
            self._actions.switch_to_iframe_and_send_keys_one_by_one(FieldType.CARD_NUMBER.value,
                                                                    PaymentMethodsLocators.card_number_input_field,
                                                                    value)
        elif field_type == FieldType.EXPIRATION_DATE.name:
            self._actions.switch_to_iframe_and_send_keys_one_by_one(FieldType.EXPIRATION_DATE.value,
                                                                    PaymentMethodsLocators.expiration_date_input_field,
                                                                    value)
        elif field_type == FieldType.SECURITY_CODE.name:
            self._actions.switch_to_iframe_and_send_keys_one_by_one(FieldType.SECURITY_CODE.value,
                                                                    PaymentMethodsLocators.security_code_input_field,
                                                                    value)

    def fill_payment_form(self, card_number, expiration_date, cvv):
        if 'IE' not in self._configuration.BROWSER:
            self.fill_credit_card_field(FieldType.CARD_NUMBER.name, card_number)
            self.fill_credit_card_field(FieldType.EXPIRATION_DATE.name, expiration_date)
            self.fill_credit_card_field(FieldType.SECURITY_CODE.name, cvv)
        else:
            self.fill_credit_card_field_ie_browser(FieldType.CARD_NUMBER.name, card_number)
            self.fill_credit_card_field_ie_browser(FieldType.EXPIRATION_DATE.name, expiration_date)
            self.fill_credit_card_field_ie_browser(FieldType.SECURITY_CODE.name, cvv)

    def fill_payment_form_without_cvv(self, card_number, expiration_date):
        if 'IE' not in self._configuration.BROWSER:
            self.fill_credit_card_field(FieldType.CARD_NUMBER.name, card_number)
            self.fill_credit_card_field(FieldType.EXPIRATION_DATE.name, expiration_date)
        else:
            self.fill_credit_card_field_ie_browser(FieldType.CARD_NUMBER.name, card_number)
            self.fill_credit_card_field_ie_browser(FieldType.EXPIRATION_DATE.name, expiration_date)

    def fill_payment_form_with_only_cvv(self, cvv):
        if 'IE' not in self._configuration.BROWSER:
            self.fill_credit_card_field(FieldType.SECURITY_CODE.name, cvv)
        else:
            self.fill_credit_card_field_ie_browser(FieldType.SECURITY_CODE.name, cvv)

    def click_submit_btn(self):
        self.scroll_to_bottom()
        self._waits.wait_for_element_to_be_clickable(PaymentMethodsLocators.pay_button)
        self._actions.click(PaymentMethodsLocators.pay_button)

    def get_value_of_input_field(self, field):
        return self.get_element_attribute(field, 'value')

    def is_field_enabled(self, field_type):
        is_enabled = False
        if field_type == FieldType.CARD_NUMBER.name:
            is_enabled = self._actions.switch_to_iframe_and_check_is_element_enabled(
                PaymentMethodsLocators.card_number_iframe,
                PaymentMethodsLocators.card_number_input_field)
        elif field_type == FieldType.EXPIRATION_DATE.name:
            is_enabled = self._actions.switch_to_iframe_and_check_is_element_enabled(
                PaymentMethodsLocators.expiration_date_iframe,
                PaymentMethodsLocators.expiration_date_input_field)
        elif field_type == FieldType.SECURITY_CODE.name:
            is_enabled = self._actions.switch_to_iframe_and_check_is_element_enabled(
                PaymentMethodsLocators.security_code_iframe,
                PaymentMethodsLocators.security_code_input_field)
        elif field_type == FieldType.SUBMIT_BUTTON.name:
            is_enabled = self._actions.is_element_enabled(PaymentMethodsLocators.pay_button)
        elif field_type == FieldType.ADDITIONAL_SUBMIT_BUTTON.name:
            is_enabled = self._actions.is_element_enabled(PaymentMethodsLocators.additional_button)
        elif field_type == FieldType.TOKENIZED_SECURITY_CODE.name:
            is_enabled = self._actions.switch_to_iframe_and_check_is_element_enabled(
                TokenizedPaymentsLocators.security_code_iframe,
                TokenizedPaymentsLocators.security_code_input)
        elif field_type == FieldType.TOKENIZED_SUBMIT_BUTTON.name:
            is_enabled = self._actions.is_element_enabled(TokenizedPaymentsLocators.pay_btn)

        return is_enabled

    def get_element_attribute(self, field_type, attribute):
        attribute_value = ''
        if field_type == FieldType.CARD_NUMBER.name:
            attribute_value = self._actions.switch_to_iframe_and_get_element_attribute(
                PaymentMethodsLocators.card_number_iframe,
                PaymentMethodsLocators.card_number_input_field,
                attribute)
        elif field_type == FieldType.EXPIRATION_DATE.name:
            attribute_value = self._actions.switch_to_iframe_and_get_element_attribute(
                PaymentMethodsLocators.expiration_date_iframe,
                PaymentMethodsLocators.expiration_date_input_field,
                attribute)
        elif field_type == FieldType.SECURITY_CODE.name:
            attribute_value = self._actions.switch_to_iframe_and_get_element_attribute(
                PaymentMethodsLocators.security_code_iframe,
                PaymentMethodsLocators.security_code_input_field,
                attribute)
        elif field_type == FieldType.EMAIL.name:
            attribute_value = self._actions.get_element_attribute(FieldType.EMAIL.value,
                                                                  PaymentMethodsLocators.merchant_email, attribute)
        elif field_type == FieldType.TOKENIZED_SECURITY_CODE.name:
            attribute_value = self._actions.switch_to_iframe_and_get_element_attribute(
                TokenizedPaymentsLocators.security_code_iframe,
                TokenizedPaymentsLocators.security_code_input,
                attribute)
        return attribute_value

    def get_field_css_style(self, field_type, property_name):
        background_color = ''
        if field_type == FieldType.CARD_NUMBER.name:
            background_color = self._actions.switch_to_iframe_and_get_css_value(
                PaymentMethodsLocators.card_number_iframe,
                PaymentMethodsLocators.card_number_input_field,
                property_name)
        elif field_type == FieldType.EXPIRATION_DATE.name:
            background_color = self._actions.switch_to_iframe_and_get_css_value(
                PaymentMethodsLocators.expiration_date_iframe,
                PaymentMethodsLocators.expiration_date_input_field,
                property_name)
        elif field_type == FieldType.SECURITY_CODE.name:
            background_color = self._actions.switch_to_iframe_and_get_css_value(
                PaymentMethodsLocators.security_code_iframe,
                PaymentMethodsLocators.security_code_input_field,
                property_name)
        elif field_type == FieldType.NOTIFICATION_FRAME.name:
            background_color = self._actions.get_css_value_with_wait(PaymentMethodsLocators.notification_frame,
                                                                     property_name)
        return background_color

    def is_field_displayed(self, field_type):
        is_displayed = False
        if field_type == FieldType.CARD_ICON.name:
            self._actions.switch_to_iframe(FieldType.CARD_NUMBER.value)
            if len(self._actions.find_elements(PaymentMethodsLocators.card_icon_in_input_field)) > 0:
                is_displayed = True
        elif field_type == FieldType.NOTIFICATION_FRAME.name:
            if len(self._actions.find_elements(PaymentMethodsLocators.notification_frame)) > 0:
                if self._actions.get_text_with_wait(PaymentMethodsLocators.notification_frame):
                    is_displayed = True
        else:
            is_displayed = self._actions.is_iframe_available_in_page_source(FieldType[field_type].value)
        return is_displayed

    def get_card_type_icon_from_input_field(self):
        credit_card_icon = self._actions.switch_to_iframe_and_get_element_attribute(
            PaymentMethodsLocators.card_number_iframe,
            PaymentMethodsLocators.card_icon_in_input_field,
            'alt')
        credit_card_icon = credit_card_icon.upper()
        return credit_card_icon

    def get_element_text(self, locator):
        return self._actions.get_text(locator)

    def get_card_number_iframe_element_text(self, locator):
        return self._actions.switch_to_iframe_and_get_text(PaymentMethodsLocators.card_number_iframe, locator)

    def get_expiration_date_iframe_element_text(self, locator):
        return self._actions.switch_to_iframe_and_get_text(PaymentMethodsLocators.expiration_date_iframe, locator)

    def get_security_code_iframe_element_text(self, locator):
        return self._actions.switch_to_iframe_and_get_text(PaymentMethodsLocators.security_code_iframe, locator)

    def get_tokenized_security_code_iframe_element_text(self, locator):
        return self._actions.switch_to_iframe_and_get_text(TokenizedPaymentsLocators.security_code_iframe, locator)

    def change_field_focus(self, field_type):
        if field_type == FieldType.CARD_NUMBER.name:
            self._actions.switch_to_iframe_and_click(PaymentMethodsLocators.card_number_iframe,
                                                     PaymentMethodsLocators.card_number_input_field)
        elif field_type == FieldType.EXPIRATION_DATE.name:
            self._actions.switch_to_iframe_and_click(PaymentMethodsLocators.expiration_date_iframe,
                                                     PaymentMethodsLocators.expiration_date_input_field)
        elif field_type == FieldType.SECURITY_CODE.name:
            self._actions.switch_to_iframe_and_click(PaymentMethodsLocators.security_code_iframe,
                                                     PaymentMethodsLocators.security_code_input_field)
        elif field_type == FieldType.ANIMATED_CARD.name:
            self._actions.switch_to_iframe_and_click(PaymentMethodsLocators.animated_card_iframe,
                                                     PaymentMethodsLocators.animated_card)

    def change_focus_to_page_title(self):
        self._actions.click(PaymentMethodsLocators.page_title)

    # Additional form fields

    def fill_merchant_input_field(self, field_type, value):
        if field_type == FieldType.NAME.name:
            self._actions.send_keys(PaymentMethodsLocators.merchant_name, value)
        elif field_type == FieldType.EMAIL.name:
            self._actions.send_keys(PaymentMethodsLocators.merchant_email, value)
        elif field_type == FieldType.PHONE.name:
            self._actions.send_keys(PaymentMethodsLocators.merchant_phone, value)

    def fill_merchant_form(self, name, email, phone):
        self.fill_merchant_input_field(FieldType.NAME.name, name)
        self.fill_merchant_input_field(FieldType.EMAIL.name, email)
        self.fill_merchant_input_field(FieldType.PHONE.name, phone)

    def fill_amount_field(self, value):
        self._actions.send_keys(PaymentMethodsLocators.amount_field, value)
        self._waits.wait_for_javascript()

    # Additional buttons

    def toggle_action_buttons_bar(self):
        self._actions.click(PaymentMethodsLocators.actions_bar_toggle)

    def click_remove_frames_btn(self):
        self._waits.wait_for_element_to_be_clickable(PaymentMethodsLocators.action_btn_remove_frames)
        self._actions.click(PaymentMethodsLocators.action_btn_remove_frames)

    def click_destroy_st_btn(self):
        self._waits.wait_for_element_to_be_clickable(PaymentMethodsLocators.action_btn_destroy_st)
        self._actions.click(PaymentMethodsLocators.action_btn_destroy_st)

    def click_start_st_btn(self):
        self._waits.wait_for_element_to_be_clickable(PaymentMethodsLocators.action_btn_start_st)
        self._actions.click(PaymentMethodsLocators.action_btn_start_st)

    def click_cancel_3ds_btn(self):
        self._waits.wait_for_element_to_be_clickable(PaymentMethodsLocators.action_btn_cancel_3ds)
        self._actions.click(PaymentMethodsLocators.action_btn_cancel_3ds)

    def click_additional_btn(self):
        self._waits.wait_for_element_to_be_clickable(PaymentMethodsLocators.additional_button)
        self._actions.click(PaymentMethodsLocators.additional_button)

    # ACS CC

    def click_cardinal_submit_btn(self):
        self._actions.click(PaymentMethodsLocators.cardinal_v2_authentication_submit_btn)

    def click_cardinal_cancel_btn(self):
        self._actions.switch_to_iframe(FieldType.CARDINAL_IFRAME.value)
        self._waits.wait_for_element_to_be_displayed(PaymentMethodsLocators.cardinal_v2_authentication_code_field)
        self._actions.click(PaymentMethodsLocators.cardinal_v2_authentication_cancel_btn)
        self._actions.switch_to_default_content()

    def fill_cardinal_authentication_code(self, auth_type):
        auth = AuthType.__members__[auth_type].name  # pylint: disable=unsubscriptable-object
        self.select_proper_cardinal_authentication(auth)

    def fill_cardinal_v1_popup(self):
        # self._actions.switch_to_iframe(PaymentMethodsLocators.cardinal_v1_iframe)
        self._waits.wait_for_element_to_be_displayed(
            PaymentMethodsLocators.cardinal_v1_authentication_code_field)
        self._actions.send_keys(PaymentMethodsLocators.cardinal_v1_authentication_code_field,
                                AuthData.THREE_DS_CODE.value)
        if 'Firefox' in CONFIGURATION.BROWSER or 'Catalina' in CONFIGURATION.REMOTE_OS_VERSION:
            self._actions.click_by_javascript(PaymentMethodsLocators.cardinal_v1_authentication_submit_btn)
        else:
            self._actions.click(PaymentMethodsLocators.cardinal_v1_authentication_submit_btn)

    def fill_cardinal_v2_popup(self):
        self._waits.wait_for_element_to_be_displayed(
            PaymentMethodsLocators.cardinal_v2_authentication_code_field)
        self._actions.send_keys(PaymentMethodsLocators.cardinal_v2_authentication_code_field,
                                AuthData.THREE_DS_CODE.value)
        self.scroll_to_bottom()
        if 'Firefox' in CONFIGURATION.BROWSER or 'Catalina' in CONFIGURATION.REMOTE_OS_VERSION:
            self._actions.click_by_javascript(PaymentMethodsLocators.cardinal_v2_authentication_submit_btn)
        else:
            self._actions.click(PaymentMethodsLocators.cardinal_v2_authentication_submit_btn)

    def focus_on_authentication_label(self, auth):
        if auth == AuthType.V2.name:
            self._actions.switch_to_iframe(FieldType.CARDINAL_IFRAME.value)
            self._actions.click(PaymentMethodsLocators.purchase_authentication_label)
        else:
            self._actions.switch_to_iframe(FieldType.V1_PARENT_IFRAME.value)
            self._actions.click(PaymentMethodsLocators.please_submit_label)
        self._actions.switch_to_default_iframe()

    def validate_cardinal_authentication_modal_appears(self, auth):
        self._actions.switch_to_iframe(FieldType.CARDINAL_IFRAME.value)
        if auth == AuthType.V2.name:
            self._waits.wait_for_element_to_be_displayed(
                PaymentMethodsLocators.cardinal_v2_authentication_code_field)
        else:
            self._actions.switch_to_iframe(FieldType.V1_PARENT_IFRAME.value)
            self._waits.wait_for_element_to_be_displayed(
                PaymentMethodsLocators.cardinal_v1_authentication_code_field)
        self._actions.switch_to_default_iframe()

    def select_proper_cardinal_authentication(self, auth):
        self._waits.wait_for_element_to_be_displayed(PaymentMethodsLocators.cardinal_modal)
        self._actions.switch_to_iframe(PaymentMethodsLocators.cardinal_iframe)
        if auth == AuthType.V2.name:
            self.fill_cardinal_v2_popup()
        else:
            self.fill_cardinal_v1_popup()
        self._waits.wait_for_element_to_be_not_displayed(PaymentMethodsLocators.cardinal_modal)
        self._actions.switch_to_default_content()

    # Validators

    def validate_value_of_input_field(self, field_type, expected_message):
        input_value = self.get_value_of_input_field(field_type)
        assertion_message = f'{FieldType[field_type].name} input value is not correct, ' \
                            f'should be: "{expected_message}" but is: "{input_value}"'
        add_to_shared_dict(SharedDictKey.ASSERTION_MESSAGE.value, assertion_message)
        assert expected_message in input_value, assertion_message

    def validate_payment_status_message(self, expected_message):
        actual_message = self.get_payment_status_message()
        assertion_message = f'Payment status is not correct, should be: "{expected_message}" but is: "{actual_message}"'
        add_to_shared_dict(SharedDictKey.ASSERTION_MESSAGE.value, assertion_message)
        assert expected_message in actual_message, assertion_message

    def validate_callback_with_data_type(self, expected_message):
        actual_message = self.get_text_from_status_callback()
        assertion_message = f'Payment status is not correct, should be: "{expected_message}" but is: "{actual_message}"'
        add_to_shared_dict(SharedDictKey.ASSERTION_MESSAGE.value, assertion_message)
        assert expected_message in actual_message, assertion_message

    def validate_notification_frame_color(self, color):
        actual_color = self.get_color_of_notification_frame()
        assertion_message = f'Notification frame color is not correct, should be: "{color}" but is: "{actual_color}"'
        add_to_shared_dict(SharedDictKey.ASSERTION_MESSAGE.value, assertion_message)
        assert color in actual_color, assertion_message

    def validate_if_field_is_highlighted(self, field_type):
        attribute_value = self.get_element_attribute(field_type, 'class')
        assertion_message = f'{FieldType[field_type].name} field is not highlighted but should be'
        add_to_shared_dict(SharedDictKey.ASSERTION_MESSAGE.value, assertion_message)
        assert 'error' in attribute_value, assertion_message

    def validate_field_accessibility(self, field_type, should_be_enabled):
        is_enabled = self.is_field_enabled(field_type)
        assertion_message = f'{FieldType[field_type].name} field enabled state should be: {should_be_enabled} but was: {is_enabled}'
        add_to_shared_dict(SharedDictKey.ASSERTION_MESSAGE.value, assertion_message)
        assert is_enabled is should_be_enabled, assertion_message

    def validate_if_field_is_not_displayed(self, field_type):
        is_displayed = self.is_field_displayed(field_type)
        assertion_message = f'{FieldType[field_type].name} field is displayed but should not be'
        add_to_shared_dict(SharedDictKey.ASSERTION_MESSAGE.value, assertion_message)
        assert is_displayed is False, assertion_message

    def validate_css_style(self, field_type, property_name, expected_style):
        actual_css_style = self.get_field_css_style(field_type, property_name)
        assertion_message = f'{FieldType[field_type].name} style is not correct, ' \
                            f'should be "{expected_style}" but is "{actual_css_style}"'
        add_to_shared_dict(SharedDictKey.ASSERTION_MESSAGE.value, assertion_message)
        assert expected_style in actual_css_style, assertion_message

    @staticmethod
    def validate_field_text(field_type, actual_translation, expected_translation):
        assertion_message = f'{FieldType[field_type].name} field text is not correct: ' \
                            f' should be {expected_translation} but is {actual_translation}'
        add_to_shared_dict(SharedDictKey.ASSERTION_MESSAGE.value, assertion_message)
        assert actual_translation == expected_translation, assertion_message

    def validate_field_validation_message(self, field_type, expected_text):
        actual_translation = ''

        if field_type == FieldType.CARD_NUMBER.name:
            actual_translation = self.get_card_number_iframe_element_text(
                PaymentMethodsLocators.card_number_field_validation_message)
        elif field_type == FieldType.EXPIRATION_DATE.name:
            actual_translation = self.get_expiration_date_iframe_element_text(
                PaymentMethodsLocators.expiration_date_field_validation_message)
        elif field_type == FieldType.SECURITY_CODE.name:
            actual_translation = self.get_security_code_iframe_element_text(
                PaymentMethodsLocators.security_code_field_validation_message)
        elif field_type == FieldType.TOKENIZED_SECURITY_CODE.name:
            actual_translation = self.get_tokenized_security_code_iframe_element_text(
                TokenizedPaymentsLocators.security_code_message)

        self.validate_field_text(field_type, actual_translation, expected_text)

    def validate_field_validation_message_translation(self, field_type, language, translation_key):
        expected_text = get_translation_from_json(language, translation_key)
        self.validate_field_validation_message(field_type, expected_text)

    def validate_all_labels_translation(self, language):
        self.validate_card_number_iframe_element_text(get_translation_from_json(language, 'Card number'))
        self.validate_expiration_date_iframe_element_text(get_translation_from_json(language, 'Expiration date'))
        self.validate_security_code_iframe_element_text(get_translation_from_json(language, 'Security code'))
        self.validate_no_iframe_element_text(FieldType.SUBMIT_BUTTON.name,
                                             PaymentMethodsLocators.pay_button,
                                             get_translation_from_json(language, 'Pay'))

    def validate_submit_btn_specific_translation(self, expected_translation):
        self.validate_no_iframe_element_text(FieldType.SUBMIT_BUTTON.name,
                                             PaymentMethodsLocators.pay_button,
                                             expected_translation)

    def validate_payment_status_translation(self, language, translation_key):
        expected_translation = get_translation_from_json(language, translation_key)
        self._waits.wait_for_element_to_be_displayed(PaymentMethodsLocators.notification_frame)
        self.validate_no_iframe_element_text(FieldType.NOTIFICATION_FRAME.name,
                                             PaymentMethodsLocators.notification_frame, expected_translation)

    def validate_card_number_iframe_element_text(self, expected_text):
        actual_text = self.get_card_number_iframe_element_text(PaymentMethodsLocators.card_number_label)
        self.validate_field_text(FieldType.CARD_NUMBER.name, actual_text, expected_text)

    def validate_expiration_date_iframe_element_text(self, expected_text):
        actual_text = self.get_expiration_date_iframe_element_text(PaymentMethodsLocators.expiration_date_label)
        self.validate_field_text(FieldType.EXPIRATION_DATE.name, actual_text, expected_text)

    def validate_expiration_date_placeholder_text(self, expected_text):
        actual_text = self.get_element_attribute(FieldType.EXPIRATION_DATE.name, 'placeholder')
        self.validate_field_text(FieldType.EXPIRATION_DATE_INPUT.name, actual_text, expected_text)

    def validate_tokenized_security_code_iframe_element_text(self, expected_text):
        actual_text = self.get_tokenized_security_code_iframe_element_text(
            TokenizedPaymentsLocators.security_code_label)
        self.validate_field_text(FieldType.TOKENIZED_SECURITY_CODE.name, actual_text, expected_text)

    def validate_tokenized_submit_btn_specific_translation(self, expected_translation):
        self.validate_no_iframe_element_text(FieldType.TOKENIZED_SUBMIT_BUTTON.name,
                                             TokenizedPaymentsLocators.pay_btn,
                                             expected_translation)

    def validate_security_code_iframe_element_text(self, expected_text):
        actual_text = self.get_security_code_iframe_element_text(PaymentMethodsLocators.security_code_label)
        self.validate_field_text(FieldType.SECURITY_CODE.name, actual_text, expected_text)

    def validate_no_iframe_element_text(self, field_type, locator, expected_text):
        actual_text = self.get_element_text(locator)
        self.validate_field_text(field_type, actual_text, expected_text)

    def get_cachetoken_value(self):
        self._waits.wait_for_javascript()
        actual_url = self._browser_executor.get_page_url()
        parsed_url = urlparse(actual_url)
        parsed_query_from_url = parse_qs(parsed_url.query)
        cachetoken_value = parsed_query_from_url['cachetoken'][0]
        return cachetoken_value

    def validate_if_url_contains_info_about_payment(self, expected_url):
        self._waits.wait_until_url_contains(expected_url)
        actual_url = self._browser_executor.get_page_url()
        actual_url_for_logs = replace_jwt(actual_url)
        assertion_message = f'Url is not correct, should be: "{expected_url}" but is: "{actual_url_for_logs}"'
        add_to_shared_dict(SharedDictKey.ASSERTION_MESSAGE.value, assertion_message)
        assert expected_url in actual_url, assertion_message

    @staticmethod
    def validate_if_url_contains_param(parsed_query_from_url, key, value):
        if 'should not be none' in value:
            assert_that(parsed_query_from_url[key][0]).is_not_none()
        elif 'should be none' in value:
            assert_that(key not in parsed_query_from_url.keys(), f'{key} is not none but should be').is_true()
        else:
            assert_that(parsed_query_from_url[key][0], f'{key} param value: ').is_equal_to(value)

    def validate_form_status(self, field_type, form_status):
        should_be_enabled = bool('enabled' in form_status)
        is_enabled = self.is_field_enabled(field_type)
        assertion_message = f'{FieldType[field_type].name} field enabled state should be: {should_be_enabled} but was: {is_enabled}'
        add_to_shared_dict('assertion_message', assertion_message)
        assert is_enabled is should_be_enabled, assertion_message

    def validate_if_callback_popup_is_displayed(self, callback_popup):
        is_displayed = False
        if 'success' in callback_popup:
            is_displayed = self._waits.wait_and_check_is_element_displayed(
                PaymentMethodsLocators.callback_success_popup)
        elif 'error' in callback_popup:
            is_displayed = self._waits.wait_and_check_is_element_displayed(PaymentMethodsLocators.callback_error_popup)
        elif 'cancel' in callback_popup:
            is_displayed = self._waits.wait_and_check_is_element_displayed(PaymentMethodsLocators.callback_cancel_popup)
        elif 'submit' in callback_popup:
            is_displayed = self._waits.wait_and_check_is_element_displayed(PaymentMethodsLocators.callback_data_popup)
        assertion_message = f'{callback_popup} callback popup is not displayed but should be'
        add_to_shared_dict(SharedDictKey.ASSERTION_MESSAGE.value, assertion_message)
        assert is_displayed is True, assertion_message

    def validate_jwt_response_in_callback(self):
        response = self.get_text_from_submit_callback_jwt()
        assertion_message = 'Submit callback data doesnt contain JWT response'
        add_to_shared_dict(SharedDictKey.ASSERTION_MESSAGE.value, assertion_message)
        assert 'undefined' not in response, assertion_message
        decoded_jwt = jwt_generator.decode_jwt(response.split('JWT: ')[-1])
        assertion_message = 'JWT response didnt contain merchant JWT'
        add_to_shared_dict(SharedDictKey.ASSERTION_MESSAGE.value, assertion_message)
        assert 'jwt' in decoded_jwt.get('payload'), assertion_message

    def validate_threedresponse_in_callback(self, threedresponse_defined):
        response = self.get_text_from_submit_callback_threedresponse()
        if threedresponse_defined == 'True':
            assertion_message = 'Submit callback data doesnt contain threedresponse'
            add_to_shared_dict(SharedDictKey.ASSERTION_MESSAGE.value, assertion_message)
            assert 'undefined' not in response, assertion_message
        else:
            assertion_message = 'Submit callback data contains threedresponse'
            add_to_shared_dict(SharedDictKey.ASSERTION_MESSAGE.value, assertion_message)
            assert 'undefined' in response, assertion_message

    def validate_threedresponse_values(self, key, value):
        response = self.get_text_from_submit_callback_threedresponse()
        decoded_jwt = jwt_generator.decode_jwt(response.split('THREEDRESPONSE: ')[-1]).get('Payload')
        if 'should not be none' in value:
            assert_that(decoded_jwt[key], f"{key} is none but shouldn't be").is_not_none()
        elif 'should be none' in value:
            assert_that(decoded_jwt[key], f'{key} is not none but should be').is_none()
        else:
            assert_that(str(decoded_jwt[key]), f'{key} param value: ').is_equal_to(value)

    def validate_number_in_callback_counter_popup(self, callback_popup, expected_callback_number):
        counter = ''
        assertion_message = f'Number of {callback_popup} callback is not correct - should be {expected_callback_number}'
        add_to_shared_dict(SharedDictKey.ASSERTION_MESSAGE.value, assertion_message)
        if 'success' in callback_popup:
            counter = self._actions.get_text_from_last_element(PaymentMethodsLocators.callback_success_counter)
        elif 'error' in callback_popup:
            counter = self._actions.get_text_from_last_element(PaymentMethodsLocators.callback_error_counter)
        elif 'cancel' in callback_popup:
            counter = self._actions.get_text_from_last_element(PaymentMethodsLocators.callback_cancel_counter)
        elif 'submit' in callback_popup:
            counter = self._actions.get_text_from_last_element(PaymentMethodsLocators.callback_submit_counter)
        assertion_message += f' but is {counter}'
        add_to_shared_dict(SharedDictKey.ASSERTION_MESSAGE.value, assertion_message)
        assert expected_callback_number in counter, assertion_message

    def validate_placeholder(self, field_type, expected_placeholder):
        actual_placeholder = self.get_element_attribute(field_type, 'placeholder')
        assertion_message = f'Placeholder for {FieldType[field_type].name} field is not correct, ' \
                            f'should be "{expected_placeholder}" but is "{actual_placeholder}"'
        add_to_shared_dict(SharedDictKey.ASSERTION_MESSAGE.value, assertion_message)
        assert expected_placeholder in actual_placeholder, assertion_message

    def validate_credit_card_icon_in_input_field(self, expected_card_icon):
        actual_credit_card_icon = self.get_card_type_icon_from_input_field()
        assertion_message = f'Credit card icon is not correct, ' \
                            f'should be: "{expected_card_icon}" but is: "{actual_credit_card_icon}"'
        add_to_shared_dict(SharedDictKey.ASSERTION_MESSAGE.value, assertion_message)
        assert expected_card_icon in actual_credit_card_icon, assertion_message

    def validate_browser_support_info(self, data_object, is_supported):
        browser_info_text = self.get_text_from_browser_info()
        browser_info_json = json.loads(browser_info_text)
        actual_is_supported_info = str(browser_info_json.get(data_object).get('isSupported'))
        assertion_message = f'{data_object} should be mark as supported: {is_supported} but is: ' \
                            f'{actual_is_supported_info}'
        add_to_shared_dict(SharedDictKey.ASSERTION_MESSAGE.value, assertion_message)
        assert is_supported in actual_is_supported_info, assertion_message

    def validate_if_browser_is_supported_in_info_callback(self, is_supported):
        self.validate_browser_support_info('browser', is_supported)

    def validate_if_os_is_supported_in_info_callback(self, is_supported):
        self.validate_browser_support_info('os', is_supported)

    def validate_iframe_is_available_in_page_source(self, field_type, expected):
        assertion_message = f'{FieldType[field_type].name} iframe is available but should not be'
        if expected:
            assertion_message = f'{FieldType[field_type].name} iframe is not available but should be'
        add_to_shared_dict(SharedDictKey.ASSERTION_MESSAGE.value, assertion_message)
        actual = self._actions.is_iframe_available_in_page_source(FieldType[field_type].value)
        assert_that(actual, assertion_message).is_equal_to(expected)

    def switch_to_example_page_parent_iframe(self):
        self._actions.switch_to_iframe(PaymentMethodsLocators.parent_iframe)

    #   Waits

    def wait_for_example_page_parent_iframe(self):
        self._waits.wait_until_iframe_is_presented_and_switch_to_it(PaymentMethodsLocators.security_code_iframe)
        self._actions.switch_to_default_iframe()

    def wait_for_payment_form_inputs_to_display(self):
        self._waits.wait_for_element_to_be_displayed(PaymentMethodsLocators.card_number_iframe)
        self._waits.wait_for_element_to_be_displayed(PaymentMethodsLocators.expiration_date_iframe)
        self._waits.wait_for_element_to_be_displayed(PaymentMethodsLocators.security_code_iframe)

    def wait_for_payment_form_inputs_to_load(self):
        self.wait_for_card_number_iframe()
        self._actions.switch_to_default_iframe()
        self.wait_for_expiration_date_iframe()
        self._actions.switch_to_default_iframe()
        self.wait_for_security_code_iframe()
        self._actions.switch_to_default_iframe()

    def wait_for_payment_form_inputs_to_load_with_refresh_page(self):
        max_try = 3
        while max_try:
            refresh = False
            if self.wait_for_card_number_iframe():
                self._actions.switch_to_default_iframe()
            else:
                refresh = True
            if self.wait_for_expiration_date_iframe():
                self._actions.switch_to_default_iframe()
            else:
                refresh = True
            if self.wait_for_security_code_iframe():
                self._actions.switch_to_default_iframe()
            else:
                refresh = True

            if refresh:
                self._browser_executor.refresh()
                max_try -= 1
            else:
                return

    def wait_for_card_number_iframe(self):
        return self._waits.wait_until_iframe_is_presented_and_check_is_possible_switch_to_it(
            PaymentMethodsLocators.card_number_iframe)

    def wait_for_expiration_date_iframe(self):
        return self._waits.wait_until_iframe_is_presented_and_check_is_possible_switch_to_it(
            PaymentMethodsLocators.expiration_date_iframe)

    def wait_for_security_code_iframe(self):
        return self._waits.wait_until_iframe_is_presented_and_check_is_possible_switch_to_it(
            PaymentMethodsLocators.security_code_iframe)

    def wait_for_pay_button_to_be_active(self):
        self._waits.wait_for_element_to_be_clickable(PaymentMethodsLocators.pay_button)

    def wait_for_additional_submit_button_to_be_active(self):
        self._waits.wait_for_element_to_be_clickable(PaymentMethodsLocators.additional_button)

    def wait_for_notification_frame(self):
        if CONFIGURATION.REMOTE_DEVICE:
            self.scroll_to_top()
        self._waits.wait_for_element_to_be_displayed(PaymentMethodsLocators.notification_frame)

    def wait_for_notification_frame_with_timeout(self, timeout):
        if CONFIGURATION.REMOTE_DEVICE:
            self.scroll_to_top()
        self._waits.wait_for_element_to_be_displayed(PaymentMethodsLocators.notification_frame, timeout)

    def wait_for_popups_to_disappear(self):
        self._waits.wait_for_element_to_be_not_displayed(PaymentMethodsLocators.popups)

    def wait_for_notification_frame_to_disappear(self):
        self._waits.wait_for_element_to_be_not_displayed(PaymentMethodsLocators.notification_frame)

    def wait_for_url_with_timeout(self, url, timeout):
        self._waits.wait_until_url_starts_with(url, timeout)

    def click_proceed_btn_on_apple_pay_popup(self):
        self._actions.click(PaymentMethodsLocators.apple_pay_proceed_btn)

    def click_cancel_btn_on_apple_pay_popup(self):
        self._actions.click(PaymentMethodsLocators.apple_pay_cancel_btn)
