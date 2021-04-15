from dataclasses import dataclass

from selenium.webdriver.common.by import By

from utils.enums.field_type import FieldType


@dataclass
class GooglePayLocators:
    # pylint: disable=too-many-instance-attributes

    # merchant input fields
    gpay_button: By = (By.XPATH, """//*[@id="st-google-pay"]/div/button""")
    gpay_heading_text: By = (By.ID, "headingText")
    gpay_email_address_input: By = (By.ID, "identifierId")
    gpay_next_button: By = (By.XPATH, """//*[@id="identifierNext"]/div/button""")
    gpay_password_input: By = (By.XPATH, """//*[@id="password"]/div[1]/div/div[1]/input""")
