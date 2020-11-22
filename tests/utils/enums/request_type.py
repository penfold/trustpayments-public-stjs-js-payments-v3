from enum import Enum

request_type_response = {
    'RISKDEC, ACCOUNTCHECK, THREEDQUERY': 'ccRiskdecAcheckTdq.json',
    'ACCOUNTCHECK, THREEDQUERY': 'ccAcheckTdq.json',
    'RISKDEC, ACCOUNTCHECK': 'ccRiskdecAcheck.json',
    'AUTH, RISKDEC': 'ccAuthRiskdec.json',
    'ACCOUNTCHECK, AUTH': 'ccAccountcheckAuth.json',
    'ACCOUNTCHECK, AUTH, SUBSCRIPTION': 'ccAccountcheckAuthSub.json',
    'AUTH, SUBSCRIPTION': 'ccAuthSub.json',
    'RISKDEC, ACCOUNTCHECK, AUTH': 'ccRiskdecAccountcheckAuth.json',
    'ACCOUNTCHECK, RISKDEC, AUTH': 'ccAccountcheckRiskdecAuth.json',
    'THREEDQUERY': 'ccTdq.json',
    'ACCOUNTCHECK, THREEDQUERY, AUTH': 'ccAcheckTdqAuth.json',
    'THREEDQUERY, AUTH, RISKDEC': 'ccTdqAuthRiskdec.json',
    'RISKDEC, ACCOUNTCHECK, THREEDQUERY, AUTH': 'ccRiskdecAcheckTdqAuth.json',
    'THREEDQUERY, ACCOUNTCHECK, RISKDEC, AUTH': 'ccTdqAcheckRiskdecAuth.json',
    'THREEDQUERY, AUTH': 'ccTdqAuth.json',
}

request_type_tokenisation_response = {
    'RISKDEC, ACCOUNTCHECK, THREEDQUERY': 'tokenisationRiskdecAcheckTdq.json',
}

request_type_applepay = {
    'AUTH': 'appleAuth.json',
    'ACCOUNTCHECK': 'appleAccountcheck.json',
    'ACCOUNTCHECK, AUTH': 'appleAccountcheckAuth.json',
    'RISKDEC, AUTH': 'appleRiskdecAuth.json',
    'RISKDEC, ACCOUNTCHECK, AUTH': 'appleRiskdecAccountcheckAuth.json',
    'AUTH, SUBSCRIPTION': 'appleAuthSubscription.json',
    'ACCOUNTCHECK, SUBSCRIPTION': 'appleAcheckSubscription.json'
}

frictionless_request_type = {
    'OK': 'frictionlessOk.json',
    'DECLINE': 'frictionlessDecline.json',
    'UNAUTHENTICATED': 'frictionlessUnauthenticated.json',
    'TDQ_U_OK': 'frictionlessUOk.json',
    'TDQ_U_DECLINE': 'frictionlessUDecline.json',
}

step_up_request_type = {
    'ACCOUNTCHECK, THREEDQUERY, AUTH, SUBSCRIPTION': 'stepUpAcheckTdqAuthSub.json'
}

request_type_visa = {
    'AUTH': 'visaAuthSuccess.json',
    'ACCOUNTCHECK': 'visaAccountcheck.json',
    'ACCOUNTCHECK, AUTH': 'visaAccountcheckAuth.json',
    'RISKDEC, AUTH': 'visaRiskdecAuth.json',
    'RISKDEC, ACCOUNTCHECK, AUTH': 'visaRiskdecAccountcheckAuth.json',
    'AUTH, SUBSCRIPTION': 'visaAuthSubscription.json',
    'ACCOUNTCHECK, SUBSCRIPTION': 'visaAcheckSubscription.json'
}


class RequestType(Enum):
    THREEDQUERY = 1
    AUTH = 2
    WALLETVERIFY = 3
    JSINIT = 4
    RISKDEC_ACHECK_TDQ = 5
    ACHECK_TDQ = 6
    AUTH_RISKDEC = 7
    RISKDEC_ACHECK = 8
    ACHECK_AUTH = 9
    RISKDEC_ACHECK_AUTH = 10
