from dataclasses import dataclass

from selenium.webdriver.common.by import By


@dataclass
class VisaClickTwoPayLocators:
    visa_click_two_pay_button: By = (By.ID, 'click2pay')
    visa_click_two_pay_iframe: By = (By.ID, 'vcop-dcf')
    visa_click_two_pay_email_field: By = (By.ID, 'email')
    visa_click_two_pay_continue_btn: By = (By.NAME, 'btnContinue')
    visa_click_two_pay_name_field: By = (By.ID, "firstName")
    visa_click_two_pay_surname: By = (By.ID, "lastName")
    visa_click_two_pay_address_line_1: By = (By.ID, "line1")
    visa_click_two_pay_city_address: By = (By.ID, "city")
    visa_click_two_pay_state_field: By = (By.ID, "stateProvinceCode")
    visa_click_two_pay_postal_code: By = (By.ID, "postalCode")
    visa_click_two_pay_phone_number_field: By = (By.ID, "phone-number-field")
    visa_click_two_pay_phone_finish_setup_header: By = (By.XPATH, '//*[@id="app"]/div/div[2]/div/div/section/main/div[2]/div[2]/div/div/section/h1')
