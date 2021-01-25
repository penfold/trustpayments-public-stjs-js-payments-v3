"""This module is essential for executing our test against real web browser.
It provides 2 separated classes(WebDriverFactory, DriverFactory)
containing several functions which allow to create, manage and distribute
WebDriver instance which is responsible for direct connection and allows
to manipulate browser window thanks to its functions.
It is based on singleton pattern to operate on a single instance of a driver.
"""
from logging import INFO

from logger import get_logger
from retry import retry
from selenium import webdriver
from selenium.common.exceptions import WebDriverException
from selenium.webdriver import DesiredCapabilities
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.remote.webdriver import WebDriver as RemoteWebDriver
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.firefox import GeckoDriverManager
from webdriver_manager.microsoft import EdgeChromiumDriverManager, IEDriverManager
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
    executable_path = IEDriverManager().install()
    return webdriver.Ie(
        executable_path=executable_path,
        ie_options=options,
        desired_capabilities=desired_capabilities
    )


def _create_edge_web_driver(**args) -> RemoteWebDriver:
    desired_capabilities = args['capabilities']
    desired_capabilities.update(DesiredCapabilities.EDGE)
    executable_path = EdgeChromiumDriverManager().install()
    return webdriver.Edge(
        executable_path=executable_path,
        capabilities=desired_capabilities
    )


def _create_safari_web_driver(**args) -> RemoteWebDriver:
    desired_capabilities = args['capabilities']
    desired_capabilities.update(DesiredCapabilities.SAFARI)
    return webdriver.Safari(desired_capabilities=desired_capabilities)


def _create_phantom_web_driver(**args) -> RemoteWebDriver:
    desired_capabilities = args['capabilities']
    desired_capabilities.update(DesiredCapabilities.PHANTOMJS)
    return webdriver.PhantomJS(desired_capabilities=desired_capabilities)


def _get_local_options(headless):
    options = Options()
    options.headless = headless
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--allow-insecure-localhost')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--ignore-certificate-errors')
    options.add_argument('--remote-debugging-address=0.0.0.0')
    options.add_argument('--remote-debugging-port=9222')
    return options


def _get_remote_capabilities(configuration):
    # pylint: disable=unused-variable
    network_logs = 'true'
    screen_resolution = '1920x1080'
    accept_ssl_certs = True
    # disabling network logs on Safari as they are not accessible for this browser and cause browser instability

    if 'Windows' not in configuration.REMOTE_OS:
        screen_resolution = '1920x1440'

    if 'internet explorer' in configuration.REMOTE_BROWSER:
        accept_ssl_certs = 1


    possible_caps = {
        # 'os': configuration.REMOTE_OS,
        # 'os_version': configuration.REMOTE_OS_VERSION,
        'platformName': configuration.REMOTE_OS + ' ' + configuration.REMOTE_OS_VERSION,
        'browserName': configuration.REMOTE_BROWSER,
        'browserVersion': configuration.REMOTE_BROWSER_VERSION,
        # 'browserstack.local': configuration.BROWSERSTACK_LOCAL,
        # 'browserstack.localIdentifier': configuration.BROWSERSTACK_LOCAL_IDENTIFIER,
        'device': configuration.REMOTE_DEVICE,
        'real_mobile': configuration.REMOTE_REAL_MOBILE,
        'acceptSslCerts': accept_ssl_certs,
        'project': configuration.PROJECT_NAME,
        # 'browserstack.debug': configuration.BROWSERSTACK_DEBUG,
        # 'browserstack.selenium_version': configuration.BROWSERSTACK_SELENIUM_VERSION,
        # 'browserstack.appium_version': configuration.BROWSERSTACK_APPIUM_VERSION,
        # 'browserstack.chrome.driver': configuration.BROWSERSTACK_CHROME_DRIVER,
        # 'browserstack.ie.driver': configuration.BROWSERSTACK_IE_DRIVER,
        # 'browserstack.safari.driver': configuration.BROWSERSTACK_SAFARI_DRIVER,
        # 'browserstack.firefox.driver': configuration.BROWSERSTACK_FIREFOX_DRIVER,
        # 'browserstack.networkLogs': network_logs,
        # 'browserstack.acceptInsecureCerts': 'true',
        # 'browserstack.console': 'errors',
        # 'browserstack.autoWait': 0,
        # 'ie.ensureCleanSession': 'true',
        # 'ie.forceCreateProcessApi': 'true',
        # 'username': configuration.SL_USERNAME,
        # 'accessKey': configuration.SL_ACCESS_KEY,
        # 'tunnelIdentifier': 'test_tunnel_for_web_tests',
        'sauce:options': {
            'build': configuration.BUILD_NAME,
            'seleniumVersion': configuration.BROWSERSTACK_SELENIUM_VERSION,
            'chromedriverVersion': configuration.BROWSERSTACK_CHROME_DRIVER,
            'iedriverVersion': configuration.BROWSERSTACK_IE_DRIVER,
            'geckodriverVersion': configuration.BROWSERSTACK_FIREFOX_DRIVER,
            'screenResolution': screen_resolution
        }
    }
    capabilities = {}
    for key, value in possible_caps.items():
        if value:
            capabilities[key] = value
            LOGGER.info(value)
    return capabilities


class WebDriverFactory:
    WEB_DRIVERS = {
        'chrome': _create_chrome_web_driver,
        'firefox': _create_firefox_web_driver,
        'opera': _create_opera_web_driver,
        'ie': _create_ie_web_driver,
        'edge': _create_chrome_web_driver,
        'safari': _create_chrome_web_driver,
        'phantom': _create_chrome_web_driver
    }

    @classmethod
    @retry(WebDriverException, tries=3, delay=10, logger=LOGGER)
    def create_web_driver(cls, remote, browser, command_executor, configuration, headless) -> RemoteWebDriver:
        if remote:
            return cls._create_remote_web_driver(command_executor, configuration)
        return cls._create_local_web_driver(browser, headless)

    @classmethod
    def _create_remote_web_driver(cls, command_executor, configuration) -> RemoteWebDriver:
        remote_capabilities = _get_remote_capabilities(configuration)
        remote_capabilities['goog:loggingPrefs'] = {'browser': 'SEVERE'}
        return webdriver.Remote(command_executor=command_executor, desired_capabilities=remote_capabilities)

    @classmethod
    def _create_local_web_driver(cls, browser, headless) -> RemoteWebDriver:
        if browser not in cls.WEB_DRIVERS:
            raise RuntimeError(f'Unknown browser name: {browser}')

        return cls.WEB_DRIVERS[browser](
            options=_get_local_options(headless),
            capabilities={'goog:loggingPrefs': {'browser': 'SEVERE'}}
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
