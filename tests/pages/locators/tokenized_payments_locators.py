from dataclasses import dataclass

from selenium.webdriver.common.by import By

from utils.enums.field_type import FieldType


@dataclass
class TokenizedPaymentsLocators:
    tokenized_payment_form: By = (By.ID, 'st-form-tokenized')
    security_code_iframe: By = (By.ID, FieldType.TOKENIZED_SECURITY_CODE.value)
    security_code_label: By = (By.ID, 'st-security-code-tokenized-label')
    security_code_input: By = (By.ID, 'st-security-code-tokenized-input')
    security_code_message: By = (By.ID, 'st-security-code-tokenized-message')
    pay_btn: By = (By.ID, 'tokenized-submit-button')
