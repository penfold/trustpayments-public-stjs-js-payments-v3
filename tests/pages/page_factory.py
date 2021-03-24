from pages.visa_checkout_page import VisaCheckoutPage
from pages.animated_card_page import AnimatedCardPage
from pages.payment_methods_page import PaymentMethodsPage
from pages.reactjs_page import ReactjsPage

PAGES = {
    'payment_methods_page': PaymentMethodsPage,
    'animated_card_page': AnimatedCardPage,
    'visa_checkout_page': VisaCheckoutPage,
    'reactjs_page': ReactjsPage
}


class PageFactory:
    def __init__(self, browser_executor, actions, reporter, configuration, waits):
        self._browser_executor = browser_executor
        self._actions = actions
        self._reporter = reporter
        self._config = configuration
        self._waits = waits

    def get_page(self, page_name):
        """Get page name method"""
        page_name = f'{page_name}_page'
        page_name = page_name.lower()
        page_name = page_name.replace(' ', '_')
        page = PAGES[page_name](browser_executor=self._browser_executor, actions=self._actions,
                                reporter=self._reporter, config=self._config, waits=self._waits)

        return page
