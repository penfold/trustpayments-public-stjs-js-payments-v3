import json
from urllib.parse import quote
from configuration import CONFIGURATION


def encode_url(url):
    encoded_url = quote(url, safe='/')
    return encoded_url


def create_inline_config(config_dict, jwt):
    config_dict['jwt'] = jwt
    if 'IE' in CONFIGURATION.BROWSER:
        inline_config = ('inlineConfig=' + json.dumps(config_dict)).replace(': ', ':').replace(', ', ',')
    else:
        inline_config = 'inlineConfig=' + encode_url(json.dumps(config_dict))
    return inline_config


def create_inline_config_apm(config_dict):
    if 'IE' in CONFIGURATION.BROWSER:
        inline_config_apm = ('inlineConfigApm=' + json.dumps(config_dict)).replace(': ', ':').replace(', ', ',')
    else:
        inline_config_apm = 'inlineConfigApm=' + encode_url(json.dumps(config_dict))
    return inline_config_apm


def create_inline_config_visa_c2p(config_dict):
    if 'IE' in CONFIGURATION.BROWSER:
        inline_config_visa_c2p = ('inlineConfigCtp=' + json.dumps(config_dict)).replace(': ', ':').replace(', ', ',')
    else:
        inline_config_visa_c2p = 'inlineConfigCtp=' + encode_url(json.dumps(config_dict))
    return inline_config_visa_c2p
