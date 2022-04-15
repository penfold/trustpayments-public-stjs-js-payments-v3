# type: ignore[no-redef]
import base64
import json
import time
from urllib.parse import urlparse, parse_qs

from assertpy import assert_that, soft_assertions
from behave import given, step, then, use_step_matcher

from configuration import CONFIGURATION
from pages.page_factory import Pages
from utils.configurations.inline_config_builder import InlineConfigBuilder
from utils.configurations.inline_config_generator import create_inline_config, create_inline_config_apm, \
    create_tokenized_inline_config
from utils.configurations.jwt_generator import encode_jwt_for_json, encode_jwt
from utils.enums.config import screenshots
from utils.enums.config_apm import ConfigApm
from utils.enums.config_e2e import ConfigCardPaymentsAndDigitalWallets
from utils.enums.config_jwt import ConfigJwt
from utils.enums.shared_dict_keys import SharedDictKey
from utils.helpers.request_executor import add_to_shared_dict
from utils.helpers.resources_reader import get_e2e_config_from_json, get_jwt_config_from_json, get_apm_config_from_json
from utils.waits import Waits

use_step_matcher('re')


@given('JS library is configured with (?P<e2e_config>.+) and (?P<jwt_config>.+)')
def step_impl(context, e2e_config, jwt_config):
    jwt = encode_jwt_for_json(ConfigJwt[jwt_config])
    e2e_config_dict = get_e2e_config_from_json(ConfigCardPaymentsAndDigitalWallets[e2e_config].value)
    context.INLINE_E2E_CONFIG = create_inline_config(e2e_config_dict, jwt)


@step(
    'JS library configured by inline params (?P<e2e_config>.+) and jwt (?P<jwt_config>.+) with additional attributes')
def step_impl(context, e2e_config, jwt_config):
    # parse old jwt config (payload part) to dictionary object
    jwt_config_from_json_dict = get_jwt_config_from_json(ConfigJwt[jwt_config].value)['payload']
    jwt_config_from_json_dict['sitereference'] = CONFIGURATION.SITE_REFERENCE_CARDINAL
    # build payload base on additional attributes and parse to dictionary
    jwt_payload_dict = InlineConfigBuilder().map_jwt_additional_fields(jwt_config_from_json_dict, context.table)
    jwt = encode_jwt(jwt_payload_dict)
    context.INLINE_E2E_CONFIG_DICT = get_e2e_config_from_json(ConfigCardPaymentsAndDigitalWallets[e2e_config].value)
    context.INLINE_E2E_CONFIG = create_inline_config(context.INLINE_E2E_CONFIG_DICT, jwt)


@step('JS library configured by inline config (?P<e2e_config>.+)')
def step_impl(context, e2e_config):
    e2e_config_dict = get_e2e_config_from_json(ConfigCardPaymentsAndDigitalWallets[e2e_config].value)
    context.INLINE_E2E_CONFIG_DICT = e2e_config_dict


@step('JS library configured by inline configAPMs (?P<apm_config>.+)')
def step_impl(context, apm_config):
    if 'IE' in CONFIGURATION.BROWSER and 'scrn_a2a' in context.scenario.tags[0]:
        apm_config = 'ATA_CUSTOMIZED_BTN_CONFIG_APM_IE'
    e2e_config_apm_dict = get_apm_config_from_json(ConfigApm[apm_config].value)
    context.INLINE_E2E_CONFIG_APM = create_inline_config_apm(e2e_config_apm_dict)


@step('JS library configured with (?P<e2e_config>.+) and additional attributes')
def step_impl(context, e2e_config):
    e2e_config_dict = get_e2e_config_from_json(ConfigCardPaymentsAndDigitalWallets[e2e_config].value)
    e2e_config_dict = InlineConfigBuilder().map_lib_config_additional_fields(e2e_config_dict, context.table)
    context.INLINE_E2E_CONFIG_DICT = e2e_config_dict


@step('JS library authenticated by jwt (?P<jwt_config>.+) with additional attributes')
def step_impl(context, jwt_config):
    # map jwt config file (payload part) to dictionary object
    jwt_payload_dict = get_jwt_config_from_json(ConfigJwt[jwt_config].value)['payload']
    # override/add default sitereference from config
    jwt_payload_dict['sitereference'] = CONFIGURATION.SITE_REFERENCE_CARDINAL
    # build payload base on additional attributes
    jwt_payload_dict = InlineConfigBuilder().map_jwt_additional_fields(jwt_payload_dict, context.table)
    jwt = encode_jwt(jwt_payload_dict)
    context.INLINE_E2E_CONFIG = create_inline_config(context.INLINE_E2E_CONFIG_DICT, jwt)


@step('JS library configured with Tokenized Card (?P<jwt_config>.+) with additional attributes')
def step_impl(context,  jwt_config):
    # map jwt config file (payload part) to dictionary object
    jwt_payload_dict = get_jwt_config_from_json(ConfigJwt[jwt_config].value)['payload']
    # override/add default sitereference from config
    jwt_payload_dict['sitereference'] = CONFIGURATION.SITE_REFERENCE_CARDINAL
    # build payload base on additional attributes
    jwt_payload_dict = InlineConfigBuilder().map_jwt_additional_fields(jwt_payload_dict, context.table)
    jwt = encode_jwt(jwt_payload_dict)
    context.INLINE_TOKENIZED_E2E_CONFIG = create_tokenized_inline_config(jwt)


@step('User accept success alert')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.accept_alert()


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
    actual_screenshot_filename = sm.make_screenshot_for_visual_tests(expected_screenshot_filename, date_postfix=False)
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

    assert_that(name).is_in('IE', 'CHROME', 'SAFARI', 'SAMSUNG GALAXY S21', 'IPHONE 13')

    return {
        'IE': name,
        'CHROME': name,
        'SAFARI': name,
        'SAMSUNG GALAXY S21': 'SGS21',
        'IPHONE 13': 'IP13',
    }[name]


@step('User will be sent to page with url "(?P<url>.+)" having params')
def step_impl(context, url: str):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    with soft_assertions():
        context.waits.wait_for_javascript()
        payment_page.validate_base_url(url)
        actual_url = payment_page.get_page_url()
        parsed_url = urlparse(actual_url)
        parsed_query_from_url = parse_qs(parsed_url.query)
        for param in context.table:
            payment_page.validate_if_url_contains_param(parsed_query_from_url, param['key'], param['value'])


@step('User waits to be sent into page with url "(?P<url>.+)" after gateway timeout')
def step_impl(context, url):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.wait_for_url_with_timeout(url, Waits.OVER_GATEWAY_TIMEOUT)


@step('User waits to be sent into page with url "(?P<url>.+)" after ACS mock timeout')
def step_impl(context, url):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.wait_for_url_with_timeout(url, Waits.OVER_ACS_MOCK_TIMEOUT)


@step('User waits for ACS mock timeout')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.wait_for_notification_frame_with_timeout(Waits.OVER_ACS_MOCK_TIMEOUT)


@step('User gets cachetoken value from url')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    cachetoken_value = payment_page.get_cachetoken_value()
    add_to_shared_dict(SharedDictKey.CACHETOKEN.value, cachetoken_value)


@step('User see that methodUrl request is send')
def step_impl(context):
    if context.browser.upper() not in 'SAFARI':
        extract_acs_method_traffic_from_driver_logs(context)
        try:
            for entry in context.three_ds_method_traffic_list:
                if entry['message']['method'] == 'Network.requestWillBeSent':
                    context.three_ds_method_data = entry['message']['params']['request'][
                        'postData'].replace('threeDSMethodData=', '').replace('%3D', '=')
        except BaseException as error:
            assertion_message = f'An exception occurred: {error}'
            add_to_shared_dict(SharedDictKey.ASSERTION_MESSAGE.value, assertion_message)

    assertion_message = 'ACS method Url not requested'
    add_to_shared_dict(SharedDictKey.ASSERTION_MESSAGE.value, assertion_message)
    assert context.three_ds_method_data, assertion_message


@step('User see that threeDSMethodData contains required fields')
def step_impl(context):
    method_data_encoded_bytes = context.three_ds_method_data.encode('ascii')
    method_data_base64_decoded = base64.b64decode(method_data_encoded_bytes)
    three_ds_method_data_dict = json.loads(method_data_base64_decoded.decode('ascii'))

    with soft_assertions():
        for row in context.table:
            field = row['field']
            assertion_message = f'{field} is missing in threeDSMethodData'
            add_to_shared_dict(SharedDictKey.ASSERTION_MESSAGE.value, assertion_message)
            assert three_ds_method_data_dict[field], assertion_message


@step('User checks that methodUrl\'s request response is 200')
def step_impl(context):
    if context.browser.upper() not in 'SAFARI':
        extract_acs_method_traffic_from_driver_logs(context)
        try:
            for entry in context.three_ds_method_traffic_list:
                if entry['message']['method'] == 'Network.responseReceived':
                    context.three_ds_method_response_status = entry['message']['params']['response'][
                        'status']
        except BaseException as error:
            assertion_message = f'An exception occurred: {error}'
            add_to_shared_dict(SharedDictKey.ASSERTION_MESSAGE.value, assertion_message)

    assertion_message = f'ACS method_Url\'s request response status is incorrect ({context.three_ds_method_response_status})'
    add_to_shared_dict(SharedDictKey.ASSERTION_MESSAGE.value, assertion_message)
    assert context.three_ds_method_response_status == 200, assertion_message


def extract_acs_method_traffic_from_driver_logs(context):
    if not hasattr(context, 'three_ds_method_traffic_list'):
        context.three_ds_method_traffic_list = []
        try:
            for entry in context.driver_factory.get_driver().get_log('performance'):
                log_request_msg = entry['message']
                if '/acs/method' in log_request_msg:
                    context.three_ds_method_traffic_list.append(json.loads(log_request_msg))
        except BaseException as error:
            assertion_message = f'An exception occurred: {error}'
            add_to_shared_dict(SharedDictKey.ASSERTION_MESSAGE.value, assertion_message)
