from utils.enums.shared_dict_keys import SharedDictKey
from utils.helpers.request_executor import shared_dict


class InlineConfigBuilder:

    def map_jwt_additional_fields(self, jwt, properties):
        # current implementation works only for not nested objects
        payload_keys = ['accounttypedescription', 'baseamount', 'billingcountryiso2a', 'cachetoken', 'currencyiso3a',
                        'customercountryiso2a', 'expirydate', 'locale', 'mainamount', 'pan', 'requesttypedescriptions',
                        'securitycode', 'sitereference', 'threedbypasspaymenttypes']

        for prop in properties:
            key = prop['key']
            value = prop['value']
            if key not in payload_keys:
                raise Exception(
                    f'Property {key} not valid payload jwt option '
                    f'or yet not handled by "{self.map_jwt_additional_fields.__name__}" method')
            elif key in ['requesttypedescriptions', 'threedbypasspaymenttypes']:
                jwt[key] = list(value.split(' '))
            elif key in ['cachetoken']:
                jwt[key] = shared_dict[SharedDictKey.CACHETOKEN.value]
            else:
                jwt[key] = value
        return jwt
