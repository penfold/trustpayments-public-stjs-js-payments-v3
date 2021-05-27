import json
from urllib.parse import quote

from configuration import CONFIGURATION
from utils.enums.e2e_config import E2eConfig


def get_e2e_config_from_json(e2e_config):
    with open('wiremock/__files/e2e_config' + f'/{e2e_config}', 'r') as file:
        jwt_json = json.load(file)
    return jwt_json


def covert_json_to_string(json_config):
    if 'IE' in CONFIGURATION.BROWSER:
        inline_config = ('inlineConfig=' + json.dumps(json_config)).replace(': ', ':').replace(', ', ',')
    else:
        inline_config = 'inlineConfig=' + encode_url(json.dumps(json_config))
    return inline_config


def encode_url(url):
    encoded_url = quote(url, safe='/')
    return encoded_url


def create_inline_config(e2e_config: E2eConfig, jwt):
    json_config = get_e2e_config_from_json(e2e_config.value)
    json_config['jwt'] = jwt
    return covert_json_to_string(json_config)


def append_jwt_into_inline_config(inline_config, jwt):
    inline_config['jwt'] = jwt
    return covert_json_to_string(inline_config)
