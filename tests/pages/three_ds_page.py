from time import time, sleep

from pages.base_page import BasePage
from pages.locators.payment_methods_locators import PaymentMethodsLocators
from pages.locators.three_ds_locators import ThreeDSMethodsLocators
from utils.enums.shared_dict_keys import SharedDictKey
from utils.helpers.request_executor import add_to_shared_dict


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

    def get_3ds_challenge_modal_alert_text(self):
        self._actions.switch_to_iframe(ThreeDSMethodsLocators.three_ds_iframe)
        alert_text = self._actions.get_text(ThreeDSMethodsLocators.three_ds_challenge_alert)
        self._actions.switch_to_default_iframe()
        return alert_text

    def verify_if_processing_screen_disappears_before_element_appears(self, element):
        self._waits.wait_for_element_to_be_not_displayed(ThreeDSMethodsLocators.processing_screen)
        web_element = None
        if element == 'notification message':
            web_element = PaymentMethodsLocators.notification_frame
            sleep(0.5)
        elif element == 'challenge v2':
            self._actions.switch_to_iframe(ThreeDSMethodsLocators.three_ds_iframe)
            web_element = ThreeDSMethodsLocators.three_ds_challenge_input
        elif element == 'challenge v1':
            self._actions.switch_to_iframe(ThreeDSMethodsLocators.three_ds_iframe)
            web_element = ThreeDSMethodsLocators.three_ds_v1_challenge_input

        assertion_message = f'{web_element} is not displayed after processing screen disappeared'
        add_to_shared_dict(SharedDictKey.ASSERTION_MESSAGE.value, assertion_message)
        assert self._actions.is_element_displayed(web_element) is True, assertion_message
        self._actions.switch_to_default_iframe()

    def verify_if_processing_screen_is_displayed(self):
        element = ThreeDSMethodsLocators.processing_screen
        assertion_message = f'{element} is not displayed after processing screen disappeared'
        add_to_shared_dict(SharedDictKey.ASSERTION_MESSAGE.value, assertion_message)
        assert self._actions.is_element_displayed(element) is True, assertion_message

    def wait_for_processing_screen_elements(self, processing_screen_mode):
        processing_screen_elements = {
            'ATTACH_TO_ELEMENT': {
                'processing_screen': ThreeDSMethodsLocators.processing_screen_attach_to_element,
                'logo': ThreeDSMethodsLocators.processing_screen_attach_to_element_logo,
                'loader': ThreeDSMethodsLocators.processing_screen_attach_to_element_loader
            },
            'OVERLAY': {
                'processing_screen': ThreeDSMethodsLocators.processing_screen_overlay,
                'logo': ThreeDSMethodsLocators.processing_screen_overlay_logo,
                'loader': ThreeDSMethodsLocators.processing_screen_overlay_loader,
            }
        }
        for element in processing_screen_elements[processing_screen_mode].values():
            self._waits.wait_for_element_to_be_displayed(element)

    def processing_screen_is_displayed(self):
        return self._actions.is_element_displayed(ThreeDSMethodsLocators.processing_screen)

    def wait_for_processing_screen_is_displayed(self):
        self._waits.wait_until_element_presence(ThreeDSMethodsLocators.processing_screen)

    def verify_if_processing_screen_is_displayed_at_least_2_seconds(self):
        self.wait_for_processing_screen_is_displayed()
        start_time_ms = int(time() * 1000)
        # pylint: disable=bare-except
        # pylint: disable=no-else-break
        while True:
            try:
                if not self.processing_screen_is_displayed():
                    break
                elif int(time() * 1000) - start_time_ms > 30000:
                    break
            except:
                break
        stop_time_ms = int(time() * 1000)
        display_time = stop_time_ms - start_time_ms
        assertion_message = f'display time: {display_time}ms should be > 2000ms and < 30000ms'
        add_to_shared_dict(SharedDictKey.ASSERTION_MESSAGE.value, assertion_message)
        assert 1900 < display_time < 30000, assertion_message
