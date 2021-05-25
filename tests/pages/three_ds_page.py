from pages.base_page import BasePage
from pages.locators.three_ds_locators import ThreeDSMethodsLocators
from utils.enums.shared_dict_keys import SharedDictKey
from utils.helpers.request_executor import add_to_shared_dict
from utils.helpers.resources_reader import get_translation_from_json


class ThreeDsPage(BasePage):

    @staticmethod
    def get_challenge_display_mode_val_from_config(three_ds_config):
        return three_ds_config['threeDSecure']['challengeDisplayMode']

    def verify_3ds_challenge_modal_appears(self):
        self._actions.switch_to_iframe(ThreeDSMethodsLocators.three_ds_iframe)
        self._waits.wait_for_element_to_be_displayed(ThreeDSMethodsLocators.three_ds_challenge_input)
        self._waits.wait_for_element_to_be_displayed(ThreeDSMethodsLocators.three_ds_challenge_submit_button)
        self._actions.switch_to_default_iframe()

    def fill_3ds_challenge_modal_and_submit(self, data):
        self._actions.switch_to_iframe(ThreeDSMethodsLocators.three_ds_iframe)
        self._actions.send_keys(ThreeDSMethodsLocators.three_ds_challenge_input, data)
        self._actions.click(ThreeDSMethodsLocators.three_ds_challenge_submit_button)
        self._actions.switch_to_default_iframe()

    def cancel_3ds_inline_challenge(self):
        self._actions.click(ThreeDSMethodsLocators.three_ds_challenge_inline_cancel_button)

    def cancel_3ds_popup_challenge(self):
        self._actions.click(ThreeDSMethodsLocators.three_ds_challenge_popup_cancel_button)

    def cancel_3ds_challenge(self, three_ds_config):
        if 'POPUP' in self.get_challenge_display_mode_val_from_config(three_ds_config):
            self._actions.click(ThreeDSMethodsLocators.three_ds_challenge_popup_cancel_button)
        else:
            self._actions.click(ThreeDSMethodsLocators.three_ds_challenge_inline_cancel_button)

    def get_3ds_challenge_cancel_btn_text(self, three_ds_config):
        if 'POPUP' in self.get_challenge_display_mode_val_from_config(three_ds_config):
            return self._actions.get_text(ThreeDSMethodsLocators.three_ds_challenge_popup_cancel_button)
        else:
            self._actions.get_text(ThreeDSMethodsLocators.three_ds_challenge_inline_cancel_button)

    def validate_3ds_challenge_cancel_btn_translation(self, three_ds_config, expected_translation):
        actual_translation = self.get_3ds_challenge_cancel_btn_text(three_ds_config)
        assertion_message = f'Cancel button text is not correct: ' \
                            f' should be {expected_translation} but is {actual_translation}'
        add_to_shared_dict(SharedDictKey.ASSERTION_MESSAGE.value, assertion_message)
        assert actual_translation == expected_translation, assertion_message

    def validate_3ds_challenge_cancel_btn_translation_locale(self, three_ds_config, locale_code):
        expected_translation = get_translation_from_json(locale_code, 'cancel')
        self.validate_3ds_challenge_cancel_btn_translation(three_ds_config, expected_translation)
