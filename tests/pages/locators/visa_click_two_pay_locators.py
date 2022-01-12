from dataclasses import dataclass

from selenium.webdriver.common.by import By


@dataclass
class VisaClickTwoPayLocators:
    visa_click_two_pay_button: By = (By.ID, 'click2pay')
