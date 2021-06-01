from pages.base_page import BasePage
from pages.locators.three_ds_locators import ThreeDSMethodsLocators


class ThreeDsPage(BasePage):

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

    def get_3ds_popup_challenge_cancel_btn_text(self):
        return self._actions.get_text(ThreeDSMethodsLocators.three_ds_challenge_popup_cancel_button)
