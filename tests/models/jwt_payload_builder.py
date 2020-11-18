from models.jwt_payload import JwtPayload


class JwtPayloadBuilder:

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
            else:
                raise Exception(f'Property {key} not exists in object JwtPayload {JwtPayload().__dict__}')
        return self
