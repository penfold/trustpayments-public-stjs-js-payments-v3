from enum import Enum

request_type_response = {
    'AUTH': 'ccAUTHoK.json',
    'RISKDEC, ACCOUNTCHECK, THREEDQUERY': 'ccRiskdecAcheckTdq.json',
    'ACCOUNTCHECK, THREEDQUERY': 'ccAcheckTdq.json',
    'RISKDEC, ACCOUNTCHECK': 'ccRiskdecAcheck.json',
    'AUTH, RISKDEC': 'ccAuthRiskdec.json',
    'ACCOUNTCHECK, AUTH': 'ccAccountcheckAuth.json',
    'ACCOUNTCHECK, AUTH, SUBSCRIPTION': 'ccAccountcheckAuthSub.json',
    'AUTH, SUBSCRIPTION': 'ccAuthSub.json',
    'RISKDEC, ACCOUNTCHECK, AUTH': 'ccRiskdecAccountcheckAuth.json',
    'ACCOUNTCHECK, THREEDQUERY, AUTH': 'ccAcheckTdqAuth.json',
    'THREEDQUERY, AUTH, RISKDEC': 'ccTdqAuthRiskdec.json',
    'RISKDEC, ACCOUNTCHECK, THREEDQUERY, AUTH': 'ccRiskdecAcheckTdqAuth.json',
    'THREEDQUERY, AUTH': 'ccTdqAuth.json',
    'THREEDQUERY, ACCOUNTCHECK, RISKDEC, AUTH': 'ccInvalidField_requesttypedescriptions.json',
    'THREEDQUERY': 'ccBypass_requesttypedescriptions.json',
    'ACCOUNTCHECK, RISKDEC, AUTH': 'ccAccountcheckRiskdecAuth.json',
    'ACCOUNTCHECK, THREEDQUERY, AUTH, SUBSCRIPTION': 'ccAcheckTdqAuthSub.json'
}

request_type_tokenisation_response = {
    'RISKDEC, ACCOUNTCHECK, THREEDQUERY': 'tokenisationRiskdecAcheckTdq.json',
    'AUTH': 'ccAUTHoK.json',
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
    'SUCCESS': 'frictionlessOk.json',
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

request_type_google = {
    'AUTH': 'googleAuth.json',
    'ACCOUNTCHECK': 'googleAccountcheck.json',
    'ACCOUNTCHECK, AUTH': 'googleAccountcheckAuth.json',
    'RISKDEC, AUTH': 'googleRiskdecAuth.json',
    'RISKDEC, ACCOUNTCHECK, AUTH': 'googleRiskdecAccountcheckAuth.json',
    'AUTH, SUBSCRIPTION': 'googleAuthSubscription.json',
    'ACCOUNTCHECK, SUBSCRIPTION': 'googleAccountcheckSubscription.json',
    'THREEDQUERY, AUTH, SUBSCRIPTION': 'googleThreedqueryAuthSubscription.json'
}


class RequestType(Enum):
    THREEDQUERY = 'THREEDQUERY'
    AUTH = 'AUTH'
    TDQ_AUTH = 'THREEDQUERY, AUTH'
    WALLETVERIFY = 'WALLETVERIFY'
    JSINIT = 'JSINIT'
    RISKDEC_ACHECK_TDQ = 'RISKDEC, ACCOUNTCHECK, THREEDQUERY'
    ACHECK_TDQ = 'ACCOUNTCHECK, THREEDQUERY'
    AUTH_RISKDEC = 'AUTH, RISKDEC'
    RISKDEC_ACHECK = 'RISKDEC, AUTH'
    ACHECK_AUTH = 'ACCOUNTCHECK, AUTH'
    RISKDEC_ACHECK_AUTH = 'RISKDEC, ACCOUNTCHECK, AUTH'
