import json
import os
import time

import jwt

from utils.enums.jwt_config import JwtConfig
from utils.helpers.random_data_generator import get_string

SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'you_will_never_guess'
ISS_KEY = os.environ.get('JWT_ISS_KEY') or 'you_will_never_guess'


def get_data_from_json(jwt_config):
    with open('utils/configurations/jwt_config_files' + f'/{jwt_config}', 'r') as file:
        jwt_json = json.load(file)
    return jwt_json


def get_data_from_jsinit_file(jsinit_filename):
    with open(f'wiremock/__files/{jsinit_filename}', 'r') as file:
        loaded_json = json.load(file)
    return loaded_json


def encode_jwt_for_json(jwt_config: JwtConfig):
    data = get_data_from_json(jwt_config.value)
    jwt_token = jwt.encode({'iat': int(time.time()), 'iss': ISS_KEY, 'payload': data['payload']}, SECRET_KEY)
    return jwt_token


def decode_jwt_from_jsinit(jsinit_filename):
    jwt_value = get_data_from_jsinit_file(jsinit_filename)
    jwt_json = jwt.decode(jwt_value['jwt'], SECRET_KEY, audience=ISS_KEY, algorithms='HS256', options={'verify_signature': False})
    return jwt_json['payload']['jwt']


def decode_jwt(encoded_jwt):
    jwt_json = jwt.decode(encoded_jwt, SECRET_KEY, audience=ISS_KEY, algorithms='HS256', options={'verify_signature': False})
    return jwt_json


def merge_json_conf_with_additional_attr(old_config_jwt_dict, jwt_payload_dict):
    payload_without_null = delete_empty_from_json(jwt_payload_dict)
    return {**old_config_jwt_dict, **payload_without_null}


def encode_jwt(jwt_payload):
    jwt_token = jwt.encode({'iat': int(time.time()), 'iss': ISS_KEY, 'payload': jwt_payload}, SECRET_KEY)
    return jwt_token


def delete_empty_from_json(dictionary):
    """
    Delete keys with the value ``None`` in a dictionary, recursively.

    This alters the input so you may wish to ``copy`` the dict first.
    """
    for key, value in list(dictionary.items()):
        if not value:
            del dictionary[key]
        elif isinstance(value, dict):
            delete_empty_from_json(value)
    return dictionary


def replace_jwt(entry):
    """Replace jwt from entry with random values"""
    if 'jwt' in entry:
        start_index = entry.rfind('jwt%22%3A%20%22')
        random_text = get_string(25, 1)
        jwt_from_log = entry[start_index:]
        entry = entry.replace(jwt_from_log, 'jwt%22%3A%20%22' + random_text)
    return entry


def replace_updated_jwt(entry):
    if'updatedJwt' in entry:
        start_index = entry.rfind('updatedJwt=')
        end_index = entry.rfind('&inline')
        random_text = get_string(25, 1)
        jwt_from_log = entry[start_index:]
        log_part_2 = entry[end_index:]
        entry = entry.replace(jwt_from_log, 'updatedJwt=' + random_text + log_part_2)
    return entry


def replace_jwt_in_logs(log_entry):
    """Replace jwt from log entry with random values"""
    log_with_replaced_jwt = replace_jwt(log_entry['message'])
    log_with_replaced_jwt = replace_updated_jwt(log_with_replaced_jwt)
    log_entry['message'] = log_with_replaced_jwt
    return log_entry
