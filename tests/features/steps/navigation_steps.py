# type: ignore[no-redef]
from behave import use_step_matcher, step, then
from configuration import CONFIGURATION
from features.steps.payment_page_steps_mock import stub_jsinit_update_jwt_request
from pages.page_factory import Pages
from utils.configurations.inline_config_builder import InlineConfigBuilder
from utils.configurations.jwt_generator import encode_jwt_for_json, get_jwt_config_from_json, encode_jwt, \
     decode_jwt_from_jsinit
from utils.enums.example_page_param import ExamplePageParam
from utils.enums.jwt_config import JwtConfig
from utils.enums.responses.jsinit_response import jsinit_response
from utils.helpers.resources_reader import get_translation_from_json
from utils.mock_handler import MockUrl

use_step_matcher('re')

#     for MOCKs


@step('User opens mock payment page with incorrect request type in config file')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.open_page(CONFIGURATION.URL.BASE_URL)


@then('User remains on checkout page')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.validate_base_url(CONFIGURATION.URL.BASE_URL[8:])


@step('User changes page language to "(?P<language>.+)"')
def step_impl(context, language):
    context.language = language
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    jwt = get_translation_from_json(language, 'jwt')
    payment_page.open_page(f'{CONFIGURATION.URL.BASE_URL}?jwt={jwt}')


@step('User changes minimal example page language to "(?P<language>.+)"')
def step_impl(context, language):
    context.language = language
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    jwt = get_translation_from_json(language, 'jwt')
    payment_page.open_page(f'{CONFIGURATION.URL.BASE_URL}/minimal.html?jwt={jwt}')


@step('User opens mock payment page')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    if 'Safari' in context.browser:
        accept_untrusted_pages_on_safari_browsers_mocks(context)
    if 'parent_iframe' in context.scenario.tags:
        # TODO this case should be moved to User opens mock payment page (?P<example_page>.+)')
        payment_page.open_page(CONFIGURATION.URL.BASE_URL + '/iframe.html')
        payment_page.switch_to_example_page_parent_iframe()
        payment_page.wait_for_example_page_parent_iframe()
    else:
        payment_page.open_page(CONFIGURATION.URL.BASE_URL)


@step('User opens mock payment page (?P<example_page>.+)')
def step_impl(context, example_page):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    if 'Safari' in context.browser:
        accept_untrusted_pages_on_safari_browsers_mocks(context)
    if 'WITH_UPDATE_JWT' in example_page:
        jwt = ''
        updated_jwt_from_jsinit = ''
        for row in context.table:
            jwt = encode_jwt_for_json(JwtConfig[f'{row["jwtName"]}'])
            stub_jsinit_update_jwt_request(f'{row["jwtName"]}')
            updated_jwt_from_jsinit = decode_jwt_from_jsinit(jsinit_response[f'{row["jwtName"]}'])
        url = f'{CONFIGURATION.URL.BASE_URL}/?{ExamplePageParam[example_page].value % jwt}'
        payment_page.open_page(url)
        context.update_jwt = jwt  # test data replaced to check required value in assertion
        context.update_jwt_from_jsinit = updated_jwt_from_jsinit
    elif 'WITH_SPECIFIC_IFRAME' in example_page:
        url = f'{CONFIGURATION.URL.BASE_URL}/{ExamplePageParam[example_page].value}'
        payment_page.open_page(url)
        payment_page.switch_to_example_page_parent_iframe()
        payment_page.wait_for_example_page_parent_iframe()
    else:
        if 'MINIMAL_HTML' in example_page or 'IN_IFRAME' in example_page:
            url = f'{CONFIGURATION.URL.BASE_URL}/{ExamplePageParam[example_page].value}'
            payment_page.open_page(url)
        else:
            url = f'{CONFIGURATION.URL.BASE_URL}/?{ExamplePageParam[example_page].value}'

        payment_page.open_page(url)


#   E2E


@step('User opens (?:example page|example page (?P<example_page>.+))')
def step_impl(context, example_page):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    if 'Safari' in context.browser:
        accept_untrusted_pages_on_safari_browsers(context)
    # setting url specific params accordingly to example page
    if example_page is None:
        url = f'{CONFIGURATION.URL.BASE_URL}/?{context.inline_e2e_config}'
    elif 'IN_IFRAME' in example_page:
        url = f'{CONFIGURATION.URL.BASE_URL}/{ExamplePageParam[example_page].value}?{context.inline_e2e_config}'
    else:
        url = f'{CONFIGURATION.URL.BASE_URL}/?{ExamplePageParam[example_page].value}&{context.inline_e2e_config}'
    url = url.replace('??', '?').replace('&&', '&')  # just making sure some elements are not duplicated

    payment_page.open_page(url)

    if example_page is not None and 'IN_IFRAME' in example_page:
        payment_page.switch_to_example_page_parent_iframe()


@step('User opens page WITH_UPDATE_JWT and jwt (?P<jwt_config>.+) with additional attributes')
def step_impl(context, jwt_config):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    # parse old jwt config (payload part) to dictionary object
    jwt_payload_dict = get_jwt_config_from_json(JwtConfig[jwt_config].value)['payload']
    # override/add default sitereference from config
    jwt_payload_dict['sitereference'] = CONFIGURATION.SITE_REFERENCE_CARDINAL
    # build payload base on additional attributes
    jwt_payload_dict = InlineConfigBuilder().map_jwt_additional_fields(jwt_payload_dict, context.table)
    jwt = encode_jwt(jwt_payload_dict)

    url = f'{CONFIGURATION.URL.BASE_URL}/?{ExamplePageParam["WITH_UPDATE_JWT"].value % jwt}&{context.inline_e2e_config}'
    url = url.replace('??', '?').replace('&&', '&')  # just making sure some elements are not duplicated
    payment_page.open_page(url)


@step('User opens (?P<path>.+) page with inline param')
def step_impl(context, path):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    url = f'{CONFIGURATION.URL.BASE_URL}/{path}?{context.inline_e2e_config}'
    if 'Safari' in context.browser:
        accept_untrusted_pages_on_safari_browsers(context)
    payment_page.open_page(url)


def accept_untrusted_pages_on_safari_browsers(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.open_page_with_safari_issue_fix(MockUrl.LIBRARY_URL.value)


def accept_untrusted_pages_on_safari_browsers_mocks(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.open_page_with_safari_issue_fix(MockUrl.WEBSERVICES_DOMAIN.value)
    payment_page.open_page_with_safari_issue_fix(MockUrl.WEBSERVICES_STJS_URI.value)
    payment_page.open_page_with_safari_issue_fix(MockUrl.THIRDPARTY_URL.value)
    accept_untrusted_pages_on_safari_browsers(context)
