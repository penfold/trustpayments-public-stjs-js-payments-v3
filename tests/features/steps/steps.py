# type: ignore[no-redef]
import time

from assertpy import assert_that
from behave import given, step, then, use_step_matcher

from configuration import CONFIGURATION
from utils.enums.config import screenshots
from utils.helpers.request_executor import add_to_shared_dict

use_step_matcher('re')


@given('"(?P<page_name>.+)" page is open')
def step_impl(context, page_name):
    context.page_factory.get_page(page_name=page_name).open_self_page()


@then('I see an "(?P<page_name>.+)" page')
def step_impl(context, page_name):
    current_url = context.page_factory.get_page(page_name=page_name).get_page_url()
    expected_url = context.test_data.landing_page
    assert expected_url == current_url, \
        f'Invalid page address!\nGiven: {current_url},\nExpected: {expected_url}'


@step('Make screenshot after (?P<how_many_seconds>.+) seconds')
def step_impl(context, how_many_seconds):
    time.sleep(int(how_many_seconds))
    screenshot_filename = screenshots[_screenshot_tag(context.scenario.tags)]
    context.screenshot_manager().make_screenshot_for_visual_tests(screenshot_filename, date_postfix=True)


@then('Screenshot is taken after (?P<how_many_seconds>.+) seconds and checked')
def step_impl(context, how_many_seconds):
    # pylint: disable=invalid-name)
    time.sleep(float(how_many_seconds))
    sm = context.screenshot_manager

    expected_screenshot_filename = _browser_device(context) + '_' + screenshots[_screenshot_tag(context.scenario.tags)]
    actual_screenshot_filename = sm.make_screenshot_for_visual_tests(expected_screenshot_filename, date_postfix=True)
    assertion_message = f'\nScreenshots comparator detected differences between ' \
                        f'"expected/{expected_screenshot_filename}" and ' \
                        f'"actual/{actual_screenshot_filename}"\n' \
                        f'Check the result file "results/{actual_screenshot_filename}"'
    add_to_shared_dict('assertion_message', assertion_message)
    assert sm.compare_screenshots(expected_screenshot_filename, actual_screenshot_filename), assertion_message


def _screenshot_tag(tags):
    for tag in tags:
        if tag.startswith('scrn_'):
            return tag
    raise Exception('There is no screenshot tag!')


def _browser_device(context):
    name = CONFIGURATION.REMOTE_DEVICE
    if not name or name is None:
        name = context.browser
    name = name.upper()

    assert_that(name).is_in('CHROME', 'SAFARI', 'SAMSUNG GALAXY S10 PLUS', 'IPHONE XS')

    return {
        'CHROME': name,
        'SAFARI': name,
        'SAMSUNG GALAXY S10 PLUS': 'SGS10',
        'IPHONE XS': 'IPXS',
    }[name]
