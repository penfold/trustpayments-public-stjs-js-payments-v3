Feature: Successfull payments with start on load configuration

  As a user
  I want to use start on load option when submit button is not displayed
  In order to check full payment functionality

  #ToDo Adjust tests to new config
  Background:
    Given JavaScript configuration is set for scenario based on scenario's @config tag

  @config_cachetoken_tdq_auth
  Scenario: Successful payment with cachetoken, startOnLoad and request types: THREEDQUERY, AUTH
    When THREEDQUERY mock response is set to "ENROLLED_Y"
    And ACS mock response is set to "OK"
    And AUTH response is set to "OK"
    And User opens prepared payment form page WITHOUT_SUBMIT_BUTTON
    Then User will see payment status information: "Payment has been successfully processed"
    And THREEDQUERY ware sent only once in one request
    And AUTH ware sent only once in one request

  @config_cachetoken_tdq
  Scenario: Successful payment with cachetoken, startOnLoad and request types: THREEDQUERY
    When THREEDQUERY mock response is set to "ENROLLED_Y"
    And ACS mock response is set to "OK"
    And User opens prepared payment form page WITHOUT_SUBMIT_BUTTON
    Then User will see payment status information: "Payment has been successfully processed"
    And THREEDQUERY ware sent only once in one request

  @config_cachetoken_auth
  Scenario: Successful payment with cachetoken, startOnLoad and request types: AUTH
    When AUTH response is set to "OK"
    And User opens prepared payment form page WITHOUT_SUBMIT_BUTTON
    Then User will see payment status information: "Payment has been successfully processed"
    And AUTH ware sent only once in one request

#  @config_cachetoken_acheck_tdq_auth
#  Scenario: Successful payment with cachetoken, startOnLoad and request types: ACCOUNTCHECK, THREEDQUERY, AUTH
#    When ACCOUNTCHECK, THREEDQUERY mock response is set to OK
#    And ACS mock response is set to "OK"
#    And AUTH response is set to "OK"
#    And User opens prepared payment form page WITHOUT_SUBMIT_BUTTON
#    Then User will see payment status information: "Payment has been successfully processed"
#    And ACCOUNTCHECK, THREEDQUERY ware sent only once in one request
#    And AUTH ware sent only once in one request
#
#  @config_cachetoken_riskdec_acheck_tdq_auth
#  Scenario:  Successful payment with cachetoken, startOnLoad and request types: RISKDEC, ACCOUNTCHECK, THREEDQUERY, AUTH
#    When RISKDEC, ACCOUNTCHECK, THREEDQUERY mock response is set to OK
#    And ACS mock response is set to "OK"
#    And AUTH response is set to "OK"
#    And User opens payment page
#    Then User will see payment status information: "Payment has been successfully processed"
#    And RISKDEC, ACCOUNTCHECK, THREEDQUERY ware sent only once in one request
#    And AUTH ware sent only once in one request
#
#  @config_cachetoken_tdq_auth_riskdec
#  Scenario:  Successful payment with cachetoken, startOnLoad and request types: THREEDQUERY, AUTH, RISKDEC
#    When THREEDQUERY mock response is set to "ENROLLED_Y"
#    And ACS mock response is set to "OK"
#    And AUTH, RISKDEC mock response is set to OK
#    And User opens prepared payment form page WITHOUT_SUBMIT_BUTTON
#    Then User will see payment status information: "Payment has been successfully processed"
#    And THREEDQUERY ware sent only once in one request
#    And AUTH, RISKDEC ware sent only once in one request
