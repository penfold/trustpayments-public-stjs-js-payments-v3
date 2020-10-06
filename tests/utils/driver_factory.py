"""This module is essential for executing our test against real web browser.
It provides 3 separated classes(SeleniumDriver, Driver and DriverFactory)
containing several functions which allow to create, manage and distribute
WebDriver instance which is responsible for direct connection and allows
to manipulate browser window thanks to its functions.
It is based on singleton pattern to operate on a single instance of a driver.
"""
import abc
from enum import Enum
from logging import INFO

from selenium import webdriver
from selenium.common.exceptions import WebDriverException
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.remote.webdriver import WebDriver as RemoteWebDriver

from logger import get_logger

LOGGER = get_logger(INFO)


class Drivers(Enum):
    chrome = webdriver.Chrome
    firefox = webdriver.Firefox
    ie = webdriver.Ie
    edge = webdriver.Edge
    safari = webdriver.Safari
    phantom = webdriver.PhantomJS


class DesiredCapabilities(Enum):
    chrome = webdriver.DesiredCapabilities.CHROME
    firefox = webdriver.DesiredCapabilities.FIREFOX
    ie = webdriver.DesiredCapabilities.INTERNETEXPLORER
    edge = webdriver.DesiredCapabilities.EDGE
    phantom = webdriver.DesiredCapabilities.PHANTOMJS
    safari = webdriver.DesiredCapabilities.SAFARI


class Driver:
    __metaclass__ = abc.ABCMeta

    def __init__(self, browser_name, remote, command_executor, remote_capabilities):
        self._browser_name = browser_name
        self._remote = remote
        self._remote_capabilities = remote_capabilities
        self._command_executor = command_executor

    @abc.abstractmethod
    def get_driver(self):
        pass

    @staticmethod
    def _get_desired_capabilities(capability):
        desired_capabilities = DesiredCapabilities[capability]
        return desired_capabilities.value.copy()


class SeleniumDriver(Driver):
    def get_driver(self) -> RemoteWebDriver:
        max_try = 3
        while max_try:
            try:
                return self._create_remote() if self._remote else self._create_local()
            except WebDriverException as exception:
                print(str(exception) + '  - trying to open browser again')
                max_try -=1

    def _create_remote(self) -> RemoteWebDriver:
        remote_driver = webdriver.Remote(command_executor=self._command_executor,
                                         desired_capabilities=self._remote_capabilities)
        return remote_driver

    def _create_local(self) -> RemoteWebDriver:
        driver = Drivers[self._browser_name]
        options = Options()

        options.headless = True
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--allow-insecure-localhost')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--ignore-certificate-errors')
        options.add_argument('--remote-debugging-address=0.0.0.0')
        options.add_argument('--remote-debugging-port=9222')

        return driver.value(chrome_options=options)


def _get_remote_capabilities(configuration):
    # pylint: disable=unused-variable
    network_logs = 'true'
    possible_caps = {'os': configuration.REMOTE_OS,
                     'os_version': configuration.REMOTE_OS_VERSION,
                     'browserName': configuration.REMOTE_BROWSER,
                     'browserVersion': configuration.REMOTE_BROWSER_VERSION,
                     'browserstack.local': configuration.BROWSERSTACK_LOCAL,
                     'browserstack.localIdentifier': configuration.BROWSERSTACK_LOCAL_IDENTIFIER,
                     'device': configuration.REMOTE_DEVICE,
                     'real_mobile': configuration.REMOTE_REAL_MOBILE,
                     'acceptSslCerts': configuration.ACCEPT_SSL_CERTS,
                     'project': configuration.PROJECT_NAME,
                     'build': configuration.BUILD_NAME,
                     'browserstack.debug': configuration.BROWSERSTACK_DEBUG,
                     'browserstack.selenium_version': configuration.BROWSERSTACK_SELENIUM_VERSION,
                     'browserstack.appium_version': configuration.BROWSERSTACK_APPIUM_VERSION,
                     'browserstack.chrome.driver': configuration.BROWSERSTACK_CHROME_DRIVER,
                     'browserstack.ie.driver': configuration.BROWSERSTACK_IE_DRIVER,
                     'browserstack.safari.driver': configuration.BROWSERSTACK_SAFARI_DRIVER,
                     'browserstack.firefox.driver': configuration.BROWSERSTACK_FIREFOX_DRIVER,
                     'browserstack.networkLogs': network_logs,
                     'browserstack.console': 'errors',
                     'ie.ensureCleanSession': 'true',
                     'ie.forceCreateProcessApi': 'true',
                     'resolution': '1920x1080'
                     }
    capabilities = {}
    for key, value in possible_caps.items():
        if value:
            capabilities[key] = value
    return capabilities


class DriverFactory:
    _browser: RemoteWebDriver = None

    def __init__(self, configuration):
        self._browser_name = configuration.BROWSER
        self._remote = configuration.REMOTE
        self._command_executor = configuration.COMMAND_EXECUTOR
        self._configuration = configuration

    def _set_browser(self) -> None:
        self._remote_capabilities = _get_remote_capabilities(self._configuration)
        args = dict(browser_name=self._browser_name,
                    remote=self._remote,
                    command_executor=self._command_executor,
                    remote_capabilities=self._remote_capabilities)
        driver = SeleniumDriver(**args)  # type: ignore
        browser = driver.get_driver()
        type(self)._browser = browser
        if not self._configuration.REMOTE_DEVICE or self._configuration.REMOTE_DEVICE is None:
            self._browser.maximize_window()

    def get_browser(self) -> RemoteWebDriver:
        if not self._browser:
            self._set_browser()
        return self._browser

    def close_browser(self) -> None:
        if self._browser:
            LOGGER.info('CLOSING BROWSER')
            self._browser.quit()
        type(self)._browser = None
