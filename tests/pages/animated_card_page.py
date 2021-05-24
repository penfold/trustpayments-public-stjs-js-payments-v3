import json

from configuration import CONFIGURATION
from pages.locators.animated_card_locators import AnimatedCardLocators
from pages.locators.payment_methods_locators import PaymentMethodsLocators
from pages.base_page import BasePage
from utils.enums.field_type import FieldType
from utils.helpers.request_executor import add_to_shared_dict
from utils.helpers.resources_reader import get_translation_from_json


class AnimatedCardPage(BasePage):

    def get_card_type_icon_from_animated_card(self):
        credit_card_icon = self._actions.get_element_attribute(AnimatedCardLocators.card_type_logo_from_animated_card,
                                                               'alt')
        credit_card_icon = credit_card_icon.upper()
        return credit_card_icon

    def validate_credit_card_icon(self, expected_card_icon, is_field_in_iframe):
        if is_field_in_iframe:
            self._actions.switch_to_iframe(PaymentMethodsLocators.animated_card_iframe)
        actual_credit_card_icon = self.get_card_type_icon_from_animated_card()
        assertion_message = f'Credit card icon is not correct, ' \
                            f'should be: "{expected_card_icon}" but is: "{actual_credit_card_icon}"'
        add_to_shared_dict('assertion_message', assertion_message)
        assert expected_card_icon in actual_credit_card_icon, assertion_message

    def get_data_from_animated_card(self, field_type, card_type):
        animated_card_data = ''
        if field_type == FieldType.CARD_NUMBER.name:
            animated_card_data = self._actions.get_text(AnimatedCardLocators.credit_card_number_on_animated_card)
        elif field_type == FieldType.EXPIRATION_DATE.name:
            animated_card_data = self._actions.get_text(AnimatedCardLocators.expiration_date_on_animated_card)
        elif field_type == FieldType.SECURITY_CODE.name:
            if card_type == 'AMEX':
                animated_card_data = self._actions.get_text(AnimatedCardLocators.cvv_on_front_side_animated_card)
            else:
                animated_card_data = self._actions.get_text(AnimatedCardLocators.cvv_on_back_side_animated_card)
        return animated_card_data

    def validate_data_on_animated_card(self, expected_data, field_type, card_type):
        actual_data_on_animated_card = self.get_data_from_animated_card(field_type, card_type)
        assertion_message = f'Data on animated card is not correct, should be: ' \
                            f'"{expected_data}" but is: "{actual_data_on_animated_card}"'
        add_to_shared_dict('assertion_message', assertion_message)
        assert expected_data in actual_data_on_animated_card, assertion_message

    def validate_all_data_on_animated_card(self, card_number, exp_date, cvv, card_type, is_field_in_iframe):
        self.validate_data_on_animated_card(card_number, FieldType.CARD_NUMBER.name, card_type)
        self.validate_data_on_animated_card(exp_date, FieldType.EXPIRATION_DATE.name, card_type)
        if cvv is not None:
            self.validate_data_on_animated_card(cvv, FieldType.SECURITY_CODE.name, card_type)

    def validate_if_animated_card_is_flipped(self, card_type, is_field_in_iframe):
        # Disabled checking flipping card for safari because switch_to_iframe method make card is back to the original
        # position. This case is checked in animated card repo (without iframe)
        if is_field_in_iframe and 'Safari' in CONFIGURATION.REMOTE_BROWSER:
            pass
        else:
            animated_card_side = self._actions.get_element_attribute(AnimatedCardLocators.animated_card, 'class')
            if card_type == 'AMEX':
                assertion_message = 'Animated card is flipped for AMEX but should not be'
                add_to_shared_dict('assertion_message', assertion_message)
                assert 'flip-card' not in animated_card_side, assertion_message
            else:
                assertion_message = 'Animated card is not flipped but should be'
                add_to_shared_dict('assertion_message', assertion_message)
                assert 'flip-card' in animated_card_side, assertion_message

    def validate_animated_card_translation(self, language):
        self._actions.switch_to_iframe(FieldType.ANIMATED_CARD.value)
        self.validate_animated_card_element_translation(AnimatedCardLocators.card_number_label,
                                                        language, 'Card number')
        self.validate_animated_card_element_translation(AnimatedCardLocators.expiration_date_label,
                                                        language, 'Expiration date')
        self.validate_animated_card_element_translation(AnimatedCardLocators.security_code_label,
                                                        language, 'Security code')

    def validate_animated_card_element_translation(self, element, language, key):
        actual_translation = self.get_animated_card_label_translation(element)
        expected_translation = get_translation_from_json(language, key)
        if 'Safari' not in CONFIGURATION.REMOTE_BROWSER:
            expected_translation = expected_translation.upper()
        assertion_message = f'Translation is not correct: should be {expected_translation} but is {actual_translation}'
        add_to_shared_dict('assertion_message', assertion_message)
        assert actual_translation in expected_translation, assertion_message

    def get_animated_card_label_translation(self, locator):
        element_translation = self._actions.get_text(locator)
        return element_translation
