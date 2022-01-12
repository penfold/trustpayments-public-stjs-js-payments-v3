""" This class consist all methods related with browser activities"""
from utils.configurations.jwt_generator import encode_jwt_for_json
from utils.enums.config_jwt import ConfigJwt


class BrowserExecutor:
    # pylint: disable=too-many-public-methods

    def __init__(self, driver_factory, waits):
        self._driver_factory = driver_factory
        self._driver = driver_factory.get_driver()
        self._waits = waits

    def open_page(self, page_url):
        self._driver.get(page_url)

    def open_page_with_jwt_config(self, page_url, jwt_json_config: ConfigJwt):
        jwt = encode_jwt_for_json(jwt_json_config)
        self._driver.get(page_url + f'?jwt={jwt}')

    def refresh(self):
        self._driver.refresh()

    def close_browser(self):
        self._driver_factory.close_browser()

    def stop_browser(self):
        self._driver.execute_script('window.stop();')

    def clear_cookies(self):
        self._driver.delete_all_cookies()

    def get_cookie_by_name(self, cookie_name):
        return self._driver.get_cookie(cookie_name)

    def is_cookie_exist(self, cookie_name):
        return bool(self.get_cookie_by_name(cookie_name))

    def switch_to_alert(self):
        self._waits.wait_until_alert_is_presented()
        alert = self._driver.switch_to_alert()
        return alert

    def accept_alert(self):
        alert = self.switch_to_alert()
        alert.accept()

    def dismiss_alert(self):
        alert = self.switch_to_alert()
        alert.dismiss()

    def get_alert_text(self):
        alert = self.switch_to_alert()
        return alert.text

    def send_text_to_alert(self, text):
        alert = self.switch_to_alert()
        alert.sendKeys(text)

    def get_page_url(self):
        return self._driver.current_url

    def get_page_title(self):
        title = self._driver.title
        return title

    def scroll_horizontally(self):
        self._driver.execute_script('window.scrollBy(100,0)')  # Scroll 100px to the right

    def scroll_into_view(self, element):
        self._driver.execute_script('arguments[0].scrollIntoView();', element)

    def scroll_to_bottom(self):
        self._driver.execute_script('window.scrollTo(0, document.body.scrollHeight)')

    def scroll_to_top(self):
        self._driver.execute_script('window.scrollTo(0, -document.body.scrollHeight)')

    def execute_script(self, script):
        self._driver.execute_script(script)

    def clear_storage(self):
        self._driver.execute_script('window.localStorage.clear();')

    def get_session_id(self):
        return self._driver.session_id
