import json
from urllib.parse import quote
from configuration import CONFIGURATION


def encode_url(url):
    encoded_url = quote(url, safe='/')
    return encoded_url


def create_inline_config(inline_config_dict, jwt):
    inline_config_dict['jwt'] = jwt
    if 'IE' in CONFIGURATION.BROWSER:
        inline_config = ('inlineConfig=' + json.dumps(inline_config_dict)).replace(': ', ':').replace(', ', ',')
    else:
        inline_config = 'inlineConfig=' + encode_url(json.dumps(inline_config_dict))
    return inline_config
