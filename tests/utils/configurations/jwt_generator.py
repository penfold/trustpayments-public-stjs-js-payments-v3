import time
import jwt

from configuration import CONFIGURATION
from utils.enums.jwt_config import JwtConfig
from utils.helpers.random_data_generator import get_string
from utils.helpers.resources_reader import get_jwt_config_from_json, get_mock_from_json

SECRET_KEY = CONFIGURATION.SECRET_KEY
ISS_KEY = CONFIGURATION.ISS_KEY


def encode_jwt(jwt_payload):
    jwt_token = jwt.encode({'iat': int(time.time()), 'iss': ISS_KEY, 'payload': jwt_payload}, SECRET_KEY)
    return jwt_token


def decode_jwt(encoded_jwt):
    jwt_json = jwt.decode(encoded_jwt, SECRET_KEY, audience=ISS_KEY, algorithms='HS256',
                          options={'verify_signature': False})
    return jwt_json


def encode_jwt_for_json(jwt_config: JwtConfig):
    data = get_jwt_config_from_json(jwt_config.value)
    jwt_token = jwt.encode({'iat': int(time.time()), 'iss': ISS_KEY, 'payload': data['payload']}, SECRET_KEY)
    return jwt_token


def decode_jwt_from_jsinit(jsinit_filename):
    jwt_value = get_mock_from_json(jsinit_filename)
    jwt_json = jwt.decode(jwt_value['jwt'], SECRET_KEY, audience=ISS_KEY, algorithms='HS256',
                          options={'verify_signature': False})
    return jwt_json['payload']['jwt']


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
        log_part_2 = ''
        if 'This is what' in entry:
            end_index = entry.rfind('This is what')
            log_part_2 = entry[end_index:]
            start_index_2 = log_part_2.rfind('"jwt\\": \\"')
            if '\\",\\n  \\"threedresponse\\"' in log_part_2:
                end_index_2 = len(log_part_2) - log_part_2.rfind('\\",\\n  \\"threedresponse\\"')
            else:
                end_index_2 = len(log_part_2) - log_part_2.rfind('}"')
            second_jwt = log_part_2[start_index_2:-end_index_2]
            log_part_2 = log_part_2.replace(second_jwt, f'"jwt\\": \\"{random_text}')
        sanitized_entry = f'jwt%22%3A%20%22{random_text} {log_part_2}'
        jwt_from_url = entry[start_index:]
        entry = entry.replace(jwt_from_url, sanitized_entry)
    return entry


def replace_updated_jwt(entry):
    if 'updatedJwt' in entry:
        start_index = entry.rfind('updatedJwt=')
        end_index = len(entry) - entry.rfind('&inline')
        random_text = get_string(25, 1)
        jwt_from_log = entry[start_index:-end_index]
        entry = entry.replace(jwt_from_log, 'updatedJwt=' + random_text)
    return entry


def replace_jwt_in_logs(log_entry):
    """Replace jwt from log entry with random values"""
    log_with_replaced_jwt = replace_jwt(log_entry['message'])
    log_with_replaced_jwt = replace_updated_jwt(log_with_replaced_jwt)
    log_entry['message'] = log_with_replaced_jwt
    return log_entry
