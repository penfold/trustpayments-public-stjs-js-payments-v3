Feature: SEON

  As a user
  I want to use card payments method with seon
  In order to check full payment functionality

  Scenario: SEON - 'fraudcontroltransactionid' flag is added to THREEDQUERY and AUTH requests during payment
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And Challenge card payment mock responses are set as BASE_JSINIT and payment status SUCCESS
    And ACS mock response is set to "OK"
    And User opens example page
    And User waits for Pay button to be active
    And User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And following requests were sent only once with 'fraudcontroltransactionid' flag
      | request_type      |
      | THREEDQUERY, AUTH |
      | AUTH              |

  Scenario: SEON - 'fraudcontroltransactionid' flag is not added to THREEDQUERY and AUTH requests during payment
    Given JS library configured by inline params BASIC_CONFIG and jwt JWT_WITH_FRAUD_CONTROL with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And Challenge card payment mock responses are set as BASE_JSINIT and payment status SUCCESS
    And ACS mock response is set to "OK"
    And User opens example page
    And User waits for Pay button to be active
    And User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And following requests were sent only once without 'fraudcontroltransactionid' flag
      | request_type      |
      | THREEDQUERY, AUTH |
      | AUTH              |

  Scenario: SEON - 'fraudcontroltransactionid' flag is added to RISKDEC, ACCOUNTCHECK, THREEDQUERY, AUTH request during frictionless payment
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value                                 |
      | requesttypedescriptions | RISKDEC ACCOUNTCHECK THREEDQUERY AUTH |
    And Card payment mock responses are set as JSINIT_RISKDEC_ACHECK_TDQ_AUTH and request type RISKDEC, ACCOUNTCHECK, THREEDQUERY, AUTH
    And User opens example page
    When User fills payment form with defined card MASTERCARD_SUCCESSFUL_FRICTIONLESS_AUTH
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And RISKDEC, ACCOUNTCHECK, THREEDQUERY, AUTH ware sent only once in one request
    And following requests were sent only once with 'fraudcontroltransactionid' flag
      | request_type                             |
      | RISKDEC, ACCOUNTCHECK, THREEDQUERY, AUTH |

  Scenario: SEON - verify 'fraudcontroltransactionid' flag is added to requests if deprecated 'cybertonicaApiKey' is set in config
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key               | value |
      | cybertonicaApiKey |       |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And Challenge card payment mock responses are set as BASE_JSINIT and payment status SUCCESS
    And ACS mock response is set to "OK"
    And User opens example page
    And User waits for Pay button to be active
    And User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And following requests were sent only once with 'fraudcontroltransactionid' flag
      | request_type      |
      | THREEDQUERY, AUTH |
      | AUTH              |
