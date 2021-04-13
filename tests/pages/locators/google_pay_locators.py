from dataclasses import dataclass

from selenium.webdriver.common.by import By

from utils.enums.field_type import FieldType


@dataclass
class GooglePayLocators:
    # pylint: disable=too-many-instance-attributes

    # merchant input fields
    gpay_button: By = (By.CLASS_NAME, 'gpay-card-info-container black buy long en')
