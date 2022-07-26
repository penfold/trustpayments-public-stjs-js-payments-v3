from dataclasses import dataclass

from selenium.webdriver.common.by import By


@dataclass
class ThreeDSMethodsLocators:
    # pylint: disable=too-many-instance-attributes

    three_ds_iframe: By = (By.ID, 'tp-3ds-challenge-iframe')
    three_ds_challenge_input: By = (By.NAME, 'challengeDataEntry')
    three_ds_challenge_alert: By = (By.CLASS_NAME, 'alert')
    three_ds_challenge_inline_cancel_button: By = (By.ID, 'tp-3ds-inline-view-header-button')
    three_ds_challenge_submit_button: By = (By.CSS_SELECTOR, 'input.button.primary')
    three_ds_challenge_popup_cancel_button: By = (By.ID, 'tp-3ds-popup-view-header-button')
    three_ds_v1_challenge_input: By = (By.NAME, 'st_username')
    three_ds_v1_challenge_submit_button: By = (By.CSS_SELECTOR, 'input[type=submit]')

    # processing screen

    processing_screen: By = (By.CSS_SELECTOR, '.tp-3ds-processing-screen')
    processing_screen_attach_to_element: By = (By.CSS_SELECTOR, 'fieldset.tp-3ds-processing-screen')
    processing_screen_attach_to_element_logo: By = (
    By.CSS_SELECTOR, 'fieldset.tp-3ds-processing-screen div.tp-3ds-processing-screen-logo')
    processing_screen_attach_to_element_loader: By = (
    By.CSS_SELECTOR, 'fieldset.tp-3ds-processing-screen div.tp-3ds-processing-screen-loader')
    processing_screen_overlay: By = (By.CSS_SELECTOR, 'body.tp-3ds-processing-screen')
    processing_screen_overlay_logo: By = (
    By.CSS_SELECTOR, 'body.tp-3ds-processing-screen div.tp-3ds-processing-screen-logo')
    processing_screen_overlay_loader: By = (
    By.CSS_SELECTOR, 'body.tp-3ds-processing-screen div.tp-3ds-processing-screen-loader')
