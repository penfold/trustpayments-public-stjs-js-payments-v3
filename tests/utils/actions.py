""" This class consist all necessary web elements extensions methods
"""
from selenium.common.exceptions import StaleElementReferenceException
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import Select

from configuration import CONFIGURATION
from pages.locators.payment_methods_locators import PaymentMethodsLocators


class Actions:
    # pylint: disable=too-many-public-methods

    def __init__(self, driver_factory, waits):
        self._driver = driver_factory.get_driver()
        self._waits = waits

    def find_element(self, locator):
        # self.wait_for_ajax()
        element = self._driver.find_element(*locator)
        # * collects all the positional arguments in a tuple
        return element

    def find_elements(self, locator):
        # self.wait_for_ajax()
        elements = self._driver.find_elements(*locator)
        return elements

    def is_element_displayed(self, locator):
        # pylint: disable=bare-except
        try:
            element = self._driver.find_element(*locator).is_displayed()
            return element is not None
        except:
            return False

    def is_iframe_available_in_page_source(self, iframe_name):
        # pylint: disable=bare-except
        try:
            # This can be redundant according what is in selenium switch_to method but not have time to check it now
            if isinstance(iframe_name, tuple):
                iframe_name = self.find_element(iframe_name)

            self._driver.switch_to.frame(iframe_name)
            self.switch_to_default_content()
            return True
        except:
            return False

    def switch_to_iframe_and_wait_for_element_to_be_displayed(self, iframe_name, locator):
        self.switch_to_iframe(iframe_name)
        self._waits.wait_for_element_to_be_displayed(locator)
        self.switch_to_default_iframe()

    def is_checkbox_selected(self, locator):
        element = self.find_element(locator)
        return element.is_selected()

    def is_element_enabled(self, locator):
        return self.find_element(locator).is_enabled()

    def switch_to_iframe_and_check_is_element_enabled(self, iframe_name, locator):
        self.switch_to_iframe(iframe_name)
        is_enabled = self.is_element_enabled(locator)
        self.switch_to_default_iframe()
        return is_enabled

    def send_keys(self, locator, string):
        self._waits.wait_for_element_to_be_displayed(locator)
        element = self.find_element(locator)
        element.send_keys(string)

    def send_key_one_by_one(self, locator, string):
        # pylint: disable=invalid-name
        for x in str(string):
            self.send_keys(locator, x)

    def switch_to_iframe_and_send_keys(self, iframe_name, locator, string):
        self.switch_to_iframe(iframe_name)
        element = self.find_element(locator)
        element.send_keys(string)
        self.switch_to_default_iframe()

    def switch_to_iframe_and_send_keys_one_by_one(self, iframe_name, locator, string):
        self.switch_to_iframe(iframe_name)
        if string != 'None':
            self.send_key_one_by_one(locator, string)
        self.switch_to_default_iframe()

    def switch_to_iframe_and_send_keys_by_java_script(self, iframe_name, locator, string):
        self._driver.execute_script(
            f'window.frames[\'{iframe_name}\'].document.getElementById(\'{locator}\').value=\'{string}\'')
        self.switch_to_default_iframe()

    def click(self, locator):
        self._waits.wait_for_element_to_be_displayed(locator)
        element = self.find_element(locator)
        if 'Catalina' in CONFIGURATION.REMOTE_OS_VERSION:
            self._driver.execute_script('arguments[0].click();', element)
        element.click()

    def click_by_javascript(self, locator):
        element = self.find_element(locator)
        self._driver.execute_script('arguments[0].click();', element)

    def switch_to_iframe_and_click(self, iframe_name, locator):
        self.switch_to_iframe(iframe_name)
        element = self.find_element(locator)
        element.click()
        self.switch_to_default_iframe()

    def get_value(self, locator):
        try:
            return self.find_element(locator).get_attribute('value')
        except StaleElementReferenceException:
            return self.find_element(locator).get_attribute('value')

    def get_text(self, locator):
        try:
            return self.find_element(locator).text
        except StaleElementReferenceException:
            return self.find_element(locator).text

    def get_text_from_last_element(self, locator):
        try:
            self._waits.wait_until_element_presence(locator)
            return self.find_elements(locator)[-1].text
        except StaleElementReferenceException:
            return self.find_element(locator)[-1].text

    def get_text_with_wait(self, locator):
        self._waits.wait_until_element_presence(locator)
        element = self.find_element(locator)
        return element.text

    def get_text_excluding_children(self, locator):
        element = self.find_element(locator)
        extracted_text = self._driver.execute_script('''
         var parent = arguments[0];
         var child = parent.firstChild;
         var ret = "";
         while(child) {
             if (child.nodeType === Node.TEXT_NODE)
                 ret += child.textContent;
             child = child.nextSibling;
         }
         return ret;
         ''', element)
        return extracted_text

    def switch_to_iframe_and_get_text(self, iframe_name, locator):
        self.switch_to_iframe(iframe_name)
        self._waits.wait_for_element_to_be_displayed(locator)
        element = self.get_text_excluding_children(locator)
        self.switch_to_default_iframe()
        return element

    def get_css_value_with_wait(self, locator, property_name):
        self._waits.wait_for_element_to_be_displayed(locator)
        element = self.find_element(locator)
        css_value = element.value_of_css_property(property_name)
        return css_value

    def switch_to_iframe_and_get_css_value(self, iframe_name, locator, property_name):
        self.switch_to_iframe(iframe_name)
        element = self.find_element(locator)
        css_value = element.value_of_css_property(property_name)
        self.switch_to_default_iframe()
        return css_value

    def clear_input(self, locator):
        self._waits.wait_for_element_to_be_displayed(locator)
        element = self.find_element(locator)
        element.clear()

    def switch_to_iframe_and_clear_input(self, iframe_name, locator):
        self.switch_to_iframe(iframe_name)
        element = self.find_element(locator)
        element.clear()
        self.switch_to_default_iframe()

    def get_element_attribute(self, locator, attribute_name):
        element = self.find_element(locator)
        return element.get_attribute(attribute_name)

    def switch_to_iframe_and_get_element_attribute(self, iframe_name, locator, attribute_name):
        self.switch_to_iframe(iframe_name)
        element = self.find_element(locator)
        attribute = element.get_attribute(attribute_name)
        self.switch_to_default_iframe()
        return attribute

    def enter(self, locator):
        element = self.find_element(locator)
        element.send_keys(Keys.RETURN)

    def switch_to_iframe_and_press_enter(self, iframe_name, locator):
        self.switch_to_iframe(iframe_name)
        element = self.find_element(locator)
        element.send_keys(Keys.RETURN)
        self.switch_to_default_iframe()

    def delete_on_input(self, locator):
        element = self.find_element(locator)
        element.send_keys(Keys.BACK_SPACE)

    def scroll_directly_to_element(self, locator):
        element = self.find_element(locator)
        self._driver.execute_script('arguments[0].scrollIntoView();', element)

    def select_element_from_list(self, locator, element_number):
        select = Select(self._driver.find_elements(*locator))
        select.select_by_index(element_number)

    def select_element_from_list_by_value(self, locator: tuple, element_value: str) -> None:
        select = Select(self._driver.find_element(*locator))
        select.select_by_value(value=element_value)

    def select_element_by_text(self, locator, text):
        select = Select(self._driver.find_element(*locator))
        select.select_by_visible_text(text)

    def switch_to_iframe(self, iframe_name):
        self._waits.wait_until_iframe_is_presented_and_switch_to_it(iframe_name)

    def switch_to_default_content(self):
        self._driver.switch_to.default_content()

    def switch_to_default_iframe(self):
        self.switch_to_default_content()
        if len(self._driver.find_elements(By.ID, 'st-parent-frame')) > 0:
            self.switch_to_iframe(PaymentMethodsLocators.parent_iframe)

    def switch_to_parent_iframe(self):
        self._driver.switch_to.parent_frame()
