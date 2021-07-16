from enum import Enum


class GooglePayResponse(Enum):
    GOOGLE_AUTH_SUCCESS = 'googleAuth.json'
    SUCCESS = 'googleSuccess.json'
    ERROR = 'googleError.json'
    CANCEL ='googleCancel.json'
