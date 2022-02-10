from dataclasses import dataclass

from selenium.webdriver.common.by import By


@dataclass
class ApmModulePaymentLocators:
    # pylint: disable=too-many-instance-attributes


    # APMs
    apm_group: By = (By.ID, 'st-apm')

    @classmethod
    def get_apm_button_locator(cls, apm_type) -> By.XPATH:
        return By.XPATH, f'//div[@id=\'st-apm\']//*[@id=\'ST-APM-{apm_type}\']/..'

    @classmethod
    def get_apm_button_override_locator(cls, apm_type) -> By.XPATH:
        return By.XPATH, f'//div[@id=\'st-apm-override\']//*[@id=\'ST-APM-{apm_type}\']/..'

    # APMs simulator page
    apm_simulator_drop_down: By = By.XPATH, '//select[@name=\'result\']'
    apm_simulator_submit: By = (By.ID, 'submitbutton')

    # Sofort page
    sofort_bank_drop_down: By = (By.ID, 'MultipaysSessionSenderBankCode')
    sofort_next_btn: By = (By.XPATH, '//button[contains(text(),"Next")]')
    sofort_user_id_input: By = (By.ID, 'BackendFormLOGINNAMEUSERID')
    sofort_pin_input: By = (By.ID, 'BackendFormUSERPIN')
    sofort_confirmation_code_input: By = (By.ID, 'BackendFormTAN')
    sofort_accept_cookies_btn: By = (By.XPATH, '//div[@id=\'Modal\']//div[@id=\'modal-button-container\']/button[1]')
    sofort_cancel_btn: By = (By.XPATH, '//img[@alt=\'Cancel and return to Merchant\']')
    sofort_cancel_transaction_btn: By = (By.ID, 'CancelTransaction')

    # ZIP
    zip_cancel_btn: By = (By.XPATH, '//a[@id=\'qp-close-icon-anchor\']//span')

    # A2A
    a2a_country_dropdown: By = (By.XPATH, '//div[@aria-label=\'Select Your Country\']')
    a2a_uk_option_from_country_dropdown: By = (By.XPATH, '//div[@aria-label=\'United Kingdom\']')
    bank_selector_input: By = (By.ID, 'Bank-Selector-Input')
    ozone_modelo_bank_option: By = (By.XPATH, '//div[@aria-label=\'Ozone Modelo Test Bank\']')
    token_terms_link: By = (By.ID, 'token-terms')
    accept_btn: By = (By.XPATH, '//button[@class=\'Button Button--primary--idle\']')
    login_input: By = (By.ID, 'loginName')
    password_input: By = (By.ID, 'password')
    login_btn: By = (By.XPATH, '//a[@aria-controls=\'Login\']')
    confirm_btn: By = (By.XPATH, '//a[@aria-controls=\'Confirm\']')
    cancel_btn: By = (By.XPATH, '//a[@aria-controls=\'Cancel\']')
