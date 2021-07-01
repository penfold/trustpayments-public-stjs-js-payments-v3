from pages.base_page import BasePage
from pages.locators.payment_methods_locators import PaymentMethodsLocators
from pages.locators.three_ds_locators import ThreeDSMethodsLocators


class ThreeDsPage(BasePage):

    def verify_3ds_challenge_modal_appears(self):
        self._actions.switch_to_iframe(ThreeDSMethodsLocators.three_ds_iframe)
        self._waits.wait_for_element_to_be_displayed(ThreeDSMethodsLocators.three_ds_challenge_input)
        self._waits.wait_for_element_to_be_displayed(ThreeDSMethodsLocators.three_ds_challenge_submit_button)
        self._actions.switch_to_default_iframe()

    def verify_3ds_v1_challenge_modal_appears(self):
        self._actions.switch_to_iframe(ThreeDSMethodsLocators.three_ds_iframe)
        self._waits.wait_for_element_to_be_displayed(ThreeDSMethodsLocators.three_ds_v1_challenge_input)
        self._waits.wait_for_element_to_be_displayed(ThreeDSMethodsLocators.three_ds_v1_challenge_submit_button)
        self._actions.switch_to_default_iframe()

    def fill_3ds_challenge_modal_and_submit(self, data):
        self._actions.switch_to_iframe(ThreeDSMethodsLocators.three_ds_iframe)
        self._actions.send_keys(ThreeDSMethodsLocators.three_ds_challenge_input, data)
        self._actions.click(ThreeDSMethodsLocators.three_ds_challenge_submit_button)
        self._actions.switch_to_default_iframe()

    def fill_3ds_v1_challenge_modal_and_submit(self, data):
        self._actions.switch_to_iframe(ThreeDSMethodsLocators.three_ds_iframe)
        self._actions.send_keys(ThreeDSMethodsLocators.three_ds_v1_challenge_input, data)
        self._actions.click(ThreeDSMethodsLocators.three_ds_v1_challenge_submit_button)
        self._actions.switch_to_default_iframe()

    def cancel_3ds_inline_challenge(self):
        self._actions.click(ThreeDSMethodsLocators.three_ds_challenge_inline_cancel_button)

    def cancel_3ds_popup_challenge(self):
        self._actions.click(ThreeDSMethodsLocators.three_ds_challenge_popup_cancel_button)

    def get_3ds_popup_challenge_cancel_btn_text(self):
        return self._actions.get_text(ThreeDSMethodsLocators.three_ds_challenge_popup_cancel_button)

    def check_if_processing_screen_disappears_before_element_appears(self, element):
        self._waits.wait_for_element_to_be_not_displayed(ThreeDSMethodsLocators.processing_screen)
        item = None
        if element == 'notification message':
            item = PaymentMethodsLocators.notification_frame
        elif element == 'confirmation code':
            self._actions.switch_to_iframe(ThreeDSMethodsLocators.three_ds_iframe)
            item = ThreeDSMethodsLocators.three_ds_challenge_input
        assert self._actions.is_element_displayed(item) is True
        self._actions.switch_to_default_iframe()

    def processing_screen_is_displayed(self):
        assert self._actions.is_element_displayed(ThreeDSMethodsLocators.processing_screen) is True

    def wait_for_processing_screen_element(self, element):
        self._waits.wait_for_element_to_be_displayed(element)
