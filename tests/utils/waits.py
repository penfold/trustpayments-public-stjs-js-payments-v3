""" This class consist all methods related with different waits
"""
import time

from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as ec
from selenium.webdriver.support.ui import WebDriverWait


class Waits:

    def __init__(self, driver_factory, configuration):
        self._driver_factory = driver_factory
        self._driver = driver_factory.get_driver()
        self._timeout = int(configuration.TIMEOUT)
        self._device_type = configuration.REMOTE_DEVICE
        self._wait = WebDriverWait(self._driver, self._timeout)

    def wait_for_element(self, locator):
        return self._wait.until(ec.presence_of_element_located(locator))

    def wait_and_check_is_element_displayed(self, locator):
        # pylint: disable=bare-except
        try:
            self.wait_for_element_to_be_displayed(locator)
            return True
        except:
            return False

    def wait_for_element_to_be_displayed(self, locator, max_try: int = 180):
        # pylint: disable=bare-except

        while max_try:
            try:
                is_element_displayed = self._driver.find_element(*locator).is_displayed()
                if is_element_displayed:
                    max_try = 0
                    return
                else:
                    time.sleep(0.5)
                    max_try -= 1
            except:
                time.sleep(0.5)
                max_try -= 1
        raise Exception('Element not found within timeout')

    def wait_for_element_with_id_to_be_displayed(self, locator, max_try: int = 200):
        # pylint: disable=bare-except

        while max_try:
            try:
                is_element_displayed = self._driver.find_element(By.ID, locator).is_displayed()
                if is_element_displayed:
                    max_try = 0
                    return
                else:
                    max_try -= 1
            except:
                time.sleep(0.5)
                max_try -= 1
        raise Exception('Element not found within timeout')

    def wait_for_element_to_be_not_displayed(self, locator, max_try: int = 20):
        # pylint: disable=bare-except

        while max_try:
            try:
                if not self._driver.find_elements(*locator):
                    break
            except:
                pass
            time.sleep(0.5)
            max_try -= 1

    def wait_for_element_to_be_clickable(self, locator):
        return self._wait.until(ec.element_to_be_clickable(locator))

    def wait_for_element_visibility(self, locator):
        return self._wait.until(ec.visibility_of_element_located(locator))

    def wait_for_element_invisibility(self, locator):
        return self._wait.until(ec.invisibility_of_element_located(locator))

    def wait_for_text_to_be_not_present_in_element(self, locator, text):
        return self._wait.until_not(ec.text_to_be_present_in_element(locator, text))

    def wait_until_alert_is_presented(self):
        try:
            return self._wait.until(ec.alert_is_present())
        except TimeoutException:
            print(f'Alert was not presented in {self._timeout} seconds')

    def wait_until_iframe_is_presented_and_switch_to_it(self, iframe_name):
        # pylint: disable=bare-except
        max_try = 10
        if 'iP' in self._device_type:
            max_try = 180
        while max_try:
            try:
                return self._wait.until(ec.frame_to_be_available_and_switch_to_it(iframe_name))
            except:
                time.sleep(1)
            max_try -= 1
        raise Exception('Iframe was unavailable within timeout')

    def switch_to_default_content(self):
        self._driver.switch_to.default_content()

    def switch_to_parent_frame(self):
        self._driver.switch_to.parent_frame()

    def wait_for_javascript(self):
        time.sleep(1)
        self._wait.until(lambda driver: self._driver.execute_script('return document.readyState') == 'complete')

    def wait_until_url_contains(self, page_url, max_try: int = 60):
        # pylint: disable=bare-except
        actual_url = self._driver.current_url
        while max_try:
            try:
                if page_url in self._driver.current_url:
                    return
            except:
                actual_url = self._driver.current_url
            time.sleep(0.5)
            max_try -= 1
        raise Exception(f'Url didnt contain expected phrase within timeout, current url: "{actual_url}"')

    def wait_until_url_starts_with(self, page_url, max_try: int = 60):
        # pylint: disable=bare-except
        actual_url = self._driver.current_url
        if 'https://' not in page_url:
            page_url = f'https://{page_url}'
        while max_try:
            try:
                if self._driver.current_url.startswith(page_url):
                    return
            except:
                actual_url = self._driver.current_url
            time.sleep(0.5)
            max_try -= 1
        raise Exception(f'Url didnt start with expected phrase within timeout, current url: "{actual_url}"')
