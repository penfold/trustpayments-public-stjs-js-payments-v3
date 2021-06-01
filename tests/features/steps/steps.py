# type: ignore[no-redef]
import time

from assertpy import assert_that
from behave import given, step, then, use_step_matcher

from configuration import CONFIGURATION
from models.inline_config_builder import InlineConfigBuilder
from pages.page_factory import Pages
from utils.configurations.inline_config_generator import create_inline_config
from utils.configurations.jwt_generator import encode_jwt_for_json, encode_jwt, get_jwt_config_from_json, \
    merge_json_conf_with_additional_attr
from utils.enums.card import Card
from utils.enums.config import screenshots
from utils.enums.e2e_config import E2eConfig
from utils.enums.jwt_config import JwtConfig
from utils.enums.shared_dict_keys import SharedDictKey
from utils.helpers.request_executor import add_to_shared_dict

use_step_matcher('re')


@given('JS library is configured with (?P<e2e_config>.+) and (?P<jwt_config>.+)')
def step_impl(context, e2e_config, jwt_config):
    jwt = encode_jwt_for_json(JwtConfig[jwt_config])
    context.inline_e2e_config = create_inline_config(E2eConfig[e2e_config], jwt)


@step(
    'JS library configured by inline params (?P<e2e_config>.+) and jwt (?P<jwt_config>.+) with additional attributes')
def step_impl(context, e2e_config, jwt_config):
    # parse old jwt config (payload part) to dictionary object
    jwt_config_from_json_dict = get_jwt_config_from_json(JwtConfig[jwt_config].value)['payload']
    # build payload base on additional attributes and parse to dictionary
    jwt_payload_dict = InlineConfigBuilder().map_payload_fields(context.table).build().__dict__
    # merge both dictionaries (old is overridden by additional attr)
    jwt = encode_jwt(merge_json_conf_with_additional_attr(jwt_config_from_json_dict, jwt_payload_dict))
    context.inline_e2e_config = create_inline_config(E2eConfig[e2e_config], jwt)


@step('User fills payment form with defined card (?P<card>.+)')
def fill_payment_form_with_defined_card(context, card: Card):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    card = Card.__members__[card]  # pylint: disable=unsubscriptable-object
    context.pan = str(card.number)
    context.exp_date = str(card.expiration_date)
    context.cvv = str(card.cvv)
    payment_page.fill_payment_form(card.number, card.expiration_date, card.cvv)


@step('User re-fills payment form with defined card (?P<card>.+)')
def step_impl(context, card: Card):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.clear_card_number_field()
    fill_payment_form_with_defined_card(context, card)


@step('User fills only security code for saved (?P<card>.+) card')
def step_impl(context, card: Card):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    card = Card.__members__[card]  # pylint: disable=unsubscriptable-object
    payment_page.fill_payment_form_with_only_cvv(card.cvv)


@step('Make screenshot after (?P<how_many_seconds>.+) seconds')
def step_impl(context, how_many_seconds):
    time.sleep(int(how_many_seconds))
    screenshot_filename = screenshots[_screenshot_tag(context.scenario.tags)]
    context.screenshot_manager.make_screenshot_for_visual_tests(screenshot_filename, date_postfix=True)


@then('Screenshot is taken after (?P<how_many_seconds>.+) seconds and checked')
def step_impl(context, how_many_seconds):
    # pylint: disable=invalid-name)
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.change_focus_to_page_title()
    time.sleep(float(how_many_seconds))
    sm = context.screenshot_manager

    expected_screenshot_filename = _browser_device(context) + '_' + screenshots[_screenshot_tag(context.scenario.tags)]
    actual_screenshot_filename = sm.make_screenshot_for_visual_tests(expected_screenshot_filename, date_postfix=True)
    assertion_message = f'\nScreenshots comparator detected differences between ' \
                        f'"expected/{expected_screenshot_filename}" and ' \
                        f'"actual/{actual_screenshot_filename}"\n' \
                        f'Check the result file "results/{actual_screenshot_filename}"'
    add_to_shared_dict(SharedDictKey.ASSERTION_MESSAGE.value, assertion_message)
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

    assert_that(name).is_in('IE', 'CHROME', 'SAFARI', 'SAMSUNG GALAXY S20', 'IPHONE 12 MINI')

    return {
        'IE': name,
        'CHROME': name,
        'SAFARI': name,
        'SAMSUNG GALAXY S20': 'SGS20',
        'IPHONE 12 MINI': 'IP12MINI',
    }[name]


@step('User waits for payment to be processed')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.wait_for_pay_processing_end('en_US')


@step('User gets cachetoken value from url')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    cachetoken_value = payment_page.get_cachetoken_value()
    add_to_shared_dict(SharedDictKey.CACHETOKEN.value, cachetoken_value)
