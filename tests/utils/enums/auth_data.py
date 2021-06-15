from enum import Enum


class AuthData(Enum):
    THREE_DS_CODE = '1234'
    THREE_DS_INCORRECT_CODE = '9999'
    THREE_DS_CODE_V1_SUCCESS = 'sty'
    THREE_DS_CODE_V1_ATTEMPT = 'sta'
    THREE_DS_CODE_V1_UNAVAILABLE = 'stu'
    THREE_DS_CODE_V1_FAILED = 'stn'
