from configuration import CONFIGURATION
from pages.locators.animated_card_locators import AnimatedCardLocators
from pages.locators.payment_methods_locators import PaymentMethodsLocators
from pages.base_page import BasePage
from pages.locators.visa_click_two_pay_locators import VisaClickTwoPayLocators
from utils.enums.field_type import FieldType
from utils.enums.shared_dict_keys import SharedDictKey
from utils.helpers import gmail_service
from utils.helpers.request_executor import add_to_shared_dict
from utils.helpers.resources_reader import get_translation_from_json


class VisaClickTwoPay(BasePage):

    def click_visa_click_two_pay_button(self, context):
        if 'switch_to_parent_iframe' in context.scenario.tags:
            self._actions.switch_to_default_iframe()
        self._waits.wait_for_element_to_be_clickable(VisaClickTwoPayLocators.visa_click_two_pay_button)
        self._actions.click(VisaClickTwoPayLocators.visa_click_two_pay_button)
        self._actions.click(VisaClickTwoPayLocators.visa_click_two_pay_button)

    def get_one_time_password(self):
        mail_ids = gmail_service.get_unseen_mail_ids_with_wait(5)
        mail_index = len(mail_ids)
        code = gmail_service.get_verification_code_from_email_subject(str(int(mail_ids[mail_index - 1])))
        return code
