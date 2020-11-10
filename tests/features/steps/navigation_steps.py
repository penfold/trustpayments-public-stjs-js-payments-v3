# type: ignore[no-redef]
from assertpy import soft_assertions
from behave import use_step_matcher, step, then

from configuration import CONFIGURATION
from utils.configurations.jwt_generator import encode_jwt_for_json
from utils.dict.url_after_redirection import url_after_redirection
from utils.enums.example_page import ExamplePage
from utils.enums.jwt_config import JwtConfig
from utils.mock_handler import MockUrl

use_step_matcher('re')


@step('User opens page with payment form')
def step_impl(context):
    payment_page = context.page_factory.get_page(page_name='payment_methods')
    if 'config_immediate_payment' not in context.scenario.tags[0] and 'parent_iframe' not in context.scenario.tags and \
        'config_cybertonica_immediate_payment' not in context.scenario.tags:
        payment_page.open_page(CONFIGURATION.URL.BASE_URL)
        payment_page.wait_for_iframe()


@step('User opens minimal example page with payment form')
def step_impl(context):
    payment_page = context.page_factory.get_page(page_name='payment_methods')
    if 'config_immediate_payment' not in context.scenario.tags[0] and 'parent_iframe' not in context.scenario.tags and \
        'config_cybertonica_immediate_payment' not in context.scenario.tags:
        payment_page.open_page(f'{CONFIGURATION.URL.BASE_URL}/minimal.html?')
        payment_page.wait_for_iframe()


@step('User opens payment page')
def step_impl(context):
    payment_page = context.page_factory.get_page(page_name='payment_methods')
    if 'parent_iframe' in context.scenario.tags:
        payment_page.open_page(CONFIGURATION.URL.BASE_URL + '/iframe.html')
        payment_page.switch_to_parent_iframe()
        payment_page.wait_for_parent_iframe()
    else:
        payment_page.open_page(CONFIGURATION.URL.BASE_URL)


@step('User opens prepared payment form page (?P<example_page>.+)')
def step_impl(context, example_page: ExamplePage):
    payment_page = context.page_factory.get_page(page_name='payment_methods')
    if 'WITH_UPDATE_JWT' in example_page:
        jwt = ''
        for row in context.table:
            jwt = encode_jwt_for_json(JwtConfig[f'{row["jwtName"]}'])
        payment_page.open_page(f'{CONFIGURATION.URL.BASE_URL}/?{ExamplePage[example_page].value % jwt}')
        payment_page.wait_for_iframe()
        context.test_data.update_jwt = jwt  # test data replaced to check required value in assertion
    elif 'WITH_SPECIFIC_IFRAME' in example_page:
        payment_page.open_page(f'{CONFIGURATION.URL.BASE_URL}/{ExamplePage[example_page].value}')
        payment_page.switch_to_parent_iframe()
        payment_page.wait_for_parent_iframe()
    elif 'WITH_CHANGED_FORM_ID' in example_page:
        payment_page.open_page(f'{CONFIGURATION.URL.BASE_URL}/?{ExamplePage[example_page].value}')
    else:
        payment_page.open_page(f'{CONFIGURATION.URL.BASE_URL}/?{ExamplePage[example_page].value}')
        payment_page.wait_for_iframe()


@step('User opens (?:example page|example page (?P<example_page>.+))')
def step_impl(context, example_page: ExamplePage):
    payment_page = context.page_factory.get_page(page_name='payment_methods')
    # setting url specific params accordingly to example page
    if example_page is None:
        url = f'{CONFIGURATION.URL.BASE_URL}/?{context.inline_config}'
    elif 'IN_IFRAME' in example_page:
        url = f'{CONFIGURATION.URL.BASE_URL}/{ExamplePage[example_page].value}{context.inline_config}'
    elif 'WITH_UPDATE_JWT' in example_page:
        jwt = ''
        for row in context.table:
            jwt = encode_jwt_for_json(JwtConfig[f'{row["jwtName"]}'])
        url = f'{CONFIGURATION.URL.BASE_URL}/?{ExamplePage[example_page].value % jwt}{context.inline_config}'
    else:
        url = f'{CONFIGURATION.URL.BASE_URL}/?{ExamplePage[example_page].value}&{context.inline_config}'
    url = url.replace('??', '?').replace('&&', '&')  # just making sure some elements are not duplicated

    payment_page.open_page(url)

    if example_page is not None and 'IN_IFRAME' in example_page:
        payment_page.switch_to_parent_iframe()
    if 'e2e_config_submit_on_error_invalid_jwt' not in context.scenario.tags:
        payment_page.wait_for_iframe()


@step('User opens minimal example page')
def step_impl(context):
    payment_page = context.page_factory.get_page(page_name='payment_methods')
    url = f'{CONFIGURATION.URL.BASE_URL}/minimal.html?{context.inline_config}'
    payment_page.open_page(url)


@then('User remains on checkout page')
def step_impl(context):
    payment_page = context.page_factory.get_page(page_name='payment_methods')
    payment_page.validate_base_url(CONFIGURATION.URL.BASE_URL[8:])


@then('User is redirected to action page')
def step_impl(context):
    payment_page = context.page_factory.get_page(page_name='payment_methods')
    for key, value in url_after_redirection.items():
        if key in context.scenario.name:
            if 'Cardinal Commerce - successful' in key and 'IE' in CONFIGURATION.REMOTE_BROWSER:
                payment_page.validate_if_url_contains_info_about_payment(url_after_redirection['IE - success'])
            elif 'Cardinal Commerce - error' in key and 'IE' in CONFIGURATION.REMOTE_BROWSER:
                payment_page.validate_if_url_contains_info_about_payment(url_after_redirection['IE - error'])
            else:
                payment_page.validate_if_url_contains_info_about_payment(value)
                break


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
