from enum import Enum


class JSinitResponse(Enum):
    BASE_JSINIT = 'jsinit.json'
    JSINIT_UPDATED_JWT = 'jsinitBaseUpdatedJwt.json'
    JSINIT_AUTH_UPDATED_JWT = 'jsinitAuthUpdatedJwt.json'
    JSINIT_AUTH = 'jsinitAuth.json'
    JSINIT_TDQ = 'jsinitTDQ.json'
    JSINIT_TDQ_AUTH_RISKDEC = 'jsinitTdqAuthRiskdec.json'
    JSINIT_ACHECK = 'jsinitAcheck.json'
    JSINIT_ACHECK_AUTH = 'jsinitAcheckAuth.json'
    JSINIT_ACHECK_TDQ_AUTH = 'jsinitAcheckTdqAuth.json'
    JSINIT_ACHECK_TDQ_AUTH_SUB = 'jsinitAcheckTdqAuthSub.json'
    JSINIT_RISKDEC_AUTH = 'jsinitRiskdecAuth.json'
    JSINIT_RISKDEC_ACHECK_AUTH = 'jsinitRiskdecAcheckAuth.json'
    JSINIT_RISKDEC_ACHECK_TDQ_AUTH = 'jsinitRiskdecAcheckTdqAuth.json'
    JSINIT_AUTH_SUBSCRIPTION = 'jsinitAuthSubscription.json'
    JSINIT_ACHECK_SUBSCRIPTION = 'jsinitAcheckSubscription.json'
    JSINIT_MAINAMOUNT = 'jsinitMainamount.json'
    JSINIT_BYPASS_TDQ = 'jsinitBypassTdq.json'
    JSINIT_BYPASS_TDQ_AUTH_RISKDEC = 'jsinitBypassTdqAuthRiskdec.json'
    JSINIT_BYPASS_ACHECK_TDQ_AUTH = 'jsinitBypassAcheckTdqAuth.json'
    JSINIT_BYPASS_RISKDEC_ACHECK_TDQ_AUTH = 'jsinitBypassRiskdecAcheckTdqAuth.json'
    JSINIT_BYPASS_ACHECK_TDQ_AUTH_SUB = 'jsinitBypassAcheckTdqAuthSub.json'
    JSINIT_BYPASS_TDQ_ACHECK_RISKDEC_SUB = 'jsinitBypassTdqAcheckRiskdecAuth.json'
    JSINIT_START_ON_LOAD_TDQ = 'jsinitStartOnLoadTdq.json'
    JSINIT_START_ON_LOAD_TDQ_AUTH = 'jsinitStartOnLoadTdqAuth.json'
    JSINIT_START_ON_LOAD_ACHECK_TDQ_AUTH_SUB = 'jsinitStartOnLoadAcheckTdqAuthSub.json'
    JSINIT_TOKENISATION_VISA = 'jsinitTokenisationVisa.json'
    JSINIT_TOKENISATION_BYPASS_VISA = 'jsinitTokenisationVisa.json'
    JSINIT_TOKENISATION_AMEX = 'jsinitTokenisationAmex.json'
