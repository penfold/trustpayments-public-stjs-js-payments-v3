"""BasePage is a parent class for each page class then this way of implementation allow us
to use his self attributes inside typical page."""
from configuration import CONFIGURATION
from locators.payment_methods_locators import PaymentMethodsLocators
from utils.enums.field_type import FieldType


class BasePage:
    def __init__(self, executor, extensions, reporter, config, wait):
        self._executor = executor
        self._action = extensions
        self._reporter = reporter
        self._page_url = config.URL.BASE_URL
        self._waits = wait
        self._configuration = config

    def open_self_page(self):
        self._executor.open_page(self._page_url)

    def open_page(self, url):
        self._executor.open_page(url)

    def stop_page(self):
        self._executor.stop_browser()

    def scroll_to_bottom(self):
        self._executor.scroll_to_bottom()

    def scroll_to_top(self):
        self._executor.scroll_to_top()

    def wait_for_parent_iframe(self):
        if 'Edge' in CONFIGURATION.REMOTE_BROWSER:
            self._waits.wait_until_iframe_is_presented_and_switch_to_it(PaymentMethodsLocators.security_code_iframe)
        else:
            self._waits.wait_until_iframe_is_presented_and_switch_to_it(FieldType.SECURITY_CODE.value)
        self._action.switch_to_default_iframe()

    def wait_for_iframe(self):
        if 'Edge' not in CONFIGURATION.REMOTE_BROWSER:
            self._waits.wait_until_iframe_is_presented_and_switch_to_it(FieldType.SECURITY_CODE.value)
            self._waits.switch_to_default_content()
