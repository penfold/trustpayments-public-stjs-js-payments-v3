""" This class consist all methods related with different waits
"""
import time

from selenium.common.exceptions import TimeoutException
from selenium.webdriver.support import expected_conditions as ec
from selenium.webdriver.support.ui import WebDriverWait


class Waits:

    def __init__(self, driver, configuration):
        self._driver_browser = driver
        self._browser = driver.get_browser()
        self._timeout = configuration.TIMEOUT
        self._wait = WebDriverWait(self._browser, self._timeout)

    def wait_for_element(self, locator):
        return self._wait.until(ec.presence_of_element_located(locator))

    def wait_and_check_is_element_displayed(self, locator):
        # pylint: disable=bare-except
        try:
            self.wait_for_element_to_be_displayed(locator)
            return self._browser.find_element(*locator).is_displayed()
        except:
            return False

    def wait_for_element_to_be_displayed(self, locator, max_try: int = 20):
        # pylint: disable=bare-except

        while max_try:
            try:
                is_element_displayed = self._browser.find_element(*locator).is_displayed()
                if is_element_displayed:
                    max_try = 0
            except:
                time.sleep(0.2)
                max_try -= 1

    def wait_for_element_to_be_not_displayed(self, locator, max_try: int = 20):
        # pylint: disable=bare-except

        while max_try:
            try:
                if not self._browser.find_elements(*locator):
                    break
            except:
                pass
            time.sleep(0.2)
            max_try -= 1

    def wait_for_element_to_be_clickable(self, locator):
        return self._wait.until(ec.element_to_be_clickable(locator))

    def wait_for_element_visibility(self, locator):
        return self._wait.until(ec.visibility_of_element_located(locator))

    def wait_for_element_invisibility(self, locator):
        return self._wait.until(ec.invisibility_of_element_located(locator))

    def wait_for_text_to_be_not_present_in_element(self, locator, text):
        return self._wait.until_not(ec.text_to_be_present_in_element(locator, text))

    def wait_for_ajax(self):
        # self._wait.until(lambda driver: self._browser.execute_script
        #                  ('return jQuery.active') == 0)
        # self._wait.until(lambda driver: self._browser.execute_script
        #                  ('return document.readyState') == 'complete')
        pass

    def wait_until_alert_is_presented(self):
        try:
            return self._wait.until(ec.alert_is_present())
        except TimeoutException:
            print(f'Alert was not presented in {self._timeout} seconds')

    def wait_until_iframe_is_presented_and_switch_to_it(self, iframe_name):
        try:
            self.wait_for_element_to_be_displayed(iframe_name)
            return self._wait.until(ec.frame_to_be_available_and_switch_to_it(iframe_name))
        except TimeoutException:
            print(f'Iframe was not presented in {self._timeout} seconds')

    def switch_to_default_content(self):
        self._browser.switch_to.default_content()

    def switch_to_parent_frame(self):
        self._browser.switch_to.parent_frame()

    def wait_for_javascript(self):
        time.sleep(1)
        self._wait.until(lambda driver: self._browser.execute_script('return document.readyState') == 'complete')

    def wait_until_url_contains(self, page_url):
        try:
            return self._wait.until(ec.url_to_be(page_url))
        except TimeoutException:
            print('Timed out waiting for page url')
