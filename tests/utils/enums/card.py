from enum import Enum

from utils.date_util import convert_to_string, adjust_date_day, get_current_time, date_formats
from utils.enums.card_type import CardType


class Card(Enum):
    def __init__(self, formatted_number, expiration_date: str, card_type: CardType, cvv):
        self.formatted_number = formatted_number
        self.__expiration_date = expiration_date
        self.type = card_type.name
        self.cvv = cvv

    # by default expiration date will be future but it may be also fixed value
    # e.g. 11/22
    # or by using more descriptive value
    # like PAST / FUTURE
    # e.g. MASTERCARD_INVALID_EXP_DATE_CARD

    AMEX_CARD = '3400 000000 00611', '', CardType.AMEX, 1234
    AMEX_NON_FRICTIONLESS = '3400 0000 0001 098', '', CardType.AMEX, 1234
    AMEX_FAILED_AUTH_CARD = '3400 0000 0000 033', '', CardType.AMEX, 1234
    AMEX_TIMEOUT_CARD = '3400 0000 0008 309', '', CardType.AMEX, 1234
    AMEX_UNAVAILABLE_CARD = '3400 0000 0007 780', '', CardType.AMEX, 1234

    ASTROPAYCARD_CARD = '1801 0000 0000 0901', '', CardType.ASTROPAYCARD, 123

    JCB_CARD = '3528 0000 0000 0411', '', CardType.JCB, 123

    DINERS_CARD = '3000 000000 000111', '', CardType.DINERS, 123
    DISCOVER_CARD = '6011 0000 0000 0301', '', CardType.DISCOVER, 123
    DISCOVER_BYPASSED_AUTH_CARD = '6011 9900 0000 0006', '', CardType.DISCOVER, 123
    DISCOVER_PASSIVE_AUTH_CARD = '6011 0000 0000 0038', '', CardType.DISCOVER, 123

    MAESTRO_CARD = '5000 0000 0000 0611', '', CardType.MAESTRO, 123
    MASTERCARD_CARD = '5100 0000 0000 0511', '', CardType.MASTERCARD, 123
    MASTERCARD_DECLINED_CARD = '5100 0000 0000 0412', '', CardType.MASTERCARD, 123
    MASTERCARD_INVALID_EXP_DATE_CARD = '5100 0000 0000 0511', '10/18', CardType.MASTERCARD, 123
    MASTERCARD_INVALID_CVV_CARD = '5100 0000 0000 0511', '', CardType.MASTERCARD, 1
    MASTERCARD_SUCCESSFUL_AUTH_CARD = '52000 00000 0000 07', '', CardType.MASTERCARD, 123
    MASTERCARD_FIXED_EXP_DATE_CARD = '52000 00000 0000 07', '09/22', CardType.MASTERCARD, 123
    MASTERCARD_INVALID_PATTERN_CARD = '5100 0000 0000 0510', '13/13', CardType.MASTERCARD, 12
    MASTERCARD_CMPI_AUTH_ERROR_CARD = '5200 0000 0000 0098', '', CardType.MASTERCARD, 123
    MASTERCARD_AUTH_UNAVAILABLE_CARD = '5200 0000 0000 0031', '', CardType.MASTERCARD, 123
    MASTERCARD_PROMPT_FOR_WHITELIST = '5200 0000 0000 2003', '', CardType.MASTERCARD, 123
    MASTERCARD_SUPPORT_TRANS_STATUS_I = '5200 0000 0000 2029', '', CardType.MASTERCARD, 123
    MASTERCARD_NOT_ENROLLED_CARD = '5200 0000 0000 0056', '', CardType.MASTERCARD, 123

    # Cardinal Commerce Test Cards
    MASTERCARD_SUCCESSFUL_FRICTIONLESS_AUTH = '5200 0000 0000 1005', '', CardType.MASTERCARD, 123
    MASTERCARD_FAILED_FRICTIONLESS_AUTH = '5200 0000 0000 1013', '', CardType.MASTERCARD, 123
    MASTERCARD_FRICTIONLESS = '5200 0000 0000 1021', '', CardType.MASTERCARD, 123
    MASTERCARD_UNAVAILABLE_FRICTIONLESS_AUTH = '5200 0000 0000 1039', '', CardType.MASTERCARD, 123
    MASTERCARD_REJECTED_FRICTIONLESS_AUTH = '5200 0000 0000 1047', '', CardType.MASTERCARD, 123
    MASTERCARD_AUTH_NOT_AVAILABLE_ON_LOOKUP = '5200 0000 0000 1054', '', CardType.MASTERCARD, 123
    MASTERCARD_ERROR_ON_LOOKUP = '5200 0000 0000 2037', '', CardType.MASTERCARD, 123
    MASTERCARD_TIMEOUT_ON_CMPI_LOOKUP_TRANSACTION = '5200 0000 0000 1070', '', CardType.MASTERCARD, 123
    MASTERCARD_NON_FRICTIONLESS = '5200 0000 0000 1096', '', CardType.MASTERCARD, 123
    MASTERCARD_STEP_UP_AUTH_FAILED = '5200 0000 0000 1104', '', CardType.MASTERCARD, 123
    MASTERCARD_STEP_UP_AUTH_UNAVAILABLE = '5200 0000 0000 2664', '', CardType.MASTERCARD, 123
    MASTERCARD_ERROR_ON_AUTH = '5200 0000 0000 1120', '', CardType.MASTERCARD, 123
    MASTERCARD_BYPASSED_AUTH = '5200 0000 0000 1088', '', CardType.MASTERCARD, 123
    MASTERCARD_UNAVAILABLE_CARD = '5200 0000 0000 0064', '', CardType.MASTERCARD, 123
    MASTERCARD_BYPASSED_AUTH_V1 = '5200 9900 0000 0009', '', CardType.MASTERCARD, 123

    VISA_CARD = '4111 1100 0000 0211', '', CardType.VISA, 123
    VISA_FAILED_SIGNATURE_CARD = '4000 0000 0000 0010', '', CardType.VISA, 123
    VISA_MERCHANT_NOT_ACTIVE_CARD = '4000 0000 0000 0077', '', CardType.VISA, 123
    VISA_CMPI_LOOKUP_ERROR_CARD = '4000 0000 0000 0085', '', CardType.VISA, 123
    VISA_PRE_WHITELISTED_VISABASE_CONFIG = '4000 0000 0000 2016', '', CardType.VISA, 123
    VISA_DECLINED_CARD = '4242 4242 4242 4242', '', CardType.VISA, 123
    VISA_INVALID_CVV = '4111 1100 0000 0211', '', CardType.VISA, 12
    VISA_PASSIVE_AUTH_CARD = '4000 0000 0000 0101', '', CardType.VISA, 123

    VISA_V21_SUCCESSFUL_FRICTIONLESS_AUTH = '4000 0000 0000 1000', '', CardType.VISA, 123
    VISA_V21_FAILED_FRICTIONLESS_AUTH = '4000 0000 0000 1018', '', CardType.VISA, 123
    VISA_V21_FRICTIONLESS = '4000 0000 0000 1026', '', CardType.VISA, 123
    VISA_V21_UNAVAILABLE_FRICTIONLESS_AUTH = '4000 0000 0000 1034', '', CardType.VISA, 123
    VISA_V21_REJECTED_FRICTIONLESS_AUTH = '4000 0000 0000 1042', '', CardType.VISA, 123
    VISA_V21_AUTH_NOT_AVAILABLE_ON_LOOKUP = '4000 0000 0000 1059', '', CardType.VISA, 123
    VISA_V21_ERROR_ON_LOOKUP = '4000 0000 0000 1067', '', CardType.VISA, 123
    VISA_V21_TIMEOUT_ON_CMPI_LOOKUP_TRANSACTION = '4000 0000 0000 1075', '', CardType.VISA, 123
    VISA_V21_NON_FRICTIONLESS = '4000 0000 0000 1091', '', CardType.VISA, 123
    VISA_V21_STEP_UP_AUTH_FAILED = '4000 0000 0000 1109', '', CardType.VISA, 123
    VISA_V21_STEP_UP_AUTH_UNAVAILABLE = '4000 0000 0000 1117', '', CardType.VISA, 123
    VISA_V21_ERROR_ON_AUTH = '4000 0000 0000 1125', '', CardType.VISA, 123
    VISA_V21_BYPASSED_AUTH = '4000 0000 0000 1083', '', CardType.VISA, 123
    VISA_TRANSACTION_TIMEOUT_ACS = '4000000000002040', '', CardType.VISA, 123
    VISA_SUSPECTED_FRAUD = '4000000000002149', '', CardType.VISA, 123
    VISA_NOT_ENROLLED = '4000000000002164', '', CardType.VISA, 123
    VISA_TIMEOUT_2_ACS = '4000000000002172', '', CardType.VISA, 123
    VISA_TRANSACTION_NON_PAYMENT = '4000000000002230', '', CardType.VISA, 123
    VISA_3RI_TRANSACTION_NOT_SUPPORTED = '4000000000002248', '', CardType.VISA, 123

    VISA_V22_SUCCESSFUL_FRICTIONLESS_AUTH = '4000 0000 0000 2701', '', CardType.VISA, 123
    VISA_V22_FAILED_FRICTIONLESS_AUTH = '4000 0000 0000 2925', '', CardType.VISA, 123
    VISA_V22_FRICTIONLESS = '4000 0000 0000 2719', '', CardType.VISA, 123
    VISA_V22_UNAVAILABLE_FRICTIONLESS_AUTH = '4000 0000 0000 2313', '', CardType.VISA, 123
    VISA_V22_REJECTED_FRICTIONLESS_AUTH = '4000 0000 0000 2537', '', CardType.VISA, 123
    VISA_V22_AUTH_NOT_AVAILABLE_ON_LOOKUP = '4000 0000 0000 2990', '', CardType.VISA, 123
    VISA_V22_ERROR_ON_LOOKUP = '4000 0000 0000 2446', '', CardType.VISA, 123
    VISA_V22_TIMEOUT_ON_CMPI_LOOKUP_TRANSACTION = '4000 0000 0000 2354', '', CardType.VISA, 123
    VISA_V22_NON_FRICTIONLESS = '4000 0000 0000 2503', '', CardType.VISA, 123
    VISA_V22_STEP_UP_AUTH_FAILED = '4000 0000 0000 2370', '', CardType.VISA, 123
    VISA_V22_STEP_UP_AUTH_UNAVAILABLE = '4000 0000 0000 2420', '', CardType.VISA, 123
    VISA_V22_ERROR_ON_AUTH = '4000 0000 0000 2644', '', CardType.VISA, 123
    VISA_V22_BYPASSED_AUTH = '4000 0000 0000 2560', '', CardType.VISA, 123

    # 3DS SDK Test Cards
    MASTERCARD_V1_3DS_SDK_NON_FRICTIONLESS = '5100 0000 0000 0511', '', CardType.MASTERCARD, 123
    MASTERCARD_V1_3DS_SDK_NOT_ENROLLED = '5100 0000 0000 0321', '', CardType.MASTERCARD, 123
    VISA_V1_3DS_SDK_NON_FRICTIONLESS = '4111 1100 0000 0211', '', CardType.MASTERCARD, 123
    VISA_V1_3DS_SDK_NOT_ENROLLED = '4370 0000 0000 0921', '', CardType.MASTERCARD, 123

    AMEX_V21_3DS_SDK_FRICTIONLESS_SUCCESS = '340000000003003', '', CardType.AMEX, 1234
    AMEX_V22_3DS_SDK_FRICTIONLESS_SUCCESS = '340000000004001', '', CardType.AMEX, 1234
    MASTERCARD_V21_3DS_SDK_FRICTIONLESS_SUCCESS = '5591390000000009', '', CardType.MASTERCARD, 123
    MASTERCARD_V22_3DS_SDK_FRICTIONLESS_SUCCESS = '5591390000000504', '', CardType.MASTERCARD, 123
    VISA_V21_3DS_SDK_FRICTIONLESS_SUCCESS = '4900490000000006', '', CardType.VISA, 123
    VISA_V22_3DS_SDK_FRICTIONLESS_SUCCESS = '4900490000000501', '', CardType.VISA, 123

    AMEX_V21_3DS_SDK_FRICTIONLESS_FAILED = '340000000003011', '', CardType.AMEX, 1234
    AMEX_V22_3DS_SDK_FRICTIONLESS_FAILED = '340000000004019', '', CardType.AMEX, 1234
    MASTERCARD_V21_3DS_SDK_FRICTIONLESS_FAILED = '5591390000000017', '', CardType.MASTERCARD, 123
    MASTERCARD_V22_3DS_SDK_FRICTIONLESS_FAILED = '5591390000000520', '', CardType.MASTERCARD, 123
    VISA_V21_3DS_SDK_FRICTIONLESS_FAILED = '4900490000000014', '', CardType.VISA, 123
    VISA_V22_3DS_SDK_FRICTIONLESS_FAILED = '4900490000000519', '', CardType.VISA, 123

    AMEX_V21_3DS_SDK_FRICTIONLESS_STAND_IN = '340000000003037', '', CardType.AMEX, 1234
    AMEX_V22_3DS_SDK_FRICTIONLESS_STAND_IN = '340000000004027', '', CardType.AMEX, 1234
    MASTERCARD_V21_3DS_SDK_FRICTIONLESS_STAND_IN = '5591390000000025', '', CardType.MASTERCARD, 123
    MASTERCARD_V22_3DS_SDK_FRICTIONLESS_STAND_IN = '5591390000000538', '', CardType.MASTERCARD, 123
    VISA_V21_3DS_SDK_FRICTIONLESS_STAND_IN = '4900490000000030', '', CardType.VISA, 123
    VISA_V22_3DS_SDK_FRICTIONLESS_STAND_IN = '4900490000000527', '', CardType.VISA, 123

    AMEX_V21_3DS_SDK_UNAVAILABLE_FRICTIONLESS_AUTH = '340000000003045', '', CardType.AMEX, 1234
    AMEX_V22_3DS_SDK_UNAVAILABLE_FRICTIONLESS_AUTH = '340000000004035', '', CardType.AMEX, 1234
    MASTERCARD_V21_3DS_SDK_UNAVAILABLE_FRICTIONLESS_AUTH = '5591390000000033', '', CardType.MASTERCARD, 123
    MASTERCARD_V22_3DS_SDK_UNAVAILABLE_FRICTIONLESS_AUTH = '5591390000000546', '', CardType.MASTERCARD, 123
    VISA_V21_3DS_SDK_UNAVAILABLE_FRICTIONLESS_AUTH = '4900490000000048', '', CardType.VISA, 123
    VISA_V22_3DS_SDK_UNAVAILABLE_FRICTIONLESS_AUTH = '4900490000000535', '', CardType.VISA, 123

    AMEX_V21_3DS_SDK_REJECTED_FRICTIONLESS_AUTH = '340000000003060', '', CardType.AMEX, 1234
    AMEX_V22_3DS_SDK_REJECTED_FRICTIONLESS_AUTH = '340000000004043', '', CardType.AMEX, 1234
    MASTERCARD_V21_3DS_SDK_REJECTED_FRICTIONLESS_AUTH = '5591390000000041', '', CardType.MASTERCARD, 123
    MASTERCARD_V22_3DS_SDK_REJECTED_FRICTIONLESS_AUTH = '5591390000000553', '', CardType.MASTERCARD, 123
    VISA_V21_3DS_SDK_REJECTED_FRICTIONLESS_AUTH = '4900490000000055', '', CardType.VISA, 123
    VISA_V22_3DS_SDK_REJECTED_FRICTIONLESS_AUTH = '4900490000000543', '', CardType.VISA, 123

    AMEX_V21_3DS_SDK_DS_UNAVAILABLE = '340000000003078', '', CardType.AMEX, 1234
    AMEX_V22_3DS_SDK_DS_UNAVAILABLE = '340000000004050', '', CardType.AMEX, 1234
    MASTERCARD_V21_3DS_SDK_DS_UNAVAILABLE = '5591390000000140', '', CardType.MASTERCARD, 123
    MASTERCARD_V22_3DS_SDK_DS_UNAVAILABLE = '5591390000000611', '', CardType.MASTERCARD, 123
    VISA_V21_3DS_SDK_DS_UNAVAILABLE = '4900490000000113', '', CardType.VISA, 123
    VISA_V22_3DS_SDK_DS_UNAVAILABLE = '4900490000000626', '', CardType.VISA, 123

    AMEX_V21_3DS_SDK_DS_UNAVAILABLE_RETRY = '340000000003086', '', CardType.AMEX, 1234
    AMEX_V22_3DS_SDK_DS_UNAVAILABLE_RETRY = '340000000004068', '', CardType.AMEX, 1234
    MASTERCARD_V21_3DS_SDK_DS_UNAVAILABLE_RETRY = '5591390000000074', '', CardType.MASTERCARD, 123
    MASTERCARD_V22_3DS_SDK_DS_UNAVAILABLE_RETRY = '5591390000000587', '', CardType.MASTERCARD, 123
    VISA_V21_3DS_SDK_DS_UNAVAILABLE_RETRY = '4900490000000089', '', CardType.VISA, 123
    VISA_V22_3DS_SDK_DS_UNAVAILABLE_RETRY = '4900490000000576', '', CardType.VISA, 123

    AMEX_V21_3DS_SDK_IMPROPER_ARES_DATA = '340000000003094', '', CardType.AMEX, 1234
    AMEX_V22_3DS_SDK_IMPROPER_ARES_DATA = '340000000004076', '', CardType.AMEX, 1234
    MASTERCARD_V21_3DS_SDK_IMPROPER_ARES_DATA = '5591390000000157', '', CardType.MASTERCARD, 123
    MASTERCARD_V22_3DS_SDK_IMPROPER_ARES_DATA = '5591390000000629', '', CardType.MASTERCARD, 123
    VISA_V21_3DS_SDK_IMPROPER_ARES_DATA = '4900490000000121', '', CardType.VISA, 123
    VISA_V22_3DS_SDK_IMPROPER_ARES_DATA = '4900490000000634', '', CardType.VISA, 123

    AMEX_V21_3DS_3DS_SDK_ACS_UNAVAILABLE = '340000000003110', '', CardType.AMEX, 1234
    AMEX_V22_3DS_3DS_SDK_ACS_UNAVAILABLE = '340000000004084', '', CardType.AMEX, 1234
    MASTERCARD_V21_3DS_SDK_ACS_UNAVAILABLE = '5591390000000165', '', CardType.MASTERCARD, 123
    MASTERCARD_V22_3DS_SDK_ACS_UNAVAILABLE = '5591390000000637', '', CardType.MASTERCARD, 123
    VISA_V21_3DS_SDK_ACS_UNAVAILABLE = '4900490000000139', '', CardType.VISA, 123
    VISA_V22_3DS_SDK_ACS_UNAVAILABLE = '4900490000000659', '', CardType.VISA, 123

    AMEX_V21_3DS_3DS_SDK_NON_FRICTIONLESS = '340000000003128', '', CardType.AMEX, 1234
    AMEX_V22_3DS_3DS_SDK_NON_FRICTIONLESS = '340000000004118', '', CardType.AMEX, 1234
    MASTERCARD_V21_3DS_SDK_NON_FRICTIONLESS = '5591390000000173', '', CardType.MASTERCARD, 123
    MASTERCARD_V22_3DS_SDK_NON_FRICTIONLESS = '5591390000000645', '', CardType.MASTERCARD, 123
    VISA_V21_3DS_SDK_NON_FRICTIONLESS = '4900490000000147', '', CardType.VISA, 123
    VISA_V22_3DS_SDK_NON_FRICTIONLESS = '4900490000000667', '', CardType.VISA, 123

    AMEX_V21_3DS_SDK_STEP_UP_AUTH_FAILED = '340000000003136', '', CardType.AMEX, 1234
    AMEX_V22_3DS_SDK_STEP_UP_AUTH_FAILED = '340000000004126', '', CardType.AMEX, 1234
    MASTERCARD_V21_3DS_SDK_STEP_UP_AUTH_FAILED = '5591390000000066', '', CardType.MASTERCARD, 123
    MASTERCARD_V22_3DS_SDK_STEP_UP_AUTH_FAILED = '5591390000000579', '', CardType.MASTERCARD, 123
    VISA_V21_3DS_SDK_STEP_UP_AUTH_FAILED = '4900490000000071', '', CardType.VISA, 123
    VISA_V22_3DS_SDK_STEP_UP_AUTH_FAILED = '4900490000000568', '', CardType.VISA, 123

    AMEX_V21_3DS_SDK_STEP_UP_AUTH_ERROR = '340000000003144', '', CardType.AMEX, 1234
    AMEX_V22_3DS_SDK_STEP_UP_AUTH_ERROR = '340000000004134', '', CardType.AMEX, 1234
    MASTERCARD_V21_3DS_SDK_STEP_UP_AUTH_ERROR = '5591390000000090', '', CardType.MASTERCARD, 123
    MASTERCARD_V22_3DS_SDK_STEP_UP_AUTH_ERROR = '5591390000000595', '', CardType.MASTERCARD, 123
    VISA_V21_3DS_SDK_STEP_UP_AUTH_ERROR = '4900490000000097', '', CardType.VISA, 123
    VISA_V22_3DS_SDK_STEP_UP_AUTH_ERROR = '4900490000000584', '', CardType.VISA, 123

    AMEX_V21_3DS_SDK_FRICTIONLESS_SUCCESS_METHOD_URL = '340000000003151', '', CardType.AMEX, 1234
    AMEX_V22_3DS_SDK_FRICTIONLESS_SUCCESS_METHOD_URL = '340000000004159', '', CardType.AMEX, 1234
    MASTERCARD_V21_3DS_SDK_FRICTIONLESS_SUCCESS_METHOD_URL = '5591390000000108', '', CardType.MASTERCARD, 123
    MASTERCARD_V22_3DS_SDK_FRICTIONLESS_SUCCESS_METHOD_URL = '5591390000000603', '', CardType.MASTERCARD, 123
    VISA_V21_3DS_SDK_FRICTIONLESS_SUCCESS_METHOD_URL = '4900490000000105', '', CardType.VISA, 123
    VISA_V22_3DS_SDK_FRICTIONLESS_SUCCESS_METHOD_URL = '4900490000000618', '', CardType.VISA, 123

    AMEX_V21_3DS_SDK_NON_FRICTIONLESS_METHOD_URL = '340000000003169', '', CardType.AMEX, 1234
    AMEX_V22_3DS_SDK_NON_FRICTIONLESS_METHOD_URL = '340000000004167', '', CardType.AMEX, 1234
    MASTERCARD_V21_3DS_SDK_NON_FRICTIONLESS_METHOD_URL = '5591390000000058', '', CardType.MASTERCARD, 123
    MASTERCARD_V22_3DS_SDK_NON_FRICTIONLESS_METHOD_URL = '5591390000000561', '', CardType.MASTERCARD, 123
    VISA_V21_3DS_SDK_NON_FRICTIONLESS_METHOD_URL = '4900490000000063', '', CardType.VISA, 123
    VISA_V22_3DS_SDK_NON_FRICTIONLESS_METHOD_URL = '4900490000000550', '', CardType.VISA, 123

    AMEX_V21_3DS_SDK_TRANSACTION_TIMEOUT = '340000000003177', '', CardType.AMEX, 1234
    AMEX_V22_3DS_SDK_TRANSACTION_TIMEOUT = '340000000004175', '', CardType.AMEX, 1234
    MASTERCARD_V21_3DS_SDK_TRANSACTION_TIMEOUT = '5591390000000181', '', CardType.MASTERCARD, 123
    MASTERCARD_V22_3DS_SDK_TRANSACTION_TIMEOUT = '5591390000000660', '', CardType.MASTERCARD, 123
    VISA_V21_3DS_SDK_TRANSACTION_TIMEOUT = '4900490000000154', '', CardType.VISA, 123
    VISA_V22_3DS_SDK_TRANSACTION_TIMEOUT = '4900490000000675', '', CardType.VISA, 123

    # 3DS SDK Test Cards - additional TC

    AMEX_V21_3DS_SDK_TRANS_STATUS_AUTH_FAILED = '340000000003185', '', CardType.AMEX, 1234
    AMEX_V22_3DS_SDK_TRANS_STATUS_AUTH_FAILED = '340000000004183', '', CardType.AMEX, 1234
    MASTERCARD_V21_3DS_SDK_TRANS_STATUS_AUTH_FAILED = '5591390000000199', '', CardType.MASTERCARD, 123
    MASTERCARD_V22_3DS_SDK_TRANS_STATUS_AUTH_FAILED = '5591390000000678', '', CardType.MASTERCARD, 123
    VISA_V21_3DS_SDK_TRANS_STATUS_AUTH_FAILED = '4900490000000170', '', CardType.VISA, 123
    VISA_V22_3DS_SDK_TRANS_STATUS_AUTH_FAILED = '4900490000000683', '', CardType.VISA, 123

    AMEX_V21_3DS_SDK_TRANS_STATUS_SUSPECTED_FRAUD = '340000000003193', '', CardType.AMEX, 1234
    AMEX_V22_3DS_SDK_TRANS_STATUS_SUSPECTED_FRAUD = '340000000004191', '', CardType.AMEX, 1234
    MASTERCARD_V21_3DS_SDK_TRANS_STATUS_SUSPECTED_FRAUD = '5591390000000207', '', CardType.MASTERCARD, 123
    MASTERCARD_V22_3DS_SDK_TRANS_STATUS_SUSPECTED_FRAUD = '5591390000000686', '', CardType.MASTERCARD, 123
    VISA_V21_3DS_SDK_TRANS_STATUS_SUSPECTED_FRAUD = '4900490000000188', '', CardType.VISA, 123
    VISA_V22_3DS_SDK_TRANS_STATUS_SUSPECTED_FRAUD = '4900490000000691', '', CardType.VISA, 123

    AMEX_V21_3DS_SDK_TRANS_STATUS_NOT_ENROLLED = '340000000003201', '', CardType.AMEX, 1234
    AMEX_V22_3DS_SDK_TRANS_STATUS_NOT_ENROLLED = '340000000004209', '', CardType.AMEX, 1234
    MASTERCARD_V21_3DS_SDK_TRANS_STATUS_NOT_ENROLLED = '5591390000000215', '', CardType.MASTERCARD, 123
    MASTERCARD_V22_3DS_SDK_TRANS_STATUS_NOT_ENROLLED = '5591390000000694', '', CardType.MASTERCARD, 123
    VISA_V21_3DS_SDK_TRANS_STATUS_NOT_ENROLLED = '4900490000000196', '', CardType.VISA, 123
    VISA_V22_3DS_SDK_TRANS_STATUS_NOT_ENROLLED = '4900490000000709', '', CardType.VISA, 123

    AMEX_V21_3DS_SDK_TRANS_STATUS_TRANSACTION_TIMEOUT_AT_ACS = '340000000003219', '', CardType.AMEX, 1234
    AMEX_V22_3DS_SDK_TRANS_STATUS_TRANSACTION_TIMEOUT_AT_ACS = '340000000004217', '', CardType.AMEX, 1234
    MASTERCARD_V21_3DS_SDK_TRANS_STATUS_TRANSACTION_TIMEOUT_AT_ACS = '5591390000000223', '', CardType.MASTERCARD, 123
    MASTERCARD_V22_3DS_SDK_TRANS_STATUS_TRANSACTION_TIMEOUT_AT_ACS = '5591390000000710', '', CardType.MASTERCARD, 123
    VISA_V21_3DS_SDK_TRANS_STATUS_TRANSACTION_TIMEOUT_AT_ACS = '4900490000000204', '', CardType.VISA, 123
    VISA_V22_3DS_SDK_TRANS_STATUS_TRANSACTION_TIMEOUT_AT_ACS = '4900490000000717', '', CardType.VISA, 123

    AMEX_V21_3DS_SDK_TRANS_STATUS_TRANSACTION_NON_PAYMENT = '340000000003227', '', CardType.AMEX, 1234
    AMEX_V22_3DS_SDK_TRANS_STATUS_TRANSACTION_NON_PAYMENT = '340000000004225', '', CardType.AMEX, 1234
    MASTERCARD_V21_3DS_SDK_TRANS_STATUS_TRANSACTION_NON_PAYMENT = '5591390000000231', '', CardType.MASTERCARD, 123
    MASTERCARD_V22_3DS_SDK_TRANS_STATUS_TRANSACTION_NON_PAYMENT = '5591390000000728', '', CardType.MASTERCARD, 123
    VISA_V21_3DS_SDK_TRANS_STATUS_TRANSACTION_NON_PAYMENT = '4900490000000220', '', CardType.VISA, 123
    VISA_V22_3DS_SDK_TRANS_STATUS_TRANSACTION_NON_PAYMENT = '4900490000000725', '', CardType.VISA, 123

    AMEX_V21_3DS_SDK_TRANS_STATUS_3RI_TRANSACTION_NOT_SUPPORTED = '340000000003235', '', CardType.AMEX, 1234
    AMEX_V22_3DS_SDK_TRANS_STATUS_3RI_TRANSACTION_NOT_SUPPORTED = '340000000004233', '', CardType.AMEX, 1234
    MASTERCARD_V21_3DS_SDK_TRANS_STATUS_3RI_TRANSACTION_NOT_SUPPORTED = '5591390000000249', '', CardType.MASTERCARD, 123
    MASTERCARD_V22_3DS_SDK_TRANS_STATUS_3RI_TRANSACTION_NOT_SUPPORTED = '5591390000000736', '', CardType.MASTERCARD, 123
    VISA_V21_3DS_SDK_TRANS_STATUS_3RI_TRANSACTION_NOT_SUPPORTED = '4900490000000238', '', CardType.VISA, 123
    VISA_V22_3DS_SDK_TRANS_STATUS_3RI_TRANSACTION_NOT_SUPPORTED = '4900490000000733', '', CardType.VISA, 123

    @property
    def number(self):
        # the same number as the formatted one but with 'normal' notation
        return int(self.formatted_number.replace(' ', ''))

    @property
    def expiration_date(self) -> str:
        expiration_date: str = self.__expiration_date
        if not expiration_date or expiration_date == 'FUTURE':
            return self.future_expiration_date
        elif self.__expiration_date == 'PAST':
            return self.past_expiration_date
        return expiration_date

    @property
    def future_expiration_date(self) -> str:
        date_two_years_in_future = adjust_date_day(get_current_time(), 2 * 365)
        return str(convert_to_string(date_two_years_in_future, date_formats.month_year))

    @property
    def past_expiration_date(self) -> str:
        date_two_years_in_past = adjust_date_day(get_current_time(), -2 * 365)
        return str(convert_to_string(date_two_years_in_past, date_formats.month_year))
