Feature: SEON

  As a user
  I want to use card payments method with seon
  In order to check full payment functionality

  Scenario: SEON - verify if 'fraudcontroltransactionid' flag is added to requests during payment
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

  Scenario: SEON - verify if 'fraudcontroltransactionid' is not added to requests during payment for jwt with fraudControl
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

  Scenario: SEON - verify if 'fraudcontroltransactionid' is added to RISKDEC, ACCOUNTCHECK, THREEDQUERY, AUTH requests during frictionless payment
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value                                 |
      | requesttypedescriptions | RISKDEC ACCOUNTCHECK THREEDQUERY AUTH |
    And Card payment mock responses are set as JSINIT_RISKDEC_ACHECK_TDQ_AUTH and request type RISKDEC, ACCOUNTCHECK, THREEDQUERY, AUTH
    And User opens example page
    When User fills payment form with defined card MASTERCARD_SUCCESSFUL_FRICTIONLESS_AUTH
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And following requests were sent only once with 'fraudcontroltransactionid' flag
      | request_type                             |
      | RISKDEC, ACCOUNTCHECK, THREEDQUERY, AUTH |

  Scenario: SEON - verify 'fraudcontroltransactionid' is added to requests if deprecated 'cybertonicaApiKey' is set in config
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

  Scenario: SEON - verify 'fraudcontroltransactionid' is not added to requests after update jwt with fraudControl
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And Frictionless card payment mock responses are set as JSINIT_UPDATED_JWT_FRAUD_CONTROL and payment status SUCCESS
    And User opens page WITH_UPDATE_JWT and jwt JWT_WITH_FRAUD_CONTROL with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    When User fills payment form with defined card MASTERCARD_SUCCESSFUL_FRICTIONLESS_AUTH
    And User calls updateJWT function by filling amount field
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And following requests were sent only once without 'fraudcontroltransactionid' flag
      | request_type      |
      | THREEDQUERY, AUTH |

  Scenario: SEON - verify 'fraudcontroltransactionid' is added to requests after update jwt without fraudControl
    Given JS library configured by inline params BASIC_CONFIG and jwt JWT_WITH_FRAUD_CONTROL with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And Frictionless card payment mock responses are set as JSINIT_UPDATED_JWT and payment status SUCCESS
    And User opens page WITH_UPDATE_JWT and jwt BASE_UPDATED_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    When User fills payment form with defined card MASTERCARD_SUCCESSFUL_FRICTIONLESS_AUTH
    And User calls updateJWT function by filling amount field
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And following requests were sent only once with 'fraudcontroltransactionid' flag
      | request_type      |
      | THREEDQUERY, AUTH |

  Scenario: SEON - successful payment on example page with enabled Content Security Policy
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And Challenge card payment mock responses are set as BASE_JSINIT and payment status SUCCESS
    And ACS mock response is set to "OK"
    And User opens example page WITH_CSP
    And User waits for Pay button to be active
    And User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And following requests were sent only once with 'fraudcontroltransactionid' flag
      | request_type      |
      | THREEDQUERY, AUTH |
      | AUTH              |
