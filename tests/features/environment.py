"""This module consist Behave hooks which allows us to better manage the code workflow"""
# -*- coding: utf-8 -*-

# -- FILE: features/environment.py
# USE: behave -D BEHAVE_DEBUG_ON_ERROR         (to enable  debug-on-error)
# USE: behave -D BEHAVE_DEBUG_ON_ERROR=yes     (to enable  debug-on-error)
# USE: behave -D BEHAVE_DEBUG_ON_ERROR=no      (to disable debug-on-error)
#from selenium.common.exceptions import WebDriverException, SessionNotCreatedException
from selenium.common.exceptions import SessionNotCreatedException, WebDriverException

import ioc_config
from configuration import CONFIGURATION

from page_factory import PageFactory
from utils.helpers.request_executor import mark_test_as_failed, set_scenario_name
from utils.mock_handler import MockServer

BEHAVE_DEBUG_ON_ERROR = False


def setup_debug_on_error(userdata):
    # pylint: disable=global-statement

    """Debug-on-Error(in case of step failures) providing, by using after_step() hook.
    The debugger starts when step definition fails"""
    global BEHAVE_DEBUG_ON_ERROR
    BEHAVE_DEBUG_ON_ERROR = userdata.getbool('BEHAVE_DEBUG_ON_ERROR')


def before_all(context):
    """Run before the whole shooting match"""
    context.config = ioc_config.CONFIG.resolve('test')
    context.test_data = ioc_config.TEST_DATA.resolve('test')
    MockServer.start_mock_server()


def before_scenario(context, scenario):
    """Run before each scenario"""
    context.page_factory = PageFactory()
    resolve_executor_with_try(context)
    open_driver_with_try(context)
    context.session_id = context.executor.get_session_id()
    context.language = 'en_GB'
    # scenario.name = '%s_%s' % (scenario.name, context.browser.upper())

    if 'apple_test' in scenario.tags and (context.browser not in 'safari'):
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


def resolve_executor_with_try(context):
    max_try = 3
    while max_try:
        try:
            context.executor = ioc_config.EXECUTOR.resolve('test')
            break
        except SessionNotCreatedException as exception:
            print(str(exception) + ' - trying to open browser again')
            max_try -= 1


def open_driver_with_try(context):
    max_try = 3
    while max_try:
        try:
            context.browser = ioc_config.CONFIG.resolve('driver').browser
            break
        except WebDriverException as exception:
            print(str(exception) + ' - trying to open browser again')
            max_try -= 1


def after_scenario(context, scenario):
    """Run after each scenario"""
    context.page_factory = PageFactory()

    browser_name = ioc_config.CONFIG.resolve('driver').browser
    set_scenario_name(context.session_id, scenario.name)
    scenario.name = '%s_%s' % (scenario.name, browser_name.upper())
    if scenario.status == 'failed' and (CONFIGURATION.REMOTE == 1):
        mark_test_as_failed(context.session_id)
    context.executor.clear_cookies()
    # context.executor.clear_storage()
    MockServer.stop_mock_server()
    context.executor.close_browser()


# def after_all(context):
#     """Run after the whole shooting match"""
#     context.page_factory = PageFactory()
#
#     executor = ioc_config.EXECUTOR.resolve('test')
#     executor.close_browser()


def after_step(context, step):
    """Run after each step"""
    if step.status == 'failed':
        scenario_name = _clean(context.scenario.name.title())
        feature_name = _clean(context.feature.name.title())
        step_name = _clean(step.name.title())
        filename = f'{feature_name}_{scenario_name}_{step_name}'
        executor = ioc_config.REPORTER.resolve('test')
        executor.save_screenshot_and_page_source(filename)


def _clean(text_to_clean):
    """Method to clean text which will be used for tests run reporting"""
    text = ''.join(x if x.isalnum() else '' for x in text_to_clean)
    return text
