from enum import Enum

from wiremock.constants import Config
from wiremock.resources.mappings import Mapping, MappingRequest, HttpMethods, MappingResponse
from wiremock.resources.mappings.resource import Mappings
from utils.helpers.resources_reader import get_mock_from_json


class MockUrl(Enum):
    BASE_URI = 'https://merchant.example.com:8443'
    WEBSERVICES_DOMAIN = 'https://webservices.securetrading.net:6443'
    WEBSERVICES_STJS_URI = 'https://webservices.securetrading.net:6443/st.js'
    STJS_URI = 'https://library.securetrading.net:8443/st.js'
    THIRDPARTY_URL = 'https://thirdparty.example.com:6443'
    LIBRARY_URL = 'https://library.securetrading.net:8443'
    VISA_MOCK_URI = '/visaPaymentStatus'
    CC_MOCK_ACS_URI = '/cardinalAuthenticateCard'
    APPLEPAY_MOCK_URI = '/applePaymentStatus'
    GOOGLE_PAY_MOCK_URI = '/googlePaymentStatus'
    GATEWAY_MOCK_URI = '/jwt/'
    CONFIG_MOCK_URI = '/config.json'
    PORT = 8443


def configure_for_local_host():
    Config.base_url = f'{MockUrl.WEBSERVICES_DOMAIN.value}/__admin'
    Config.requests_verify = False


def configure_for_thirdparty_host():
    Config.base_url = f'{MockUrl.THIRDPARTY_URL.value}/__admin'
    Config.requests_verify = False


def stub_config(config_json):
    mapping = Mapping(
        priority=100,
        request=MappingRequest(
            method=HttpMethods.GET,
            url=MockUrl.CONFIG_MOCK_URI.value
        ),
        response=MappingResponse(
            status=200,
            headers={'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization, st-request-types',
                     'Access-Control-Allow-Methods': 'GET, POST',
                     'Access-Control-Allow-Origin': '*'},
            json_body=get_mock_from_json(config_json)
        ),
        persistent=False)
    Mappings.create_mapping(mapping)


def stub_st_request_type(mock_json, request_type):
    configure_for_local_host()
    stub_url_options_for_cors(MockUrl.GATEWAY_MOCK_URI.value)
    mapping = Mapping(
        priority=100,
        request=MappingRequest(
            method=HttpMethods.POST,
            url=MockUrl.GATEWAY_MOCK_URI.value,
            headers={'st-request-types': {'equalTo': request_type}}
        ),
        response=MappingResponse(
            status=200,
            headers={'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization, st-request-types',
                     'Access-Control-Allow-Methods': 'GET, POST',
                     'Access-Control-Allow-Origin': '*'},
            json_body=get_mock_from_json(mock_json)
        ),
        persistent=False)
    Mappings.create_mapping(mapping)


def stub_jsinit(mock_json, request_type):
    configure_for_local_host()
    stub_url_options_for_cors(MockUrl.GATEWAY_MOCK_URI.value)
    mapping = Mapping(
        priority=100,
        request=MappingRequest(
            method=HttpMethods.POST,
            url=MockUrl.GATEWAY_MOCK_URI.value,
            body_patterns=[{'matchesJsonPath': '$.request[:1][?(@.requesttypedescriptions==[' + request_type + '])]'}]
        ),
        response=MappingResponse(
            status=200,
            headers={'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization, st-request-types',
                     'Access-Control-Allow-Methods': 'GET, POST',
                     'Access-Control-Allow-Origin': '*'},
            json_body=get_mock_from_json(mock_json)
        ),
        persistent=False)
    Mappings.create_mapping(mapping)


def stub_st_request_type_server_error(mock_json, request_type=None):
    configure_for_local_host()
    stub_url_options_for_cors(MockUrl.GATEWAY_MOCK_URI.value)
    mapping = Mapping(
        priority=100,
        request=MappingRequest(
            method=HttpMethods.POST,
            url=MockUrl.GATEWAY_MOCK_URI.value,
            body_patterns=[{'contains': request_type}]
        ),
        response=MappingResponse(
            status=500,
            headers={'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization, st-request-types',
                     'Access-Control-Allow-Methods': 'GET, POST',
                     'Access-Control-Allow-Origin': '*'},

            json_body=get_mock_from_json(mock_json)
        ),
        persistent=False)
    Mappings.create_mapping(mapping)


def stub_payment_status(mock_url, mock_json):
    configure_for_thirdparty_host()
    stub_url_options_for_cors(MockUrl.CC_MOCK_ACS_URI.value)
    mapping = Mapping(
        priority=100,
        request=MappingRequest(
            method=HttpMethods.GET,
            url=mock_url
        ),
        response=MappingResponse(
            status=200,
            headers={'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization, st-request-types',
                     'Access-Control-Allow-Methods': 'GET, POST',
                     'Access-Control-Allow-Origin': '*'},
            json_body=get_mock_from_json(mock_json)
        ),
        persistent=False)
    Mappings.create_mapping(mapping)


def stub_url_options_for_cors(mock_url):
    mapping = Mapping(
        priority=100,
        request=MappingRequest(
            method=HttpMethods.OPTIONS,
            url=mock_url
        ),
        response=MappingResponse(
            status=200,
            headers={'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization, st-request-types',
                     'Access-Control-Allow-Methods': 'GET, POST',
                     'Access-Control-Allow-Origin': '*'},
            body=''
        ),
        persistent=False)
    Mappings.create_mapping(mapping)
