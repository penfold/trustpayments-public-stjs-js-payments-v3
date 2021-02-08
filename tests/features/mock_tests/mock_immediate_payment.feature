#Feature: Immediate payment
#
#  As a user
#  I want to use card payments method with immediate config
#  In order to check full payment functionality
#
##  Background:
##    Given JavaScript configuration is set for scenario based on scenario's @config tag
#
#  @config_immediate_payment_tdq
#  Scenario: Immediate payment - Successful payment with request types: THREEDQUERY
#    When THREEDQUERY mock response is set to "ENROLLED_Y"
#    And ACS mock response is set to "OK"
#    And User opens payment page
#    Then User will see payment status information: "Payment has been successfully processed"
#    And THREEDQUERY request was sent only once with correct data
#
#  @config_immediate_payment_acheck_tdq_auth_riskdec
#  Scenario: Immediate payment - Successful payment with additional request types: ACCOUNTCHECK, THREEDQUERY, AUTH, RISKDEC
#    When ACCOUNTCHECK, THREEDQUERY mock response is set to OK
#    And ACS mock response is set to "OK"
#    And AUTH, RISKDEC mock response is set to OK
#    And User opens payment page
#    Then User will see payment status information: "Payment has been successfully processed"
#    And ACCOUNTCHECK, THREEDQUERY ware sent only once in one request
#    #ToDo - check this step
#    #And AUTH, RISKDEC ware sent only once in one request
#
#  @config_immediate_payment_tdq_auth
#  Scenario: Immediate payment - Successful payment with request types: THREEDQUERY, AUTH
#    When THREEDQUERY mock response is set to "ENROLLED_Y"
#    And ACS mock response is set to "OK"
#    And AUTH response is set to "OK"
#    And User opens payment page
#    Then User will see payment status information: "Payment has been successfully processed"
#    And THREEDQUERY ware sent only once in one request
#    And AUTH request was sent only once
#
#  @config_immediate_payment_acheck_tdq_auth
#  Scenario: Immediate payment - Successful payment with additional request types: ACCOUNTCHECK, THREEDQUERY, AUTH
#    When ACCOUNTCHECK, THREEDQUERY mock response is set to OK
#    And ACS mock response is set to "OK"
#    And AUTH response is set to "OK"
#    And User opens payment page
#    Then User will see payment status information: "Payment has been successfully processed"
#    And ACCOUNTCHECK, THREEDQUERY ware sent only once in one request
#    And AUTH request was sent only once
#
#  @config_immediate_payment_riskdec_acheck_tdq_auth
#  Scenario: Immediate payment - Successful payment with additional request types: RISKDEC, ACCOUNTCHECK, THREEDQUERY, AUTH
#    When RISKDEC, ACCOUNTCHECK, THREEDQUERY mock response is set to OK
#    And ACS mock response is set to "OK"
#    And AUTH response is set to "OK"
#    And User opens payment page
#    Then User will see payment status information: "Payment has been successfully processed"
#    And RISKDEC, ACCOUNTCHECK, THREEDQUERY ware sent only once in one request
#    And AUTH request was sent only once
