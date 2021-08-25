# type: ignore[no-redef]
import time

from behave import use_step_matcher, given, step, when, then

from configuration import CONFIGURATION
from pages.page_factory import Pages
from utils.enums.config import config
from utils.enums.payment_type import PaymentType
from utils.enums.request_type import RequestType, request_type_response, request_type_applepay, request_type_visa, \
    request_type_tokenisation_response, frictionless_request_type, step_up_request_type, request_type_google
from utils.enums.responses.acs_response import ACSresponse
from utils.enums.responses.apple_pay_response import ApplePayResponse
from utils.enums.responses.auth_response import AUTHresponse
from utils.enums.responses.google_pay_response import GooglePayResponse
from utils.enums.responses.jsinit_response import jsinit_response
from utils.enums.responses.tdq_response import TDQresponse
from utils.enums.responses.visa_response import VisaResponse
from utils.enums.responses.walletverify_response import walletverify_response
from utils.helpers.request_executor import remove_item_from_request_journal
from utils.mock_handler import stub_config, stub_st_request_type, MockUrl, stub_payment_status, \
    stub_st_request_type_server_error, stub_jsinit

use_step_matcher('re')


@given('JavaScript configuration is set for scenario based on scenario\'s @config tag')
def step_impl(context):
    remove_item_from_request_journal()
    stub_jsinit_request(context)
    stub_config(config[context.scenario.tags[0]])


@step('THREEDQUERY mock response is set to "(?P<tdq_response>.+)"')
def step_impl(context, tdq_response):
    stub_st_request_type(TDQresponse[tdq_response].value, 'THREEDQUERY, AUTH')


@step('Single THREEDQUERY mock response is set to "(?P<tdq_response>.+)"')
def step_impl(context, tdq_response):
    stub_st_request_type(TDQresponse[tdq_response].value, RequestType.THREEDQUERY.name)


@step('(?P<request_type>.+) mock response is set to OK')
def step_impl(context, request_type):
    stub_st_request_type(request_type_response[request_type], request_type)


@step('Step up (?P<request_type>.+) response is set to OK')
def step_impl(context, request_type):
    stub_st_request_type(step_up_request_type[request_type], request_type)


@step('(?P<request_type>.+) ApplePay mock response is set to SUCCESS')
def step_impl(context, request_type):
    stub_st_request_type(walletverify_response[request_type], RequestType.WALLETVERIFY.name)
    stub_payment_status(MockUrl.APPLEPAY_MOCK_URI.value, ApplePayResponse.SUCCESS.value)
    stub_st_request_type(request_type_applepay[request_type], request_type)


@step('(?P<request_type>.+) Visa Checkout mock response is set to SUCCESS')
def step_impl(context, request_type):
    stub_payment_status(MockUrl.VISA_MOCK_URI.value, VisaResponse.SUCCESS.value)
    stub_st_request_type(request_type_visa[request_type], request_type)


@step('(?P<request_type>.+) GooglePay mock response is set to SUCCESS')
def step_impl(context, request_type):
    stub_payment_status(MockUrl.GOOGLE_PAY_MOCK_URI.value, GooglePayResponse.SUCCESS.value)
    stub_st_request_type(request_type_google[request_type], request_type)


@step('ACS mock response is set to "(?P<acs_response>.+)"')
def step_impl(context, acs_response):
    if acs_response == 'OK':
        stub_payment_status(MockUrl.CC_MOCK_ACS_URI.value, ACSresponse[acs_response].value)
    elif acs_response == 'NOACTION':
        stub_payment_status(MockUrl.CC_MOCK_ACS_URI.value, ACSresponse[acs_response].value)
        stub_st_request_type(AUTHresponse.OK.value, RequestType.AUTH.name)
    elif acs_response == 'FAILURE':
        stub_payment_status(MockUrl.CC_MOCK_ACS_URI.value, ACSresponse[acs_response].value)
        stub_st_request_type(AUTHresponse.MERCHANT_DECLINE.value, RequestType.AUTH.name)
    elif acs_response == 'ERROR':
        stub_payment_status(MockUrl.CC_MOCK_ACS_URI.value, ACSresponse[acs_response].value)


@step('User clicks Pay button - (?P<request_type>.+) response is set to "(?P<action_code>.+)"')
def step_impl(context, request_type, action_code):
    page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    if request_type == 'AUTH':
        stub_st_request_type(AUTHresponse[action_code].value, RequestType.AUTH.name)
    else:
        stub_st_request_type(request_type_response[request_type], request_type)

    if 'IE' in context.browser and 'config_submit_cvv_only' in context.scenario.tags:
        context.waits.wait_for_javascript()
    page.choose_payment_methods(PaymentType.CARDINAL_COMMERCE.name)
    if 'config_submit_on' not in context.scenario.tags[0]:
        page.scroll_to_top()


@when('User chooses Visa Checkout as payment method - visa response is set to "(?P<action_code>.+)"')
def step_impl(context, action_code):
    context.action_code = action_code
    page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    if action_code == 'ERROR':
        stub_payment_status(MockUrl.VISA_MOCK_URI.value, VisaResponse.SUCCESS.value)
        stub_st_request_type(VisaResponse.ERROR.value, 'THREEDQUERY, AUTH')
    else:
        stub_payment_status(MockUrl.VISA_MOCK_URI.value, VisaResponse[action_code].value)
        stub_st_request_type(VisaResponse.VISA_AUTH_SUCCESS.value, 'THREEDQUERY, AUTH')
    page.choose_payment_methods(PaymentType.VISA_CHECKOUT.name)


@when('User chooses GooglePay as payment method - response is set to "(?P<action_code>.+)"')
def step_impl(context, action_code):
    context.action_code = action_code
    page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    if action_code == 'SUCCESS':
        stub_payment_status(MockUrl.GOOGLE_PAY_MOCK_URI.value, GooglePayResponse[action_code].value)
        stub_st_request_type(GooglePayResponse.GOOGLE_AUTH_SUCCESS.value, 'THREEDQUERY, AUTH')
    elif action_code == 'ERROR':
        stub_payment_status(MockUrl.GOOGLE_PAY_MOCK_URI.value, GooglePayResponse.SUCCESS.value)
        stub_st_request_type(GooglePayResponse.ERROR.value, 'THREEDQUERY, AUTH')
    elif action_code == 'CANCEL':
        stub_payment_status(MockUrl.GOOGLE_PAY_MOCK_URI.value, GooglePayResponse[action_code].value)
    page.choose_payment_methods(PaymentType.GOOGLE_PAY.name)


@when('User chooses ApplePay as payment method - response is set to "(?P<action_code>.+)"')
def step_impl(context, action_code):
    context.action_code = action_code
    page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    stub_st_request_type(walletverify_response['THREEDQUERY, AUTH'], RequestType.WALLETVERIFY.name)
    if action_code == 'SUCCESS':
        stub_payment_status(MockUrl.APPLEPAY_MOCK_URI.value, ApplePayResponse[action_code].value)
        stub_st_request_type(ApplePayResponse.APPLE_AUTH_SUCCESS.value, 'THREEDQUERY, AUTH')
    elif action_code == 'ERROR':
        stub_payment_status(MockUrl.APPLEPAY_MOCK_URI.value, ApplePayResponse.SUCCESS.value)
        stub_st_request_type_server_error('THREEDQUERY, AUTH')
    elif action_code == 'DECLINE':
        stub_payment_status(MockUrl.APPLEPAY_MOCK_URI.value, ApplePayResponse.SUCCESS.value)
        stub_st_request_type(ApplePayResponse.ERROR.value, 'THREEDQUERY, AUTH')
    elif action_code == 'CANCEL':
        stub_payment_status(MockUrl.APPLEPAY_MOCK_URI.value, ApplePayResponse[action_code].value)
    page.choose_payment_methods(PaymentType.APPLE_PAY.name)


@step('(?P<request_type>.+) response is set to "(?P<action_code>.+)"')
def step_impl(context, request_type, action_code):
    stub_st_request_type(AUTHresponse[action_code].value, RequestType.AUTH.name)


@step('Frictionless THREEDQUERY, AUTH response is set to (?P<action_code>.+)')
def step_impl(context, action_code):
    stub_st_request_type(frictionless_request_type[action_code], 'THREEDQUERY, AUTH')


@step('(?P<request_type>.+) mock response for tokenisation is set to OK')
def step_impl(context, request_type):
    stub_st_request_type(request_type_tokenisation_response[request_type], request_type)


# Number of request:


def validate_number_of_requests_without_data(context, request_types, multiple):
    page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE_MOCK)
    page.validate_number_of_requests_without_data(request_types, multiple)


def validate_number_of_requests_with_pan_expirydate_cvv(context, request_types, multiple):
    page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE_MOCK)
    page.validate_number_of_requests_with_data(request_types, context.pan, context.exp_date, context.cvv,
                                               multiple)


def validate_number_of_requests_with_pan_expirydate(context, request_types, multiple):
    page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE_MOCK)
    page.validate_number_of_requests_with_data(request_types, context.pan, context.exp_date, '', multiple)


def validate_number_of_requests_with_cvv(context, request_types, multiple):
    page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE_MOCK)
    page.validate_number_of_requests_with_data(request_types, '', '', context.cvv, multiple)


@step('(?P<request_type>.+) ware sent only once in one request')
def step_impl(context, request_type):
    if 'config_immediate_payment' in context.scenario.tags[0] or 'config_start_on_load' in context.scenario.tags[0]:
        validate_number_of_requests_without_data(context, request_type, 1)
    elif 'config_tokenisation' in context.scenario.tags[0]:
        page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE_MOCK)
        page.validate_number_of_tokenisation_requests(request_type, context.cvv, 1)
    elif 'submit_without_cvv' in context.scenario.tags:
        validate_number_of_requests_with_pan_expirydate(context, request_type, 1)
    elif 'submit_cvv_only' in context.scenario.tags:
        validate_number_of_requests_with_cvv(context, request_type, 1)
    else:
        validate_number_of_requests_with_pan_expirydate_cvv(context, request_type, 1)


@step('AUTH and THREEDQUERY requests were sent only once')
def step_impl(context):
    # pylint: disable=else-if-used
    page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE_MOCK)
    if 'config_immediate_payment' in context.scenario.tags[0] or (
        'config_tokenisation_visa' in context.scenario.tags and 'IE' in CONFIGURATION.REMOTE_BROWSER):
        validate_number_of_requests_without_data(context, RequestType.THREEDQUERY.name, 1)
        validate_number_of_requests_without_data(context, RequestType.AUTH.name, 1)
    else:
        # ToDo
        if 'config_submit_cvv_only' in context.scenario.tags and ('IE' in CONFIGURATION.REMOTE_BROWSER):
            pass
        else:
            page.validate_number_of_requests_with_data('THREEDQUERY, AUTH', '', '', context.cvv, 1)


@step('AUTH request was sent only once')
def step_impl(context):
    validate_number_of_requests_without_data(context, RequestType.AUTH.name, 1)


@then('JSINIT request was sent only once')
def step_impl(context):
    context.waits.wait_for_javascript()
    validate_number_of_requests_without_data(context, RequestType.JSINIT.name, 1)


@step('(?P<request_type>.+) request was not sent')
def step_impl(context, request_type):
    validate_number_of_requests_without_data(context, request_type, 0)


@then('(?P<request_type>.+) request was sent (?P<multiple>.+) time')
def step_impl(context, request_type, multiple):
    context.waits.wait_for_javascript()
    validate_number_of_requests_without_data(context, RequestType[request_type].name, int(multiple))


@step('AUTH and THREEDQUERY requests were sent only once with correct data')
def step_impl(context):
    validate_number_of_requests_with_pan_expirydate_cvv(context, 'THREEDQUERY, AUTH', 1)
    validate_number_of_requests_with_pan_expirydate_cvv(context, RequestType.AUTH.name, 1)


@step('Frictionless AUTH and THREEDQUERY requests were sent only once with correct data')
def step_impl(context):
    page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE_MOCK)
    page.validate_number_of_requests_with_data('THREEDQUERY, AUTH', context.pan, context.exp_date,
                                               context.cvv, 1)


@step('THREEDQUERY request was sent only once with correct data')
def step_impl(context):
    validate_number_of_requests_with_pan_expirydate_cvv(context, 'THREEDQUERY, AUTH', 1)


@step('Single THREEDQUERY request was sent only once with correct data')
def step_impl(context):
    page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE_MOCK)
    page.validate_number_of_requests_without_data('THREEDQUERY', 1)


@step('(?P<thirdparty>.+) or AUTH requests were sent only once with correct data')
def step_impl(context, thirdparty):
    page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE_MOCK)
    context.thirdparty = thirdparty
    if 'VISA_CHECKOUT' in thirdparty:
        page.validate_number_of_wallet_verify_requests(MockUrl.VISA_MOCK_URI.value, 1)
    elif 'APPLE_PAY' in thirdparty:
        page.validate_number_of_wallet_verify_requests(MockUrl.APPLEPAY_MOCK_URI.value, 1)
    elif 'GOOGLE_PAY' in thirdparty:
        page.validate_number_of_wallet_verify_requests(MockUrl.GOOGLE_PAY_MOCK_URI.value, 1)

    if 'SUCCESS' in context.action_code or 'DECLINE' in context.action_code or 'ERROR' in context.action_code:
        page.validate_number_of_thirdparty_requests('THREEDQUERY, AUTH', PaymentType[thirdparty].value, 1)
    else:
        page.validate_number_of_thirdparty_requests('THREEDQUERY, AUTH', PaymentType[thirdparty].value, 0)


@step('(?P<request_type>.+) request was sent only once (?P<scenario>.+) \'fraudcontroltransactionid\' flag')
def step_impl(context, request_type, scenario):
    page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE_MOCK)
    if scenario == 'with':
        if 'config_cybertonica_immediate_payment' in context.scenario.tags \
            or 'Visa Checkout - Cybertonica' in context.scenario.name \
            or 'ApplePay - Cybertonica' in context.scenario.name \
            or 'GooglePay - Cybertonica' in context.scenario.name:
            page.validate_number_of_requests_with_fraudcontroltransactionid_flag(request_type, 1)
        else:
            page.validate_number_of_requests_with_data_and_fraudcontroltransactionid_flag(request_type,
                                                                                          context.pan,
                                                                                          context.exp_date,
                                                                                          context.cvv, 1)
    elif 'Visa Checkout - Cybertonica' in context.scenario.name or 'ApplePay - Cybertonica' \
        or 'GooglePay - Cybertonica' in context.scenario.name:
        page.validate_number_of_requests_with_fraudcontroltransactionid_flag(request_type, 0)
    else:
        page.validate_number_of_requests_with_data_and_fraudcontroltransactionid_flag(request_type,
                                                                                      context.pan,
                                                                                      context.exp_date,
                                                                                      context.cvv, 0)


@step('(?P<request_type>.+) request for (?P<thirdparty>.+) is sent only once with correct data')
def step_impl(context, request_type, thirdparty):
    page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE_MOCK)
    page.validate_number_of_thirdparty_requests(request_type, PaymentType[thirdparty].value, 1)


@step('(?P<request_type>.+) requests contains updated jwt')
def step_impl(context, request_type):
    page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE_MOCK)
    if 'WALLETVERIFY' in request_type and 'APPLE_PAY' in context.thirdparty:
        page.validate_updated_jwt_in_request(request_type, MockUrl.APPLEPAY_MOCK_URI.value,
                                             context.update_jwt, 1)
    elif 'VISA_CHECKOUT' in request_type:
        page.validate_updated_jwt_in_request_for_visa(PaymentType.VISA_CHECKOUT.value,
                                                      context.update_jwt_from_jsinit, 1)

    else:
        page.validate_updated_jwt_in_request(request_type, MockUrl.GATEWAY_MOCK_URI.value,
                                             context.update_jwt, 1)


def stub_jsinit_request(context):
    default_jsinit = True
    if 'config_skip_jsinit' not in context.scenario.tags:
        for key, value in jsinit_response.items():
            if key == context.scenario.tags[0]:
                stub_jsinit(value, RequestType.JSINIT.name)
                default_jsinit = False
                break
        if default_jsinit:
            stub_jsinit('jsinit.json', RequestType.JSINIT.name)


def stub_jsinit_update_jwt_request(value):
    stub_jsinit(jsinit_response[value], RequestType.JSINIT.name)
