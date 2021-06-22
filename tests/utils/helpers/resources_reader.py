import json


def get_translation_from_json(language, key):
    # pylint: disable=invalid-name
    with open(f'resources/languages/{language}.json', 'r') as f:
        translation = json.load(f)
    return translation[key]


def get_e2e_config_from_json(e2e_config):
    with open('wiremock/__files/e2e_config' + f'/{e2e_config}', 'r') as file:
        jwt_json = json.load(file)
    return jwt_json


def get_mock_response_from_json(mock):
    # pylint: disable=invalid-name)
    with open(f'wiremock/__files/{mock}', 'r') as f:
        mock_json = json.load(f)
    return mock_json