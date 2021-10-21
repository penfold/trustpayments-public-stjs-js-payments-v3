"""BasePage is a parent class for each page class then this way of implementation allow us
to use his self attributes inside typical page."""
from urllib.parse import urlparse
from pages.locators.payment_methods_locators import PaymentMethodsLocators
from assertpy import assert_that
from utils.enums.shared_dict_keys import SharedDictKey
from utils.helpers.request_executor import add_to_shared_dict


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

    def open_page(self, url):
        self._browser_executor.open_page(url)

    def open_page_with_safari_issue_fix(self, url):
        self.open_page(url)
        if len(self._actions.find_elements(PaymentMethodsLocators.not_private_connection_text)) > 0:
            self._browser_executor.execute_script('browserstack_executor: {"action": "acceptSsl"}')
            self._browser_executor.open_page(url)
        if url not in self._browser_executor.get_page_url():
            self.open_page(url)

    def stop_page(self):
        self._browser_executor.stop_browser()

    def scroll_to_bottom(self):
        self._browser_executor.scroll_to_bottom()

    def scroll_to_top(self):
        self._browser_executor.scroll_to_top()

    def validate_base_url(self, url: str):
        self._waits.wait_for_javascript()
        self._waits.wait_until_url_starts_with(url)
        actual_url = self._browser_executor.get_page_url()
        parsed_url = urlparse(actual_url)
        assertion_message = f'Url hostname is not correct, should be: "{url}" but is: "{parsed_url.hostname}"'
        add_to_shared_dict(SharedDictKey.ASSERTION_MESSAGE.value, assertion_message)
        assert_that(parsed_url.hostname).is_equal_to(url)
