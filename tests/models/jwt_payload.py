from dataclasses import dataclass, field
from typing import List


@dataclass
class JwtPayload:
    requesttypedescriptions: List[str] = field(default_factory=list)
    threedbypasspaymenttypes: List[str] = field(default_factory=list)
    baseamount: str = ''
    accounttypedescription: str = ''
    currencyiso3a: str = ''
    sitereference: str = ''
    locale: str = ''
