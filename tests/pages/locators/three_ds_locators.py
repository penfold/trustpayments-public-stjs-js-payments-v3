from dataclasses import dataclass

from selenium.webdriver.common.by import By

from utils.enums.field_type import FieldType


@dataclass
class ThreeDSMethodsLocators:


# pylint: disable=too-many-instance-attributes

    three_ds_iframe: By = (By.ID, 'tp-3ds-challenge-iframe')
    three_ds_challenge_input: By = (By.ID, 'challengeDataEntry')
    three_ds_challenge_cancel_button: By = (By.ID, 'tp-3ds-inline-view-header-button')
    three_ds_challenge_submit_button: By = (By.ID, 'tp-3ds-challenge-submit')
    three_ds_challenge_popup_cancel_button: By = (By.ID, 'tp-3ds-popup-view-header-button')
