# type: ignore[no-redef]
from behave import use_step_matcher, step, then
from configuration import CONFIGURATION
from pages.page_factory import Pages
from utils.configurations.inline_config_builder import InlineConfigBuilder
from utils.configurations.jwt_generator import get_jwt_config_from_json, encode_jwt
from utils.enums.example_page_param import ExamplePageParam
from utils.enums.config_jwt import ConfigJwt
from utils.helpers.resources_reader import get_translation_from_json
from utils.mock_handler import MockUrl

use_step_matcher('re')


#     for MOCKs

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

#   E2E


@step('User opens (?:example page|example page (?P<example_page>.+))')
def step_impl(context, example_page):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    if 'Safari' in context.browser:
        accept_untrusted_pages_on_safari_browsers(context)
    # setting url specific params accordingly to example page
    if example_page is None:
        url = f'{CONFIGURATION.URL.BASE_URL}/?{context.INLINE_E2E_CONFIG}'
    elif 'WITH_APM' in example_page:
        url = f'{CONFIGURATION.URL.BASE_URL}/?{context.INLINE_E2E_CONFIG}&{context.INLINE_E2E_CONFIG_APM}'
    elif 'IN_IFRAME' in example_page:
        url = f'{CONFIGURATION.URL.BASE_URL}/{ExamplePageParam[example_page].value}?{context.INLINE_E2E_CONFIG}'
    elif 'WITH_TOKENIZED_CARD' in example_page:
        url = f'{CONFIGURATION.URL.BASE_URL}/?{context.INLINE_E2E_CONFIG}&{context.INLINE_TOKENIZED_E2E_CONFIG}'
    else:
        url = f'{CONFIGURATION.URL.BASE_URL}/?{ExamplePageParam[example_page].value}&{context.INLINE_E2E_CONFIG}'
    url = url.replace('??', '?').replace('&&', '&')  # just making sure some elements are not duplicated

    payment_page.open_page(url)

    if example_page is not None and 'IN_IFRAME' in example_page:
        payment_page.switch_to_example_page_parent_iframe()


@step('User opens page WITH_UPDATE_JWT and jwt (?P<jwt_config>.+) with additional attributes')
def step_impl(context, jwt_config):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    # parse old jwt config (payload part) to dictionary object
    jwt_payload_dict = get_jwt_config_from_json(ConfigJwt[jwt_config].value)['payload']
    # override/add default sitereference from config
    jwt_payload_dict['sitereference'] = CONFIGURATION.SITE_REFERENCE_CARDINAL
    # build payload base on additional attributes
    jwt_payload_dict = InlineConfigBuilder().map_jwt_additional_fields(jwt_payload_dict, context.table)
    jwt = encode_jwt(jwt_payload_dict)
    context.update_jwt = jwt

    url = f'{CONFIGURATION.URL.BASE_URL}/?{ExamplePageParam["WITH_UPDATE_JWT"].value % jwt}&{context.INLINE_E2E_CONFIG}'
    url = url.replace('??', '?').replace('&&', '&')  # just making sure some elements are not duplicated
    payment_page.open_page(url)


@step('User opens page WITH_APM and WITH_UPDATE_JWT - jwt (?P<jwt_config>.+) with additional attributes')
def step_impl(context, jwt_config):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    # parse old jwt config (payload part) to dictionary object
    jwt_payload_dict = get_jwt_config_from_json(ConfigJwt[jwt_config].value)['payload']
    # override/add default sitereference from config
    jwt_payload_dict['sitereference'] = CONFIGURATION.SITE_REFERENCE_CARDINAL
    # build payload base on additional attributes
    jwt_payload_dict = InlineConfigBuilder().map_jwt_additional_fields(jwt_payload_dict, context.table)
    jwt = encode_jwt(jwt_payload_dict)

    url = f'{CONFIGURATION.URL.BASE_URL}/?{ExamplePageParam["WITH_UPDATE_JWT"].value % jwt}' \
          f'&{context.INLINE_E2E_CONFIG}&{context.INLINE_E2E_CONFIG_APM}'
    url = url.replace('??', '?').replace('&&', '&')  # just making sure some elements are not duplicated
    payment_page.open_page(url)


@step('User opens (?P<path>.+) page with inline param')
def step_impl(context, path):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    url = f'{CONFIGURATION.URL.BASE_URL}/{path}?{context.INLINE_E2E_CONFIG}'
    if 'Safari' in context.browser:
        accept_untrusted_pages_on_safari_browsers(context)
    payment_page.open_page(url)


@step('User opens (?P<path>.+) page with inline params')
def step_impl(context, path):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    url = f'{CONFIGURATION.URL.BASE_URL}/{path}?{context.INLINE_E2E_CONFIG}&{context.INLINE_E2E_CONFIG_APM}'
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
