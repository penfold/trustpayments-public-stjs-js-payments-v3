import json


def get_translation_from_json(language, key):
    # pylint: disable=invalid-name
    with open(f'resources/languages/{language}.json', 'r') as f:
        translation = json.load(f)
    return translation[key]
