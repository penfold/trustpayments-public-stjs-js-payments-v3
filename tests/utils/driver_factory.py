"""This module is essential for executing our test against real web browser.
It provides 2 separated classes(WebDriverFactory, DriverFactory)
containing several functions which allow to create, manage and distribute
WebDriver instance which is responsible for direct connection and allows
to manipulate browser window thanks to its functions.
It is based on singleton pattern to operate on a single instance of a driver.
"""
from logging import INFO

from configuration import CONFIGURATION
from utils.logger import get_logger
from retry import retry
from selenium import webdriver
from selenium.common.exceptions import WebDriverException
from selenium.webdriver import DesiredCapabilities
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.firefox.options import Options as FirefoxOptions
from selenium.webdriver.opera.options import Options as OperaOptions
from selenium.webdriver.ie.options import Options as IEOptions
from selenium.webdriver.remote.webdriver import WebDriver as RemoteWebDriver
from msedge.selenium_tools import Edge
from msedge.selenium_tools import EdgeOptions
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.firefox import GeckoDriverManager
from webdriver_manager.opera import OperaDriverManager

LOGGER = get_logger(INFO)


def _create_chrome_web_driver(**args) -> RemoteWebDriver:
    options = args['options']
    desired_capabilities = args['capabilities']
    desired_capabilities.update(DesiredCapabilities.CHROME)
    executable_path = ChromeDriverManager().install()
    return webdriver.Chrome(
        executable_path=executable_path,
        chrome_options=options,
        desired_capabilities=desired_capabilities
    )


def _create_firefox_web_driver(**args) -> RemoteWebDriver:
    options = args['options']
    desired_capabilities = args['capabilities']
    desired_capabilities.update(DesiredCapabilities.FIREFOX)
    executable_path = GeckoDriverManager().install()
    return webdriver.Firefox(
        executable_path=executable_path,
        firefox_options=options,
        desired_capabilities=desired_capabilities
    )


def _create_opera_web_driver(**args) -> RemoteWebDriver:
    options = args['options']
    desired_capabilities = args['capabilities']
    desired_capabilities.update(DesiredCapabilities.OPERA)
    executable_path = OperaDriverManager().install()
    return webdriver.Opera(
        executable_path=executable_path,
        options=options,
        desired_capabilities=desired_capabilities
    )


def _create_ie_web_driver(**args) -> RemoteWebDriver:
    options = args['options']
    desired_capabilities = args['capabilities']
    desired_capabilities.update(DesiredCapabilities.INTERNETEXPLORER)
    executable_path = CONFIGURATION.EXECUTABLE_PATH_IE_DRIVER
    return webdriver.Ie(
        executable_path=executable_path,
        ie_options=options
    )


def _create_edge_web_driver(**args) -> RemoteWebDriver:
    options = args['options']
    options.use_chromium = True
    desired_capabilities = args['capabilities']
    desired_capabilities.update(DesiredCapabilities.EDGE)
    executable_path = CONFIGURATION.EXECUTABLE_PATH_EDGE_DRIVER
    return Edge(
        executable_path=executable_path,
        options=options
    )


def _create_safari_web_driver(**args) -> RemoteWebDriver:
    desired_capabilities = args['capabilities']
    desired_capabilities.update(DesiredCapabilities.SAFARI)
    return webdriver.Safari(desired_capabilities=desired_capabilities)


def _get_local_options(browser, headless):
    options = _set_browser_options(browser)
    options.headless = headless
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--allow-insecure-localhost')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--ignore-certificate-errors')
    options.add_argument('--remote-debugging-address=0.0.0.0')
    options.add_argument('--remote-debugging-port=9222')
    options.add_argument('--disable-gpu')
    options.add_argument("--disable-blink-features")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36")

    return options


def _set_browser_options(browser):
    browser_options = {
        'chrome': ChromeOptions(),
        'firefox': FirefoxOptions(),
        'opera': OperaOptions(),
        'ie': IEOptions(),
        'edge': EdgeOptions(),
        'safari': ChromeOptions()  # no Options for Safari driver
    }

    return browser_options[browser]


def _get_remote_capabilities(configuration):
    possible_caps = {
        'os': configuration.REMOTE_OS,
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
        'browserstack.networkLogs': 'true',
        'browserstack.console': 'errors',
        'browserstack.autoWait': 0,
        'browserstack.use_w3c': 'true',
        'ie.ensureCleanSession': 'true',
        'ie.forceCreateProcessApi': 'true',
        'resolution': '1920x1080',
        'goog:loggingPrefs': configuration.LOGGING_PREFS,
        'chromeOptions': {'args': ['disable-blink-features=AutomationControlled', 'incognito']}
    }
    capabilities = {}
    for key, value in possible_caps.items():
        if value:
            capabilities[key] = value
    return capabilities


class WebDriverFactory:
    WEB_DRIVERS = {
        'chrome': _create_chrome_web_driver,
        'firefox': _create_firefox_web_driver,
        'opera': _create_opera_web_driver,
        'ie': _create_ie_web_driver,
        'edge': _create_edge_web_driver,
        'safari': _create_safari_web_driver
    }

    @classmethod
    @retry(WebDriverException, tries=3, delay=10, logger=LOGGER)
    def create_web_driver(cls, remote, browser, command_executor, configuration, headless) -> RemoteWebDriver:
        if remote:
            return cls._create_remote_web_driver(command_executor, configuration)
        return cls._create_local_web_driver(browser, headless, configuration.LOGGING_PREFS)

    @classmethod
    def _create_remote_web_driver(cls, command_executor, configuration) -> RemoteWebDriver:
        remote_capabilities = _get_remote_capabilities(configuration)
        return webdriver.Remote(command_executor=command_executor, desired_capabilities=remote_capabilities)

    @classmethod
    def _create_local_web_driver(cls, browser, headless, logging_preferences) -> RemoteWebDriver:
        if browser not in cls.WEB_DRIVERS:
            raise RuntimeError(f'Unknown browser name: {browser}')

        return cls.WEB_DRIVERS[browser](
            options=_get_local_options(browser, headless),
            capabilities={'goog:loggingPrefs': logging_preferences}
        )


class DriverFactory:
    _driver: RemoteWebDriver = None

    def __init__(self, configuration):
        self._browser_name = configuration.BROWSER
        self._remote = configuration.REMOTE
        self._command_executor = configuration.COMMAND_EXECUTOR
        self._configuration = configuration

    def get_driver(self) -> RemoteWebDriver:
        if not self._driver:
            type(self)._driver = self._create_driver()
        return self._driver

    def close_browser(self):
        if self._driver:
            LOGGER.info('CLOSING BROWSER')
            self._driver.quit()
        type(self)._driver = None

    def _create_driver(self) -> RemoteWebDriver:
        driver = WebDriverFactory.create_web_driver(
            browser=self._browser_name,
            remote=self._remote,
            command_executor=self._command_executor,
            configuration=self._configuration,
            headless=self._configuration.HEADLESS
        )

        if not self._configuration.REMOTE_DEVICE:
            driver.maximize_window()
        return driver
