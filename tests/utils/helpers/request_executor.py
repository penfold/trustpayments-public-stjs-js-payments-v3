import json

import requests
from requests.auth import HTTPBasicAuth

from utils.read_configuration import get_from_env

browserstack_username = get_from_env('BS_USERNAME')
browserstack_access_key = get_from_env('BS_ACCESS_KEY')

shared_dict = {}

BROWSERSTACK_API_URL = 'https://api.browserstack.com/automate/sessions/'
WEBSERVICES_URL = 'https://webservices.securetrading.net:6443/'
WEBSERVICES_ADMIN_REQUESTS_COUNT_URL = WEBSERVICES_URL + '__admin/requests/count'
THIRDPARTY_URL = 'https://thirdparty.example.com:6443/'


def add_to_shared_dict(key, value):
    shared_dict[key] = value


def clear_shared_dict():
    shared_dict.clear()


def mark_test_as_failed(session_id):
    requests.put(BROWSERSTACK_API_URL + session_id + '.json',
                 auth=HTTPBasicAuth(browserstack_username, browserstack_access_key),
                 headers={'Content-Type': 'application/json'}, json={'status': 'failed',
                                                                     'reason': shared_dict['assertion_message']})


def mark_test_as_passed(session_id):
    requests.put(BROWSERSTACK_API_URL + session_id + '.json',
                 auth=HTTPBasicAuth(browserstack_username, browserstack_access_key),
                 headers={'Content-Type': 'application/json'}, json={'status': 'passed',
                                                                     'reason': ''})


def set_scenario_name(session_id, scenario_name):
    requests.put(BROWSERSTACK_API_URL + session_id + '.json',
                 auth=HTTPBasicAuth(browserstack_username, browserstack_access_key),
                 headers={'Content-Type': 'application/json'}, json={'name': scenario_name})


def delete_session(session_id):
    requests.delete(BROWSERSTACK_API_URL + session_id + '.json',
                    auth=HTTPBasicAuth(browserstack_username, browserstack_access_key),
                    headers={'Content-Type': 'application/json'})


def get_number_of_requests_with_data(request_type, pan, expiry_date, cvv):
    count = requests.post(WEBSERVICES_ADMIN_REQUESTS_COUNT_URL,
                          json={'url': '/jwt/', 'bodyPatterns': [
                              {'matchesJsonPath': '$.request[:1][?(@.pan=="' + pan + '")]'},
                              {'matchesJsonPath': '$.request[:1][?(@.expirydate=="' + expiry_date + '")]'},
                              {'matchesJsonPath': '$.request[:1][?(@.securitycode=="' + cvv + '")]'}
                          ],
                                'headers': {'st-request-types': {'equalTo': request_type}}},
                          verify=False)
    data = json.loads(count.content)
    return data['count']


def get_number_of_requests_without_data(request_type):
    count = requests.post(WEBSERVICES_ADMIN_REQUESTS_COUNT_URL,
                          json={'url': '/jwt/', 'headers': {'st-request-types': {'equalTo': request_type}}},
                          verify=False)
    data = json.loads(count.content)
    return data['count']


def get_number_of_requests_with_data_and_fraudcontroltransactionid_flag(request_type, pan, expiry_date, cvv):
    # pylint: disable=line-too-long
    count = requests.post(WEBSERVICES_ADMIN_REQUESTS_COUNT_URL,
                          json={'url': '/jwt/', 'bodyPatterns': [
                              {'matchesJsonPath': '$.request[:1][?(@.pan=="' + pan + '")]'},
                              {'matchesJsonPath': '$.request[:1][?(@.expirydate=="' + expiry_date + '")]'},
                              {'matchesJsonPath': '$.request[:1][?(@.securitycode=="' + cvv + '")]'},
                              {
                                  'matchesJsonPath': '$.request[:1][?(@.fraudcontroltransactionid=="63d1d099-d635-41b6-bb82-96017f7da6bb")]'}
                          ],
                                'headers': {'st-request-types': {'equalTo': request_type}}}, verify=False)
    data = json.loads(count.content)
    return data['count']


def get_number_of_requests_with_fraudcontroltransactionid_flag(request_type):
    # pylint: disable=line-too-long
    count = requests.post(WEBSERVICES_ADMIN_REQUESTS_COUNT_URL,
                          json={'url': '/jwt/', 'bodyPatterns': [
                              {
                                  'matchesJsonPath': '$.request[:1][?(@.fraudcontroltransactionid=="63d1d099-d635-41b6-bb82-96017f7da6bb")]'}
                          ],
                                'headers': {'st-request-types': {'equalTo': request_type}}}, verify=False)
    data = json.loads(count.content)
    return data['count']


def get_number_of_requests_with_updated_jwt(request_type, url, update_jwt):
    count = requests.post(WEBSERVICES_ADMIN_REQUESTS_COUNT_URL,
                          json={'url': url, 'bodyPatterns': [
                              {'matchesJsonPath': '$.[?(@.jwt=="' + update_jwt + '")]'}
                          ],
                                'headers': {'st-request-types': {'equalTo': request_type}}}, verify=False)
    data = json.loads(count.content)
    return data['count']


def get_number_of_requests_with_updated_jwt_for_visa(walletsource, update_jwt):
    count = requests.post(WEBSERVICES_ADMIN_REQUESTS_COUNT_URL,
                          json={'url': '/jwt/', 'bodyPatterns': [
                              {'matchesJsonPath': '$.request[:1][?(@.walletsource=="' + walletsource + '")]'},
                              {'matchesJsonPath': '$.[?(@.jwt=="' + update_jwt + '")]'}
                          ]}, verify=False)
    data = json.loads(count.content)
    return data['count']


def get_number_of_wallet_verify_requests(url):
    count = requests.post(THIRDPARTY_URL + '__admin/requests/count',
                          json={'url': url}, verify=False)
    data = json.loads(count.content)
    return data['count']


def get_number_of_thirdparty_requests(request_type, walletsource):
    count = requests.post(WEBSERVICES_ADMIN_REQUESTS_COUNT_URL,
                          json={'url': '/jwt/', 'bodyPatterns': [
                              {'matchesJsonPath': '$.request[:1][?(@.walletsource=="' + walletsource + '")]'}],
                                'headers': {'st-request-types': {'equalTo': request_type}}},
                          verify=False)
    data = json.loads(count.content)
    return data['count']


def get_number_of_tokenisation_requests(request_type, cvv):
    count = requests.post(WEBSERVICES_ADMIN_REQUESTS_COUNT_URL,
                          json={'url': '/jwt/', 'bodyPatterns': [
                              {'matchesJsonPath': '$.request[:1][?(@.securitycode=="' + cvv + '")]'}
                          ],
                                'headers': {'st-request-types': {'equalTo': request_type}}}, verify=False)
    data = json.loads(count.content)
    return data['count']


def remove_item_from_request_journal():
    requests.delete(WEBSERVICES_URL + '__admin/requests', verify=False)
    requests.delete(THIRDPARTY_URL + '__admin/requests', verify=False)
