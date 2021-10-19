from pages.base_page import BasePage
from pages.locators.payment_methods_locators import PaymentMethodsLocators


class ApmModulePaymentPage(BasePage):

    def select_zip_payment_method(self):
        self._waits.wait_for_element_to_be_clickable(PaymentMethodsLocators.zip_button)
        self._actions.click(PaymentMethodsLocators.zip_button)

    def scroll_to_apms(self):
        self._actions.scroll_directly_to_element(PaymentMethodsLocators.zip_button)
