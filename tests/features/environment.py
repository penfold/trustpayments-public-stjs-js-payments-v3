"""This module consist Behave hooks which allows us to better manage the code workflow"""
# -*- coding: utf-8 -*-

# -- FILE: features/environment.py
# USE: behave -D BEHAVE_DEBUG_ON_ERROR         (to enable  debug-on-error)
# USE: behave -D BEHAVE_DEBUG_ON_ERROR=yes     (to enable  debug-on-error)
# USE: behave -D BEHAVE_DEBUG_ON_ERROR=no      (to disable debug-on-error)
from logging import INFO

from configuration import CONFIGURATION
from logger import get_logger
from page_factory import PageFactory
from utils.browser import Browser
from utils.driver_factory import DriverFactory
from utils.extensions import WebElementsExtensions
from utils.mock_handler import MockServer
from utils.reporter import Reporter
from utils.test_data import TestData
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


def before_scenario(context, scenario):
    """Run before each scenario"""
    LOGGER.info('BEFORE SCENARIO')
    if context.configuration.REMOTE:
        context.configuration.BROWSER = context.configuration.REMOTE_BROWSER
    context.browser = context.configuration.BROWSER
    driver = DriverFactory(configuration=context.configuration)
    context.waits = Waits(driver=driver, configuration=context.configuration)
    extensions = WebElementsExtensions(driver=driver, configuration=context.configuration)
    context.executor = Browser(driver=driver, configuration=context.configuration)
    context.reporter = Reporter(driver=driver, configuration=context.configuration)
    context.screenshot_manager = ScreenshotManager(driver=driver, configuration=context.configuration)
    context.page_factory = PageFactory(executor=context.executor, extensions=extensions,
                                       reporter=context.reporter, configuration=context.configuration,
                                       wait=context.waits)
    context.test_data = TestData(configuration=context.configuration)
    context.session_id = context.executor.get_session_id()
    context.language = 'en_GB'
    scenario.name = '%s executed on %s' % (scenario.name, context.browser.upper())
    LOGGER.info(scenario.name)
    validate_if_proper_browser_is_set_for_test(context, scenario)


def after_scenario(context, scenario):
    """Run after each scenario"""
    LOGGER.info('AFTER SCENARIO')
    browser_name = context.browser
    scenario.name = f'{scenario.name}_{browser_name.upper()}'
    context.executor.clear_cookies()
    context.executor.close_browser()
    MockServer.stop_mock_server()


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
    else:
        context.is_field_in_iframe = True
