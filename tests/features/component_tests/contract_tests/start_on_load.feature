Feature: Successful payments with start on load configuration

  As a user
  I want to use start on load option when submit button is not displayed
  In order to check full payment functionality

  @start_on_load
  Scenario: Successful payment with startOnLoad and request types THREEDQUERY
    Given JS library configured by inline params START_ON_LOAD_CONFIG and jwt JWT_WITH_FRICTIONLESS_CARD with additional attributes
      | key                     | value       |
      | requesttypedescriptions | THREEDQUERY |
    And Card payment mock responses are set as JSINIT_START_ON_LOAD_TDQ and request type THREEDQUERY
    And Single THREEDQUERY mock response is set to "ENROLLED_Y_WITHOUT_ACS_URL"
    When User opens example page WITHOUT_SUBMIT_BUTTON
    Then User will see notification frame text: "Payment has been successfully processed"
    And Single THREEDQUERY request was sent only once with correct data

  @start_on_load
  Scenario: Successful payment with startOnLoad and request types ACCOUNTCHECK, THREEDQUERY, AUTH, SUBSCRIPTION
    Given JS library configured by inline params START_ON_LOAD_CONFIG and jwt JWT_NON_FRICTIONLESS_CARD_SUBSCRIPTION with additional attributes
      | key                     | value                                         |
      | requesttypedescriptions | ACCOUNTCHECK, THREEDQUERY, AUTH, SUBSCRIPTION |
    And Challenge card payment mock responses are set as JSINIT_START_ON_LOAD_ACHECK_TDQ_AUTH_SUB and request type ACCOUNTCHECK, THREEDQUERY, AUTH, SUBSCRIPTION
    And Step up AUTH, SUBSCRIPTION response is set to OK
    And ACS mock response is set to "OK"
    When User opens example page WITHOUT_SUBMIT_BUTTON
    Then User will see notification frame text: "Payment has been successfully processed"
    And ACCOUNTCHECK, THREEDQUERY, AUTH, SUBSCRIPTION ware sent only once in one request
    And AUTH, SUBSCRIPTION ware sent only once in one request

  @start_on_load
  Scenario: Successful payment with startOnLoad request types: THREEDQUERY, AUTH
    Given JS library configured by inline params START_ON_LOAD_CONFIG and jwt JWT_WITH_NON_FRICTIONLESS_CARD with additional attributes
      | key                     | value             |
      | requesttypedescriptions | THREEDQUERY, AUTH |
    And Card payment mock responses are set as JSINIT_START_ON_LOAD_TDQ_AUTH and request type THREEDQUERY, AUTH
    And Step up AUTH response is set to OK
    And ACS mock response is set to "OK"
    When User opens example page WITHOUT_SUBMIT_BUTTON
    Then User will see notification frame text: "Payment has been successfully processed"
    And THREEDQUERY, AUTH ware sent only once in one request
    And THREEDQUERY request was not sent

  @start_on_load
  Scenario: startOnLoad with submitOnSuccess - successful payment
    Given JS library configured with START_ON_LOAD_CONFIG and additional attributes
      | key             | value |
      | submitOnSuccess | true  |
    And JS library authenticated by jwt JWT_FAILED_NON_FRICTIONLESS_CARD with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And Challenge card payment mock responses are set as JSINIT_START_ON_LOAD_TDQ_AUTH and payment status SUCCESS
    And ACS mock response is set to "OK"
    And Step up AUTH response is set to OK
    When User opens example page
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | 1000                                    |
      | currencyiso3a        | GBP                                     |
      | errorcode            | 0                                       |
      | status               | Y                                       |
      | transactionreference | should not be none                      |
      | eci                  | 05                                      |
      | enrolled             | Y                                       |
      | settlestatus         | 0                                       |
      | jwt                  | should not be none                      |
    And THREEDQUERY, AUTH ware sent only once in one request
    And THREEDQUERY request was not sent

  @start_on_load
  Scenario Outline: startOnLoad - checking payment status for <action_code> response code
    Given JS library configured by inline params START_ON_LOAD_CONFIG and jwt JWT_WITH_NON_FRICTIONLESS_CARD with additional attributes
      | key                     | value             |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And Challenge card payment mock responses are set as JSINIT_START_ON_LOAD_TDQ_AUTH and payment status <action_code>
    And ACS mock response is set to "OK"
    When User opens example page
    Then User will see notification frame text: "<payment_status_message>"
    And THREEDQUERY, AUTH ware sent only once in one request

    Examples:
      | action_code | payment_status_message                  |
      | SUCCESS     | Payment has been successfully processed |
      | DECLINE     | Decline                                 |
