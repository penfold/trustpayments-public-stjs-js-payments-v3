Feature: Successful payments with start on load configuration

  As a user
  I want to use start on load option when submit button is not displayed
  In order to check full payment functionality

  Background:
    Given JavaScript configuration is set for scenario based on scenario's @config tag

  @config_start_on_load_requestTypes_tdq
  Scenario: Successful payment with startOnLoad and request types THREEDQUERY
    And Single THREEDQUERY mock response is set to "ENROLLED_Y_WITHOUT_ACS_URL"
    And User opens mock payment page WITHOUT_SUBMIT_BUTTON
    Then User will see payment status information: "Payment has been successfully processed"
    And Single THREEDQUERY request was sent only once with correct data

  @config_start_on_load_acheck_tdq_auth_sub
  Scenario: Successful payment with startOnLoad and request types ACCOUNTCHECK, THREEDQUERY, AUTH, SUBSCRIPTION
    And Step up ACCOUNTCHECK, THREEDQUERY, AUTH, SUBSCRIPTION response is set to OK
    And ACS mock response is set to "OK"
    And AUTH, SUBSCRIPTION mock response is set to OK
    And User opens mock payment page WITHOUT_SUBMIT_BUTTON
    Then User will see payment status information: "Payment has been successfully processed"
    And ACCOUNTCHECK, THREEDQUERY, AUTH, SUBSCRIPTION ware sent only once in one request
    And AUTH, SUBSCRIPTION ware sent only once in one request

  @config_start_on_load_requestTypes_tdq_auth
  Scenario: Successful payment with startOnLoad request types: THREEDQUERY, AUTH
    And THREEDQUERY mock response is set to "ENROLLED_Y"
    And ACS mock response is set to "OK"
    And AUTH response is set to "OK"
    And User opens mock payment page WITHOUT_SUBMIT_BUTTON
    Then User will see payment status information: "Payment has been successfully processed"
    And THREEDQUERY, AUTH ware sent only once in one request
    And THREEDQUERY request was not sent

  @config_immediate_payment
  Scenario: Immediate payment (card enrolled N) - checking payment status for OK response code
    And Frictionless THREEDQUERY, AUTH response is set to OK
    And User opens mock payment page
    Then User will see payment status information: "Payment has been successfully processed"
    And JSINIT request was sent only once
    And THREEDQUERY, AUTH ware sent only once in one request

  @config_immediate_payment
  Scenario: Immediate payment (card enrolled Y) - check ACS response for code: FAILURE
    When THREEDQUERY mock response is set to "ENROLLED_Y"
    And ACS mock response is set to "FAILURE"
    And User opens mock payment page
    Then User will see payment status information: "An error occurred"
    And THREEDQUERY, AUTH ware sent only once in one request

  @config_immediate_payment_and_submit_on_success
  Scenario: Immediate payment with submitOnSuccess - successful payment
    When THREEDQUERY mock response is set to "ENROLLED_Y"
    And ACS mock response is set to "OK"
    And AUTH response is set to "OK"
    And User opens mock payment page
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

  @config_immediate_payment
  Scenario Outline: Immediate payment (card enrolled Y) - checking payment status for <action_code> response code
    When THREEDQUERY mock response is set to "ENROLLED_Y"
    And ACS mock response is set to "OK"
    And AUTH response is set to "<action_code>"
    And User opens mock payment page
    Then User will see payment status information: "<payment_status_message>"
    And THREEDQUERY, AUTH ware sent only once in one request

    Examples:
      | action_code | payment_status_message                  |
      | OK          | Payment has been successfully processed |

    Examples:
      | action_code | payment_status_message |
      | DECLINE     | Decline                |
