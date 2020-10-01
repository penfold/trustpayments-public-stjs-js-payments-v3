"""This module is essential for executing our test against real web browser.
It provides 3 separated classes(SeleniumDriver, Driver and DriverFactory)
containing several functions which allow to create, manage and distribute
WebDriver instance which is responsible for direct connection and allows
to manipulate browser window thanks to its functions.
It is based on singleton pattern to operate on a single instance of a driver.
"""
import abc
from enum import Enum

from selenium import webdriver
from selenium.common.exceptions import WebDriverException
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.remote.webdriver import WebDriver as RemoteWebDriver

from configuration import DriverConfig


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


class DriverFactory:
    _browser: RemoteWebDriver = None

    def __init__(self, configuration):
        self._browser_name = configuration.BROWSER
        self._remote = configuration.REMOTE
        self._command_executor = configuration.COMMAND_EXECUTOR
        self._remote_capabilities = DriverConfig.get_remote_capabilities(configuration)

    def _set_browser(self) -> None:
        args = dict(browser_name=self._browser_name,
                    remote=self._remote,
                    command_executor=self._command_executor,
                    remote_capabilities=self._remote_capabilities)
        driver = SeleniumDriver(**args)  # type: ignore
        browser = driver.get_driver()
        type(self)._browser = browser

    def get_browser(self) -> RemoteWebDriver:
        if not self._browser:
            self._set_browser()
        return self._browser

    def close_browser(self) -> None:
        if self._browser:
            self._browser.quit()
        type(self)._browser = None
