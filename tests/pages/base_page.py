"""BasePage is a parent class for each page class then this way of implementation allow us
to use his self attributes inside typical page."""
from pages.locators.payment_methods_locators import PaymentMethodsLocators


class BasePage:
    def __init__(self, browser_executor, actions, reporter, config, waits):
        self._browser_executor = browser_executor
        self._actions = actions
        self._reporter = reporter
        self._page_url = config.URL.BASE_URL
        self._waits = waits
        self._configuration = config

    def open_self_page(self):
        self._browser_executor.open_page(self._page_url)

    def open_page_with_not_private_connection_check(self, url):
        self._browser_executor.open_page(url)
        if len(self._actions.find_elements(PaymentMethodsLocators.not_private_connection_text)) > 0:
            self._browser_executor.execute_script('browserstack_executor: {"action": "acceptSsl"}')
            self._browser_executor.open_page(url)

    def open_page(self, url):
        self._browser_executor.open_page(url)
        self._waits.wait_for_javascript()
        if len(self._actions.find_elements(PaymentMethodsLocators.not_private_connection_text)) > 0:
            self._browser_executor.execute_script('browserstack_executor: {"action": "acceptSsl"}')
            self._browser_executor.open_page(url)
        if self._browser_executor.get_page_url().replace('%22', '"') not in url:
            self._browser_executor.open_page(url)

    def stop_page(self):
        self._browser_executor.stop_browser()

    def scroll_to_bottom(self):
        self._browser_executor.scroll_to_bottom()

    def scroll_to_top(self):
        self._browser_executor.scroll_to_top()
