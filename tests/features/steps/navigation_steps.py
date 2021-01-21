# type: ignore[no-redef]

from assertpy import soft_assertions
from behave import use_step_matcher, step, then

from configuration import CONFIGURATION
from features.steps.payment_page_mocks_stubs_steps import stub_jsinit_update_jwt_request
from models.jwt_payload_builder import JwtPayloadBuilder
from utils.configurations.jwt_generator import encode_jwt_for_json, get_data_from_json, encode_jwt, \
    merge_json_conf_with_additional_attr, decode_jwt_from_jsinit
from utils.enums.example_page_param import ExamplePageParam
from utils.enums.jwt_config import JwtConfig
from utils.enums.responses.jsinit_response import jsinit_response
from utils.mock_handler import MockUrl

use_step_matcher('re')


@step('User opens page with incorrect request type in config file')
def step_impl(context):
    payment_page = context.page_factory.get_page(page_name='payment_methods')
    payment_page.open_page(CONFIGURATION.URL.BASE_URL)


@step('User opens page with payment form')
def step_impl(context):
    payment_page = context.page_factory.get_page(page_name='payment_methods')
    if 'config_immediate_payment' not in context.scenario.tags[0] and 'parent_iframe' not in context.scenario.tags and \
        'config_cybertonica_immediate_payment' not in context.scenario.tags:
        if 'Safari' in context.browser:
            accept_untrusted_pages_on_safari_browsers(context)
        payment_page.open_page(CONFIGURATION.URL.BASE_URL)
        payment_page.wait_for_iframe()


@step('User opens minimal example page with payment form')
def step_impl(context):
    payment_page = context.page_factory.get_page(page_name='payment_methods')
    if 'Safari' in context.browser:
        accept_untrusted_pages_on_safari_browsers(context)
    payment_page.open_page(f'{CONFIGURATION.URL.BASE_URL}/minimal.html?')
    payment_page.wait_for_iframe()


@step('User opens payment page')
def step_impl(context):
    payment_page = context.page_factory.get_page(page_name='payment_methods')
    if 'Safari' in context.browser:
        accept_untrusted_pages_on_safari_browsers(context)
    if 'parent_iframe' in context.scenario.tags:
        payment_page.open_page(CONFIGURATION.URL.BASE_URL + '/iframe.html')
        payment_page.switch_to_parent_iframe()
        payment_page.wait_for_parent_iframe()
    else:
        payment_page.open_page(CONFIGURATION.URL.BASE_URL)


@step('User opens prepared payment form page (?P<example_page>.+)')
def step_impl(context, example_page: ExamplePageParam):
    payment_page = context.page_factory.get_page(page_name='payment_methods')
    if 'Safari' in context.browser:
        accept_untrusted_pages_on_safari_browsers(context)
    if 'WITH_UPDATE_JWT' in example_page:
        jwt = ''
        updated_jwt_from_jsinit = ''
        for row in context.table:
            jwt = encode_jwt_for_json(JwtConfig[f'{row["jwtName"]}'])
            stub_jsinit_update_jwt_request(f'{row["jwtName"]}')
            updated_jwt_from_jsinit = decode_jwt_from_jsinit(jsinit_response[f'{row["jwtName"]}'])
        payment_page.open_page(f'{CONFIGURATION.URL.BASE_URL}/?{ExamplePageParam[example_page].value % jwt}')
        payment_page.wait_for_iframe()
        context.test_data.update_jwt = jwt  # test data replaced to check required value in assertion
        context.test_data.update_jwt_from_jsinit = updated_jwt_from_jsinit
    elif 'WITH_SPECIFIC_IFRAME' in example_page:
        payment_page.open_page(f'{CONFIGURATION.URL.BASE_URL}/{ExamplePageParam[example_page].value}')
        payment_page.switch_to_parent_iframe()
        payment_page.wait_for_parent_iframe()
    elif 'WITH_CHANGED_FORM_ID' in example_page:
        payment_page.open_page(f'{CONFIGURATION.URL.BASE_URL}/?{ExamplePageParam[example_page].value}')
    else:
        payment_page.open_page(f'{CONFIGURATION.URL.BASE_URL}/?{ExamplePageParam[example_page].value}')
        payment_page.wait_for_iframe()


@step('User opens (?:example page|example page (?P<example_page>.+))')
def step_impl_example(context, example_page: ExamplePageParam):
    payment_page = context.page_factory.get_page(page_name='payment_methods')

    if 'Safari' in context.browser:
        payment_page.open_page(MockUrl.STJS_URI)

    # setting url specific params accordingly to example page
    if example_page is None:
        url = f'{CONFIGURATION.URL.BASE_URL}/?{context.inline_config}'
    elif 'IN_IFRAME' in example_page:
        url = f'{CONFIGURATION.URL.BASE_URL}/{ExamplePageParam[example_page].value}{context.inline_config}'
    elif 'WITH_UPDATE_JWT' in example_page:
        jwt = ''
        for row in context.table:
            jwt = encode_jwt_for_json(JwtConfig[f'{row["jwtName"]}'])
        url = f'{CONFIGURATION.URL.BASE_URL}/?{ExamplePageParam[example_page].value % jwt}{context.inline_config}'
    else:
        url = f'{CONFIGURATION.URL.BASE_URL}/?{ExamplePageParam[example_page].value}&{context.inline_config}'
    url = url.replace('??', '?').replace('&&', '&')  # just making sure some elements are not duplicated

    payment_page.open_page(url)

    if example_page is not None and 'IN_IFRAME' in example_page:
        payment_page.switch_to_parent_iframe()
    if 'e2e_config_submit_on_error_invalid_jwt' not in context.scenario.tags:
        payment_page.wait_for_iframe()


@step('User opens page (?P<example_page>.+) and jwt (?P<jwt_config>.+) with additional attributes')
def step_impl(context, example_page: ExamplePageParam, jwt_config: JwtConfig):
    payment_page = context.page_factory.get_page(page_name='payment_methods')
    # setting url specific params accordingly to example page
    if '' in example_page:
        jwt_config_from_json_dict = get_data_from_json(JwtConfig[jwt_config].value)['payload']
        # build payload base on additional attributes and parse to dictionary
        jwt_payload_dict = JwtPayloadBuilder().map_payload_fields(context.table).build().__dict__
        # merge both dictionaries (old is overridden by additional attr)
        jwt = encode_jwt(merge_json_conf_with_additional_attr(jwt_config_from_json_dict, jwt_payload_dict))
        url = f'{CONFIGURATION.URL.BASE_URL}/?{ExamplePageParam[example_page].value % jwt}{context.inline_config}'
    else:
        url = f'{CONFIGURATION.URL.BASE_URL}/?{ExamplePageParam[example_page].value}&{context.inline_config}'
    url = url.replace('??', '?').replace('&&', '&')  # just making sure some elements are not duplicated

    payment_page.open_page(url)


@step('User opens (?P<html_page>.+) page with inline param')
def step_impl(context, html_page):
    payment_page = context.page_factory.get_page(page_name='payment_methods')
    url = f'{CONFIGURATION.URL.BASE_URL}/{html_page}?{context.inline_config}'
    payment_page.open_page(url)
    payment_page.wait_for_iframe()


@then('User remains on checkout page')
def step_impl(context):
    payment_page = context.page_factory.get_page(page_name='payment_methods')
    payment_page.validate_base_url(CONFIGURATION.URL.BASE_URL[8:])


@step('User will be sent to page with url "(?P<url>.+)" having params')
def step_impl(context, url: str):
    payment_page = context.page_factory.get_page(page_name='payment_methods')
    with soft_assertions():
        payment_page.validate_base_url(url)
        for param in context.table:
            payment_page.validate_if_url_contains_param(param['key'], param['value'])


@step('User changes page language to "(?P<language>.+)"')
def step_impl(context, language):
    context.language = language
    payment_page = context.page_factory.get_page(page_name='payment_methods')
    jwt = payment_page.get_translation_from_json(language, 'jwt')
    payment_page.open_page(f'{CONFIGURATION.URL.BASE_URL}?jwt={jwt}')
    payment_page.wait_for_iframe()


@step('User changes minimal example page language to "(?P<language>.+)"')
def step_impl(context, language):
    context.language = language
    payment_page = context.page_factory.get_page(page_name='payment_methods')
    jwt = payment_page.get_translation_from_json(language, 'jwt')
    payment_page.open_page(f'{CONFIGURATION.URL.BASE_URL}/minimal.html?jwt={jwt}')
    payment_page.wait_for_iframe()


def accept_untrusted_pages_on_safari_browsers(context):
    payment_page = context.page_factory.get_page(page_name='payment_methods')
    payment_page.open_page(MockUrl.WEBSERVICES_DOMAIN.value)
    payment_page.open_page(MockUrl.WEBSERVICES_STJS_URI.value)
    payment_page.open_page(MockUrl.LIBRARY_URL.value)
    payment_page.open_page(MockUrl.THIRDPARTY_URL.value)
