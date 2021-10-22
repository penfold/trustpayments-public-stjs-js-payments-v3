Feature: Successful payments with various request types configurations

  As a user
  I want to use card payments method with request types configurations
  In order to check full payment functionality

  Scenario: Successful frictionless payment with request types: THREEDQUERY
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value       |
      | requesttypedescriptions | THREEDQUERY |
    And Card payment mock responses are set as JSINIT_TDQ and request type THREEDQUERY
    And Single THREEDQUERY mock response is set to "ENROLLED_Y_WITHOUT_ACS_URL"
    And User opens example page
    When User fills payment form with defined card MASTERCARD_SUCCESSFUL_FRICTIONLESS_AUTH
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And Single THREEDQUERY request was sent only once with correct data
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |


  Scenario: Successful step-up payment with request types: THREEDQUERY, AUTH
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And Challenge card payment mock responses are set as BASE_JSINIT and payment status SUCCESS
    And ACS mock response is set to "OK"
    And Step up AUTH response is set to OK
    And User opens example page
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And AUTH and THREEDQUERY requests were sent only once with correct data
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |

  @request_type
  Scenario: Successful payment with additional request types: ACCOUNTCHECK, THREEDQUERY, AUTH
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value                         |
      | requesttypedescriptions | ACCOUNTCHECK THREEDQUERY AUTH |
    And Card payment mock responses are set as JSINIT_ACHECK_TDQ_AUTH and request type ACCOUNTCHECK, THREEDQUERY, AUTH
    And User opens example page
    When User fills payment form with defined card MASTERCARD_SUCCESSFUL_FRICTIONLESS_AUTH
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And ACCOUNTCHECK, THREEDQUERY, AUTH ware sent only once in one request
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |

  @request_type
  Scenario: Successful payment with additional request types: THREEDQUERY, AUTH, RISKDEC
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value                    |
      | requesttypedescriptions | THREEDQUERY AUTH RISKDEC |
    And Card payment mock responses are set as JSINIT_TDQ_AUTH_RISKDEC and request type THREEDQUERY, AUTH, RISKDEC
    And User opens example page
    When User fills payment form with defined card MASTERCARD_SUCCESSFUL_FRICTIONLESS_AUTH
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And THREEDQUERY, AUTH, RISKDEC ware sent only once in one request
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |

  @request_type
  Scenario: Successful payment with additional request types: RISKDEC, ACCOUNTCHECK, THREEDQUERY, AUTH
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value                                 |
      | requesttypedescriptions | RISKDEC ACCOUNTCHECK THREEDQUERY AUTH |
    And Card payment mock responses are set as JSINIT_RISKDEC_ACHECK_TDQ_AUTH and request type RISKDEC, ACCOUNTCHECK, THREEDQUERY, AUTH
    And User opens example page
    When User fills payment form with defined card MASTERCARD_SUCCESSFUL_FRICTIONLESS_AUTH
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And RISKDEC, ACCOUNTCHECK, THREEDQUERY, AUTH ware sent only once in one request
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |


  Scenario: Successful payment with request types: THREEDQUERY and submitOnSuccess
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key             | value |
      | submitOnSuccess | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value       |
      | requesttypedescriptions | THREEDQUERY |
    And Card payment mock responses are set as JSINIT_TDQ and request type THREEDQUERY
    And Single THREEDQUERY mock response is set to "NOT_ENROLLED_N"
    And User opens example page
    And User fills merchant data with name "John Test", email "test@example", phone "44422224444"
    When User fills payment form with defined card MASTERCARD_SUCCESSFUL_FRICTIONLESS_AUTH
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | errorcode            | 0                                       |
      | myBillName           | John Test                               |
      | myBillEmail          | test@example                            |
      | myBillTel            | 44422224444                             |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | enrolled             | N                                       |
      | settlestatus         | 0                                       |
    And Single THREEDQUERY request was sent only once with correct data

  @request_type
  Scenario: Successful payment with additional request types: ACCOUNTCHECK, THREEDQUERY, AUTH, SUBSCRIPTION
    Given JS library configured by inline params BASIC_CONFIG and jwt JWT_WITH_SUBSCRIPTION with additional attributes
      | key                     | value                                      |
      | requesttypedescriptions | ACCOUNTCHECK THREEDQUERY AUTH SUBSCRIPTION |
    And Challenge card payment mock responses are set as JSINIT_ACHECK_TDQ_AUTH_SUB and request type ACCOUNTCHECK, THREEDQUERY, AUTH, SUBSCRIPTION
    And ACS mock response is set to "OK"
    And Step up AUTH, SUBSCRIPTION response is set to OK
    And User opens example page
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And ACCOUNTCHECK, THREEDQUERY, AUTH, SUBSCRIPTION ware sent only once in one request
    And AUTH, SUBSCRIPTION ware sent only once in one request
