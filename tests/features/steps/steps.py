# type: ignore[no-redef]
import time

from assertpy import assert_that
from behave import given, step, then, use_step_matcher

from configuration import CONFIGURATION
from utils.configurations.inline_config_generator import create_inline_config
from utils.configurations.jwt_generator import encode_jwt_for_json, encode_jwt, get_data_from_json, \
    merge_json_conf_with_additional_attr
from utils.enums.card import Card
from utils.enums.config import screenshots
from utils.enums.e2e_config import E2eConfig
from utils.enums.field_type import FieldType
from utils.enums.jwt_config import JwtConfig
from utils.helpers.request_executor import add_to_shared_dict
from models.jwt_payload_builder import JwtPayloadBuilder


use_step_matcher('re')


@given('JS library is configured with (?P<e2e_config>.+) and (?P<jwt_config>.+)')
def step_impl(context, e2e_config: E2eConfig, jwt_config: JwtConfig):
    jwt = encode_jwt_for_json(JwtConfig[jwt_config])
    context.inline_config = create_inline_config(E2eConfig[e2e_config], jwt)


@step(
    'JS library configured by inline params (?P<e2e_config>.+) and jwt (?P<jwt_config>.+) with additional attributes')
def step_impl(context, e2e_config: E2eConfig, jwt_config: JwtConfig):
    # parse old jwt config (payload part) to dictionary object
    jwt_config_from_json_dict = get_data_from_json(JwtConfig[jwt_config].value)['payload']
    # build payload base on additional attributes and parse to dictionary
    jwt_payload_dict = JwtPayloadBuilder().map_payload_fields(context.table).build().__dict__
    # merge both dictionaries (old is overridden by additional attr)
    jwt = encode_jwt(merge_json_conf_with_additional_attr(jwt_config_from_json_dict, jwt_payload_dict))
    context.inline_config = create_inline_config(E2eConfig[e2e_config], jwt)


@given('"(?P<page_name>.+)" page is open')
def step_impl(context, page_name):
    context.page_factory.get_page(page_name=page_name).open_self_page()


@then('I see an "(?P<page_name>.+)" page')
def step_impl(context, page_name):
    current_url = context.page_factory.get_page(page_name=page_name).get_page_url()
    expected_url = context.test_data.landing_page
    assert expected_url == current_url, \
        f'Invalid page address!\nGiven: {current_url},\nExpected: {expected_url}'


@step('User fills payment form with defined card (?P<card>.+)')
def step_impl(context, card: Card):
    payment_page = context.page_factory.get_page(page_name='payment_methods')
    card = Card.__members__[card]
    context.pan = str(card.number)
    context.exp_date = str(card.expiration_date)
    context.cvv = str(card.cvv)
    if 'e2e_config_for_iframe' in context.scenario.tags:
        payment_page._action.switch_to_iframe(FieldType.PARENT_IFRAME.value)
    payment_page.fill_payment_form(card.number, card.expiration_date, card.cvv)


@step('User fills only security code for saved (?P<card>.+) card')
def step_impl(context, card: Card):
    payment_page = context.page_factory.get_page(page_name='payment_methods')
    card = Card.__members__[card]
    payment_page.fill_payment_form_with_only_cvv(card.cvv)


@step('Make screenshot after (?P<how_many_seconds>.+) seconds')
def step_impl(context, how_many_seconds):
    time.sleep(int(how_many_seconds))
    screenshot_filename = screenshots[_screenshot_tag(context.scenario.tags)]
    context.screenshot_manager.make_screenshot_for_visual_tests(screenshot_filename, date_postfix=True)


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

    assert_that(name).is_in('IE', 'CHROME', 'SAFARI', 'SAMSUNG GALAXY S10 PLUS', 'IPHONE XS')

    return {
        'IE': name,
        'CHROME': name,
        'SAFARI': name,
        'SAMSUNG GALAXY S10 PLUS': 'SGS10',
        'IPHONE XS': 'IPXS',
    }[name]


@step('user waits for payment to be processed')
def step_impl(context):
    payment_page = context.page_factory.get_page(page_name='payment_methods')
    payment_page.wait_for_pay_processing_end('en_US')


@step('User gets cachetoken value from url')
def step_impl(context):
    payment_page = context.page_factory.get_page(page_name='payment_methods')
    cachetoken_value = payment_page.get_cachetoken_value()
    add_to_shared_dict('cachetoken', cachetoken_value)
