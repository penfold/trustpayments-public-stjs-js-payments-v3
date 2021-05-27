from models.jwt_payload import JwtPayload
from utils.enums.shared_dict_keys import SharedDictKey
from utils.helpers.request_executor import shared_dict


class InlineConfigBuilder:

    def __init__(self):
        self._jwt_payload = JwtPayload()

    def with_baseamount(self, val):
        self._jwt_payload.baseamount = val
        return self

    def with_accounttypedescription(self, val):
        self._jwt_payload.accounttypedescription = val
        return self

    def with_currencyiso3a(self, val):
        self._jwt_payload.currencyiso3a = val
        return self

    def with_sitereference(self, val):
        self._jwt_payload.sitereference = val
        return self

    def with_locale(self, val):
        self._jwt_payload.locale = val
        return self

    def with_requesttypedescriptions(self, val):
        self._jwt_payload.requesttypedescriptions = list(val.split(' '))
        return self

    def with_threedbypasspaymenttypes(self, val):
        self._jwt_payload.threedbypasspaymenttypes = list(val.split(' '))
        return self

    def with_cachetoken(self):
        self._jwt_payload.cachetoken = shared_dict[SharedDictKey.CACHETOKEN.value]
        return self

    def build(self):
        return self._jwt_payload

    def map_payload_fields(self, attributes):
        for attr in attributes:
            key = attr['key']
            value = attr['value']
            if key == 'baseamount':
                self.with_baseamount(value)
            elif key == 'accounttypedescription':
                self.with_accounttypedescription(value)
            elif key == 'currencyiso3a':
                self.with_currencyiso3a(value)
            elif key == 'sitereference':
                self.with_sitereference(value)
            elif key == 'locale':
                self.with_locale(value)
            elif key == 'requesttypedescriptions':
                self.with_requesttypedescriptions(value)
            elif key == 'threedbypasspaymenttypes':
                self.with_threedbypasspaymenttypes(value)
            elif key == 'cachetoken':
                self.with_cachetoken()
            else:
                raise Exception(f'Property {key} not exists in object JwtPayload {JwtPayload().__dict__}')
        return self

    def map_lib_config_additional_fields(self, lib_config, attributes):
        # current implementation works only for not nested objects
        config_keys_not_nested = ['analytics', 'animatedCard', 'buttonId', 'cancelCallback', 'cybertonicaApiKey',
                                  'datacenterurl', 'disableNotification', 'errorCallback', 'formId', 'origin',
                                  'panIcon', 'submitCallback', 'submitOnSuccess', 'submitOnError', 'submitOnCancel',
                                  'successCallback']

        for attr in attributes:
            key = attr['key']
            value = attr['value']
            if key not in config_keys_not_nested:
                raise Exception(
                    f'Property {key} not valid js-payments lib config option '
                    f'or not handled by "{self.map_lib_config_additional_fields.__name__}" method')
            else:
                if value in ['True', 'true', 'False', 'false']:
                    lib_config[key] = (value.lower() == 'true')
                else:
                    lib_config[key] = value
        return lib_config

    def map_jwt_additional_fields(self, jwt, attributes):
        # current implementation works only for not nested objects
        payload_keys = ['accounttypedescription', 'baseamount', 'cachetoken', 'currencyiso3a', 'expirydate', 'locale',
                        'mainamount', 'pan', 'requesttypedescriptions', 'securitycode', 'sitereference',
                        'threedbypasspaymenttypes']
        for attr in attributes:
            key = attr['key']
            value = attr['value']
            if key not in payload_keys:
                raise Exception(
                    f'Property {key} not valid payload jwt option '
                    f'or not handled by "{self.map_jwt_additional_fields.__name__}" method')
            elif key in ['requesttypedescriptions', 'threedbypasspaymenttypes']:
                jwt[key] = list(value.split(' '))
            else:
                jwt[key] = value
        return jwt
