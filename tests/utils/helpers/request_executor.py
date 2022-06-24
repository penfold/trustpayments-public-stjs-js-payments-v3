import json

import requests
from requests.auth import HTTPBasicAuth

from resources.seon_mock_object import SEON_MOCK_OBJECT
from utils.enums.shared_dict_keys import SharedDictKey
from utils.read_configuration import get_from_env

browserstack_username = get_from_env('BS_USERNAME')
browserstack_access_key = get_from_env('BS_ACCESS_KEY')

shared_dict = {}

BROWSERSTACK_API_URL = 'https://api.browserstack.com/automate/sessions/'
WEBSERVICES_URL = 'https://webservices.securetrading.net:6443/'
WEBSERVICES_ADMIN_REQUESTS_COUNT_URL = WEBSERVICES_URL + '__admin/requests/count'
THIRDPARTY_URL = 'https://thirdparty.example.com:6443/'
ZIP_SMS_URL = 'https://0hw6hlmlvj.execute-api.us-east-1.amazonaws.com/dev/ecd8b8af-81ae-42b5-a448-a63c97b4f6b5/numbers/+447897024362'


def add_to_shared_dict(key, value):
    shared_dict[key] = value


def clear_shared_dict():
    shared_dict.clear()


def mark_test_as_failed(session_id):
    requests.put(BROWSERSTACK_API_URL + session_id + '.json',
                 auth=HTTPBasicAuth(browserstack_username, browserstack_access_key),
                 headers={'Content-Type': 'application/json'}, json={'status': 'failed',
                                                                     'reason': shared_dict[
                                                                         SharedDictKey.ASSERTION_MESSAGE.value]})


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


def get_number_of_requests_with_fraudcontroltransactionid_flag(request_type):
    # pylint: disable=line-too-long
    count = requests.post(WEBSERVICES_ADMIN_REQUESTS_COUNT_URL,
                          json={'url': '/jwt/', 'bodyPatterns': [
                              {
                                  'matchesJsonPath': '$.request[:1][?(@.fraudcontroltransactionid=="' + SEON_MOCK_OBJECT + '")]'}
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


def get_number_of_requests_to_thirdparty(url):
    count = requests.post(THIRDPARTY_URL + '__admin/requests/count',
                          json={'url': url}, verify=False)
    data = json.loads(count.content)
    return data['count']


def get_number_of_requests_with_walletsource(request_type, walletsource):
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


def retrieve_sms_code():
    code = requests.get(ZIP_SMS_URL)
    return code.json()[0]['body'][-6:]
