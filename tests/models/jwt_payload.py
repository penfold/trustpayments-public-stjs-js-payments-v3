from dataclasses import dataclass, field
from typing import List


@dataclass
class JwtPayload:
    # pylint: disable=too-many-instance-attributes
    requesttypedescriptions: List[str] = field(default_factory=list)
    threedbypasspaymenttypes: List[str] = field(default_factory=list)
    baseamount: str = ''
    accounttypedescription: str = ''
    currencyiso3a: str = ''
    sitereference: str = ''
    locale: str = ''
    cachetoken: str = ''
