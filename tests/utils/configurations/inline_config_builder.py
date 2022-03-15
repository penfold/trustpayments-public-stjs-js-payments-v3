from utils.enums.shared_dict_keys import SharedDictKey
from utils.helpers.request_executor import shared_dict


class InlineConfigBuilder:

    def map_jwt_additional_fields(self, jwt, properties):
        # current implementation works only for not nested objects
        payload_keys = ['accounttypedescription', 'baseamount', 'billingcountryiso2a', 'billingdob',
                        'billingprefixname', 'billingfirstname', 'billingmiddlename', 'billinglastname',
                        'billingsuffixname', 'billingemail', 'billingtown', 'billingcounty', 'billingstreet',
                        'billingpremise', 'billingpostcode', 'orderreference', 'cachetoken', 'currencyiso3a',
                        'customercountryiso2a', 'expirydate', 'iban', 'locale',
                        'mainamount', 'pan', 'requesttypedescriptions', 'securitycode', 'sitereference',
                        'threedbypasspaymenttypes', 'successRedirectUrl', 'errorRedirectUrl', 'cancelRedirectUrl',
                        'returnUrl']

        for prop in properties:
            key = prop['key']
            value = prop['value']
            if key not in payload_keys:
                raise Exception(
                    f'Property {key} not valid payload jwt option '
                    f'or yet not handled by "{self.map_jwt_additional_fields.__name__}" method')

            if key in ['requesttypedescriptions', 'threedbypasspaymenttypes']:
                jwt[key] = list(value.split(' '))
            elif key in ['cachetoken']:
                jwt[key] = shared_dict[SharedDictKey.CACHETOKEN.value]
            else:
                jwt[key] = value
        return jwt

    def map_lib_config_additional_fields(self, lib_config, attributes):
        # current implementation works only for not nested objects
        config_keys_not_nested = ['analytics', 'animatedCard', 'buttonId', 'cancelCallback', 'cybertonicaApiKey',
                                  'datacenterurl', 'disableNotification', 'errorCallback', 'fieldsToSubmit', 'formId',
                                  'origin', 'panIcon', 'stopSubmitFormOnEnter', 'submitCallback', 'submitFields',
                                  'submitOnSuccess', 'submitOnError', 'submitOnCancel', 'successCallback']

        for attr in attributes:
            key = attr['key']
            value = attr['value']
            if key not in config_keys_not_nested:
                raise Exception(
                    f'Property {key} not valid js-payments lib config option '
                    f'or not handled by "{self.map_lib_config_additional_fields.__name__}" method')

            if value in ['True', 'true', 'False', 'false']:
                value = (value.lower() == 'true')

            if key in ['fieldsToSubmit', 'submitFields']:
                lib_config[key] = list(value.split(' '))
            else:
                lib_config[key] = value

        return lib_config
