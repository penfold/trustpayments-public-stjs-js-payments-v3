# type: ignore[no-redef]
import time

from assertpy import soft_assertions
from behave import use_step_matcher, step, then
from configuration import CONFIGURATION
from pages.page_factory import Pages
from utils.configurations.jwt_generator import decode_jwt_from_jsinit
from utils.enums.payment_type import PaymentType
from utils.enums.request_type import RequestType, request_type_response, request_type_applepay, request_type_visa, \
    request_type_tokenisation_response, frictionless_request_type, request_type_google, step_up_request_type
from utils.enums.responses.acs_response import ACSresponse
from utils.enums.responses.apple_pay_response import ApplePayResponse
from utils.enums.responses.auth_response import AUTHresponse
from utils.enums.responses.google_pay_response import GooglePayResponse
from utils.enums.responses.invalid_field_response import InvalidFieldResponse
from utils.enums.responses.jsinit_response import JSinitResponse
from utils.enums.responses.tdq_response import TDQresponse
from utils.enums.responses.visa_response import VisaResponse
from utils.enums.responses.walletverify_response import walletverify_response
from utils.mock_handler import stub_st_request_type, MockUrl, stub_payment_status, \
    stub_st_request_type_server_error, stub_jsinit

use_step_matcher('re')


@step('User chooses (?P<payment_method>.+) as payment method')
def step_impl(context, payment_method):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE_MOCK)
    payment_page.choose_payment_methods(PaymentType[payment_method].name)


@step('THREEDQUERY mock response is set to "(?P<tdq_response>.+)"')
def step_impl(context, tdq_response):
    stub_st_request_type(TDQresponse[tdq_response].value, 'THREEDQUERY, AUTH')


@step('Single THREEDQUERY mock response is set to "(?P<tdq_response>.+)"')
def step_impl(context, tdq_response):
    stub_st_request_type(TDQresponse[tdq_response].value, RequestType.THREEDQUERY.name)


@step('Step up (?P<request_type>.+) response is set to OK')
def step_impl(context, request_type):
    stub_st_request_type(request_type_response[request_type], request_type)


@step('ACS mock response is set to "(?P<acs_response>.+)"')
def step_impl(context, acs_response):
    if acs_response == 'OK':
        stub_payment_status(MockUrl.CC_MOCK_ACS_URI.value, ACSresponse[acs_response].value)
    elif acs_response == 'NOACTION':
        stub_payment_status(MockUrl.CC_MOCK_ACS_URI.value, ACSresponse[acs_response].value)
        stub_st_request_type(AUTHresponse.SUCCESS.value, RequestType.AUTH.name)
    elif acs_response == 'FAILURE':
        stub_payment_status(MockUrl.CC_MOCK_ACS_URI.value, ACSresponse[acs_response].value)
        stub_st_request_type(AUTHresponse.MERCHANT_DECLINE.value, RequestType.AUTH.name)
    elif acs_response == 'ERROR':
        stub_payment_status(MockUrl.CC_MOCK_ACS_URI.value, ACSresponse[acs_response].value)


@step('(?P<request_type>.+) mock response for tokenisation is set to OK')
def step_impl(context, request_type):
    stub_st_request_type(request_type_tokenisation_response[request_type], request_type)


@step('InvalidField response set for "(?P<field>.+)"')
def step_impl(context, field):
    stub_st_request_type(InvalidFieldResponse[field].value, RequestType.TDQ_AUTH.value)


@step('ApplePay mock responses are set as (?P<jsinit_response>.+) and payment status (?P<payment_status>.+)')
def step_impl(context, jsinit_response: JSinitResponse, payment_status: ApplePayResponse):
    stub_jsinit(JSinitResponse[jsinit_response].value, RequestType.JSINIT.name)
    stub_st_request_type(walletverify_response['THREEDQUERY, AUTH'], RequestType.WALLETVERIFY.name)
    if payment_status == 'SUCCESS':
        stub_payment_status(MockUrl.APPLEPAY_MOCK_URI.value, ApplePayResponse[payment_status].value)
        stub_st_request_type(ApplePayResponse.APPLE_AUTH_SUCCESS.value, RequestType.TDQ_AUTH.value)
    elif payment_status == 'ERROR':
        stub_payment_status(MockUrl.APPLEPAY_MOCK_URI.value, ApplePayResponse.SUCCESS.value)
        stub_st_request_type_server_error(RequestType.TDQ_AUTH.value)
    elif payment_status == 'DECLINE':
        stub_payment_status(MockUrl.APPLEPAY_MOCK_URI.value, ApplePayResponse.SUCCESS.value)
        stub_st_request_type(ApplePayResponse.ERROR.value, RequestType.TDQ_AUTH.value)
    elif payment_status == 'CANCEL':
        stub_payment_status(MockUrl.APPLEPAY_MOCK_URI.value, ApplePayResponse[payment_status].value)
    else:
        stub_payment_status(MockUrl.APPLEPAY_MOCK_URI.value, ApplePayResponse.SUCCESS.value)
        stub_st_request_type(request_type_applepay[payment_status], payment_status)


@step('Frictionless card payment mock responses are set as (?P<jsinit_response>.+) and payment status (?P<payment_status>.+)')
def step_impl(context, jsinit_response: JSinitResponse, payment_status):
    stub_jsinit(JSinitResponse[jsinit_response].value, RequestType.JSINIT.name)
    stub_st_request_type(frictionless_request_type[payment_status], RequestType.TDQ_AUTH.value)


@step('Challenge card payment mock responses are set as (?P<jsinit_response>.+) and payment status (?P<payment_status>.+)')
def step_impl(context, jsinit_response: JSinitResponse, payment_status):
    stub_jsinit(JSinitResponse[jsinit_response].value, RequestType.JSINIT.name)
    stub_st_request_type(TDQresponse.ENROLLED_Y.value, RequestType.TDQ_AUTH.value)
    stub_st_request_type(AUTHresponse[payment_status].value, RequestType.AUTH.name)


@step('Card payment mock responses are set as (?P<jsinit_response>.+) and request type (?P<request_types>.+)')
def step_impl(context, jsinit_response: JSinitResponse, request_types):
    stub_jsinit(JSinitResponse[jsinit_response].value, RequestType.JSINIT.name)
    stub_st_request_type(request_type_response[request_types], request_types)


@step('Challenge card payment mock responses are set as (?P<jsinit_response>.+) and request type (?P<request_types>.+)')
def step_impl(context, jsinit_response: JSinitResponse, request_types):
    stub_jsinit(JSinitResponse[jsinit_response].value, RequestType.JSINIT.name)
    stub_st_request_type(step_up_request_type[request_types], request_types)

@step('ApplePay mock responses are set as (?P<jsinit_response>.+) and request type (?P<request_type>.+)')
def step_impl(context, jsinit_response: JSinitResponse, request_type):
    stub_jsinit(JSinitResponse[jsinit_response].value, RequestType.JSINIT.name)
    stub_st_request_type(walletverify_response[request_type], RequestType.WALLETVERIFY.name)
    stub_payment_status(MockUrl.APPLEPAY_MOCK_URI.value, ApplePayResponse.SUCCESS.value)
    stub_st_request_type(request_type_applepay[request_type], request_type)


@step('Visa Checkout mock responses are set as (?P<jsinit_response>.+) and payment status (?P<payment_status>.+)')
def step_impl(context, jsinit_response: JSinitResponse, payment_status: VisaResponse):
    stub_jsinit(JSinitResponse[jsinit_response].value, RequestType.JSINIT.name)
    if payment_status == 'ERROR':
        stub_payment_status(MockUrl.VISA_MOCK_URI.value, VisaResponse.SUCCESS.value)
        stub_st_request_type(VisaResponse.ERROR.value, RequestType.TDQ_AUTH.value)
    else:
        stub_payment_status(MockUrl.VISA_MOCK_URI.value, VisaResponse[payment_status].value)
        stub_st_request_type(VisaResponse.VISA_AUTH_SUCCESS.value, RequestType.TDQ_AUTH.value)


@step('Visa Checkout mock responses are set as (?P<jsinit_response>.+) and request type (?P<request_type>.+)')
def step_impl(context, jsinit_response: JSinitResponse, request_type):
    stub_jsinit(JSinitResponse[jsinit_response].value, RequestType.JSINIT.name)
    stub_payment_status(MockUrl.VISA_MOCK_URI.value, VisaResponse.SUCCESS.value)
    stub_st_request_type(request_type_visa[request_type], request_type)


@step('Google Pay mock responses are set as (?P<jsinit_response>.+) and payment status (?P<payment_status>.+)')
def step_impl(context, jsinit_response: JSinitResponse, payment_status: GooglePayResponse):
    stub_jsinit(JSinitResponse[jsinit_response].value, RequestType.JSINIT.name)
    if payment_status == 'SUCCESS':
        stub_payment_status(MockUrl.GOOGLE_PAY_MOCK_URI.value, GooglePayResponse.SUCCESS.value)
        stub_st_request_type(GooglePayResponse.GOOGLE_AUTH_SUCCESS.value, RequestType.AUTH.value)
    elif payment_status == 'ERROR':
        stub_payment_status(MockUrl.GOOGLE_PAY_MOCK_URI.value, GooglePayResponse.SUCCESS.value)
        stub_st_request_type(GooglePayResponse.ERROR.value, RequestType.AUTH.value)
    elif payment_status == 'CANCEL':
        stub_payment_status(MockUrl.GOOGLE_PAY_MOCK_URI.value, GooglePayResponse[payment_status].value)


@step('Google Pay mock responses are set as (?P<jsinit_response>.+) and request type (?P<request_type>.+)')
def step_impl(context, jsinit_response: JSinitResponse, request_type):
    stub_jsinit(JSinitResponse[jsinit_response].value, RequestType.JSINIT.name)
    stub_payment_status(MockUrl.GOOGLE_PAY_MOCK_URI.value, GooglePayResponse.SUCCESS.value)
    stub_st_request_type(request_type_google[request_type], request_type)

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
    if 'config_immediate_payment' in context.scenario.tags[0] or 'start_on_load' in context.scenario.tags[0]:
        validate_number_of_requests_without_data(context, request_type, 1)
    elif 'config_tokenisation' in context.scenario.tags[0]:
        page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE_MOCK)
        page.validate_number_of_tokenisation_requests(request_type, context.cvv, 1)
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


@step('(?P<request_type>.+) request was sent (?P<multiple>.+) time')
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


@step('following requests were sent only once')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE_MOCK)
    with soft_assertions():
        for row in context.table:
            request_type = row['request_type']
            if request_type in ['APPLE_PAY', 'GOOGLE_PAY', 'VISA_CHECKOUT']:
                payment_page.validate_number_of_requests_to_thirdparty(request_type, 1)
                walletsource = request_type
            else:
                payment_page.validate_number_of_requests_with_walletsource(request_type, PaymentType[walletsource].value, 1)


@step('following requests were sent only once (?P<status>.+) \'fraudcontroltransactionid\' flag')
def step_impl(context, status):
    page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE_MOCK)
    expected_request_number = {
        'with': 1,
        'without': 0
    }
    with soft_assertions():
        for row in context.table:
            page.validate_number_of_requests_with_fraudcontroltransactionid_flag(row['request_type'], expected_request_number[status])


@step('(?P<request_type>.+) requests contains updated jwt')
def step_impl(context, request_type):
    page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE_MOCK)
    time.sleep(20)
    updated_jwt = context.update_jwt
    if request_type == 'WALLETVERIFY':
        updated_jwt = decode_jwt_from_jsinit(JSinitResponse.JSINIT_UPDATED_JWT.value)
    page.validate_updated_jwt_in_request(request_type, MockUrl.GATEWAY_MOCK_URI.value, updated_jwt, 1)
