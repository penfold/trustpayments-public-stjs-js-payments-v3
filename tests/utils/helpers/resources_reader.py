import json


def get_translation_from_json(language, key):
    # pylint: disable=invalid-name
    with open(f'tests/resources/languages/{language}.json', 'r', encoding='utf-8') as f:
        translation = json.load(f)
    return translation[key]


def get_jwt_config_from_json(config):
    with open('tests/utils/configurations/jwt' + f'/{config}', 'r', encoding='utf-8') as file:
        config_dict = json.load(file)
    return config_dict


def get_e2e_config_from_json(config):
    with open('tests/utils/configurations/card_payment_and_digital_wallet' + f'/{config}', 'r', encoding='utf-8') as file:
        config_dict = json.load(file)
    return config_dict


def get_apm_config_from_json(config):
    with open('tests/utils/configurations/apm' + f'/{config}', 'r', encoding='utf-8') as file:
        config_dict = json.load(file)
    return config_dict


def get_mock_from_json(mock):
    # pylint: disable=invalid-name)
    with open(f'tests/wiremock/__files/{mock}', 'r', encoding='utf-8') as f:
        mock_json = json.load(f)
    return mock_json
