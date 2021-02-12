""" Please configure you solution here
"""
import pprint
from datetime import date
from distutils.util import strtobool

from attrdict import AttrDict

from utils.logger import _get_logger
from utils.read_configuration import get_path_from_env, get_from_env


def load_config():
    """
    Set config env variables
    """
    config = {
        'URL': AttrDict({'BASE_URL': get_from_env('BASE_URL', 'https://merchant.securetrading.net'),
                         'REACT_APP': get_from_env('REACT_APP', 'https://localhost:3000')}),
        'REPORTS_PATH': get_path_from_env('AUTOMATION_REPORTS', 'reports'),
        'SCREENSHOTS_PATH': get_path_from_env('AUTOMATION_SCREENSHOTS', 'screenshots'),
        'BROWSER': get_from_env('AUTOMATION_BROWSER', 'chrome'),
        'HEADLESS': get_from_env('HEADLESS', True),
        'TIMEOUT': get_from_env('AUTOMATION_TIMEOUT', 30),
        'REMOTE': strtobool(get_from_env('REMOTE', 'false')),
        'COMMAND_EXECUTOR': get_from_env('AUTOMATION_COMMAND_EXECUTOR',
                                         'https://' + str(get_from_env('BS_USERNAME')) + ':' +
                                         str(get_from_env('BS_ACCESS_KEY')) + '@hub.browserstack.com/wd/hub'),
        'REMOTE_OS': get_from_env('OS', ''),
        'REMOTE_OS_VERSION': get_from_env('OS_VERSION', ''),
        'REMOTE_BROWSER': get_from_env('BROWSER', ''),
        'REMOTE_BROWSER_VERSION': get_from_env('BROWSER_VERSION', ''),
        'BROWSERSTACK_SELENIUM_VERSION': get_from_env('BROWSERSTACK_SELENIUM_VERSION', ''),
        'BROWSERSTACK_APPIUM_VERSION': get_from_env('BROWSERSTACK_APPIUM_VERSION', ''),
        'BROWSERSTACK_CHROME_DRIVER': get_from_env('BROWSERSTACK_CHROME_DRIVER', ''),
        'BROWSERSTACK_IE_DRIVER': get_from_env('BROWSERSTACK_IE_DRIVER', ''),
        'BROWSERSTACK_SAFARI_DRIVER': get_from_env('BROWSERSTACK_SAFARI_DRIVER', ''),
        'BROWSERSTACK_FIREFOX_DRIVER': get_from_env('BROWSERSTACK_FIREFOX_DRIVER', ''),
        'REMOTE_DEVICE': get_from_env('DEVICE', ''),
        'REMOTE_REAL_MOBILE': get_from_env('REAL_MOBILE', ''),
        'BROWSERSTACK_LOCAL': get_from_env('LOCAL', 'true'),
        'BROWSERSTACK_LOCAL_IDENTIFIER': get_from_env('BS_LOCAL_IDENTIFIER', 'local_id'),
        'ACCEPT_SSL_CERTS': get_from_env('ACCEPT_SSL_CERTS', 'true'),
        'PROJECT_NAME': get_from_env('PROJECT_NAME', 'JS Payments Interface'),
        'BUILD_NAME': get_from_env('BUILD_NAME', 'Behavioral test: ' + str(date.today())),
        'BROWSERSTACK_DEBUG': get_from_env('BROWSERSTACK_DEBUG', 'true'),
        'BEHAVE_DEBUG_ON_ERROR': get_from_env('BEHAVE_DEBUG_ON_ERROR', 'true')
    }

    return AttrDict(config)


def print_properties(config):
    # pylint: disable=logging-fstring-interpolation

    """
    Printing all configuration data before starting the tests
    """
    logger = _get_logger()
    config_to_print = config.copy()
    config_to_print.pop('COMMAND_EXECUTOR')
    logger.info(f'CONFIGURATION: \n{pprint.pformat(config_to_print, indent=4)}')


CONFIGURATION = load_config()
print_properties(CONFIGURATION)
