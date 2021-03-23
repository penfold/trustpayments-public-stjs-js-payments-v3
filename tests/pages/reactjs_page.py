from pages.locators.reactjs_app_locators import ReactJsAppLocators
from pages.base_page import BasePage


class ReactjsPage(BasePage):

    def get_page_title(self):
        page_title = self._browser_executor.get_page_title()
        return page_title

    def click_personal_data_tab(self):
        self._browser_executor.wait_for_element_to_be_clickable(ReactJsAppLocators.personal_data_tab)
        self._actions.click(ReactJsAppLocators.personal_data_tab)
        self._browser_executor.wait_for_element_to_be_displayed(ReactJsAppLocators.personal_data_title)

    def click_home_tab(self):
        self._browser_executor.wait_for_element_to_be_clickable(ReactJsAppLocators.home_tab)
        self._actions.click(ReactJsAppLocators.home_tab)

    def click_payment_tab(self):
        self._browser_executor.wait_for_element_to_be_clickable(ReactJsAppLocators.payment_tab)
        self._actions.click(ReactJsAppLocators.payment_tab)
