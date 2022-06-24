from enum import Enum

from pages.animated_card_page import AnimatedCardPage
from pages.apm_module_payment_page import ApmModulePaymentPage
from pages.payment_methods_page import PaymentMethodsPage
from pages.payment_methods_page_mock import PaymentMethodsPageMock
from pages.reactjs_page import ReactjsPage
from pages.three_ds_page import ThreeDsPage
from pages.visa_checkout_page import VisaCheckoutPage
from pages.tokenized_jwt_module_payment_page import TokenizedJwtModulePaymentPage
from pages.visa_ctp_page import VisaClickToPayPage


class Pages(Enum):

    PAYMENT_METHODS_PAGE = PaymentMethodsPage
    PAYMENT_METHODS_PAGE_MOCK = PaymentMethodsPageMock
    ANIMATED_CARD_PAGE = AnimatedCardPage
    VISA_CHECKOUT_PAGE = VisaCheckoutPage
    APM_MODULE_PAYMENT_PAGE = ApmModulePaymentPage
    REACTJS_PAGE = ReactjsPage
    THREE_DS_PAGE = ThreeDsPage
    TOKENIZED_JWT_MODULE_PAYMENT_PAGE = TokenizedJwtModulePaymentPage
    VISA_CTP_PAGE = VisaClickToPayPage


class PageFactory:
    def __init__(self, browser_executor, actions, reporter, configuration, waits):
        self._browser_executor = browser_executor
        self._actions = actions
        self._reporter = reporter
        self._config = configuration
        self._waits = waits

    def get_page(self, page_name):
        """Get page name method"""
        return page_name.value(browser_executor=self._browser_executor, actions=self._actions,
                               reporter=self._reporter, config=self._config, waits=self._waits)
