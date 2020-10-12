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
    def __init__(self, executor, extensions, reporter, configuration, wait):
        self._executor = executor
        self._action = extensions
        self._reporter = reporter
        self._config = configuration
        self._wait = wait

    def get_page(self, page_name):
        """Get page name method"""
        page_name = f'{page_name}_page'
        page_name = page_name.lower()
        page_name = page_name.replace(' ', '_')
        page = PAGES[page_name](executor=self._executor, extensions=self._action,
                                reporter=self._reporter, config=self._config, wait=self._wait)

        return page
