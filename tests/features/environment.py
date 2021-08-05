"""This module consist Behave hooks which allows us to better manage the code workflow"""
# -*- coding: utf-8 -*-

# -- FILE: features/environment.py
# USE: behave -D BEHAVE_DEBUG_ON_ERROR         (to enable  debug-on-error)
# USE: behave -D BEHAVE_DEBUG_ON_ERROR=yes     (to enable  debug-on-error)
# USE: behave -D BEHAVE_DEBUG_ON_ERROR=no      (to disable debug-on-error)
from logging import INFO

from configuration import CONFIGURATION
from pages.page_factory import PageFactory
from utils.actions import Actions
from utils.browser_executor import BrowserExecutor
from utils.configurations.jwt_generator import replace_jwt_in_logs
from utils.driver_factory import DriverFactory
from utils.helpers.request_executor import mark_test_as_failed, set_scenario_name, mark_test_as_passed, \
    clear_shared_dict, add_to_shared_dict
from utils.logger import get_logger
from utils.mock_handler import MockServer
from utils.reporter import Reporter
from utils.visual_regression.screenshot_manager import ScreenshotManager
from utils.waits import Waits

BEHAVE_DEBUG_ON_ERROR = False
LOGGER = get_logger(INFO)


def setup_debug_on_error(userdata):
    # pylint: disable=global-statement

    """Debug-on-Error(in case of step failures) providing, by using after_step() hook.
    The debugger starts when step definition fails"""
    global BEHAVE_DEBUG_ON_ERROR
    BEHAVE_DEBUG_ON_ERROR = userdata.getbool('BEHAVE_DEBUG_ON_ERROR')


def before_all(context):
    """Run before the whole shooting match"""
    context.configuration = CONFIGURATION
    MockServer.start_mock_server()


def disable_headless_for_visa_checkout(context):
    if 'visa_checkout' in context.scenario.tags:
        context.configuration.HEADLESS = False


def before_scenario(context, scenario):
    """Run before each scenario"""
    LOGGER.info('BEFORE SCENARIO')
    clear_shared_dict()
    add_to_shared_dict('assertion_message', 'Scenario execution error, for details check gitlab log')
    if context.configuration.REMOTE:
        context.configuration.BROWSER = context.configuration.REMOTE_BROWSER
    disable_headless_for_visa_checkout(context)
    context.browser = context.configuration.BROWSER
    context.device = context.configuration.REMOTE_DEVICE
    context.driver_factory = DriverFactory(configuration=context.configuration)
    context.waits = Waits(driver_factory=context.driver_factory, configuration=context.configuration)
    actions = Actions(driver_factory=context.driver_factory, waits=context.waits)
    context.browser_executor = BrowserExecutor(driver_factory=context.driver_factory, waits=context.waits)
    context.reporter = Reporter(driver_factory=context.driver_factory, configuration=context.configuration)
    context.screenshot_manager = ScreenshotManager(driver_factory=context.driver_factory, configuration=context.configuration)
    context.page_factory = PageFactory(browser_executor=context.browser_executor, actions=actions,
                                       reporter=context.reporter, configuration=context.configuration,
                                       waits=context.waits)
    context.session_id = context.browser_executor.get_session_id()
    context.language = 'en_GB'
    scenario.name = '%s executed on %s' % (scenario.name, context.browser.upper())
    LOGGER.info(scenario.name)
    validate_if_proper_browser_is_set_for_test(context, scenario)


def after_scenario(context, scenario):
    """Run after each scenario"""
    # pylint: disable=bare-except
    LOGGER.info('AFTER SCENARIO')
    if scenario.status == 'failed' and (context.browser.upper() not in 'SAFARI'):
        LOGGER.info('Printing console logs:')
        try:
            for entry in context.driver_factory.get_driver().get_log('browser'):
                if 'jwt' in entry['message']:
                    entry = replace_jwt_in_logs(entry)
                LOGGER.info(entry)
        except:
            LOGGER.info('Error was thrown while printing console logs')
    browser_name = context.browser
    context.browser_executor.clear_cookies()
    context.browser_executor.close_browser()
    MockServer.stop_mock_server()
    if context.configuration.REMOTE:
        set_scenario_name(context.session_id, scenario.name)
    scenario.name = f'{scenario.name}_{browser_name.upper()}'
    if scenario.status == 'failed' and context.configuration.REMOTE:
        mark_test_as_failed(context.session_id)
    elif context.configuration.REMOTE:
        mark_test_as_passed(context.session_id)


def after_step(context, step):
    """Run after each step"""
    if step.status == 'failed':
        scenario_name = _clean(context.scenario.name.title())
        feature_name = _clean(context.feature.name.title())
        step_name = _clean(step.name.title())
        filename = f'{feature_name}_{scenario_name}_{step_name}'
        context.reporter.save_screenshot_and_page_source(filename)


def _clean(text_to_clean):
    """Method to clean text which will be used for tests run reporting"""
    text = ''.join(x if x.isalnum() else '' for x in text_to_clean)
    return text


def validate_if_proper_browser_is_set_for_test(context, scenario):
    if 'apple_test' in scenario.tags and (context.browser.upper() not in 'SAFARI'):
        if 'iP' not in CONFIGURATION.REMOTE_DEVICE:
            scenario.skip('SCENARIO SKIPPED as iOS system and Safari is required for ApplePay test')
    if 'visa_test' in scenario.tags and ('IE' in CONFIGURATION.REMOTE_BROWSER):
        scenario.skip('SCENARIO SKIPPED as IE browser doesn\'t support Visa Checkout')
    if 'animated_card_repo_test' in scenario.tags:
        context.is_field_in_iframe = False
        # ToDo Temporarily disabled parent-iframe test. Problem with cress-origin restriction on ios
    if 'parent_iframe' in scenario.tags and ('iP' in CONFIGURATION.REMOTE_DEVICE):
        scenario.skip('Temporarily disabled test ')
    if 'ignore_on_headless' in scenario.tags and not context.configuration.REMOTE:
        scenario.skip('Scenario skipped for headless chrome')
    else:
        context.is_field_in_iframe = True
