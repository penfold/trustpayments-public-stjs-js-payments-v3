Feature: Tokenisation

  As a user
  I want to use card payments method with tokenisation config
  In order to check full payment functionality

  Background:
    Given JavaScript configuration is set for scenario based on scenario's @config tag
    And User opens page with payment form

  @config_tokenisation_visa @extended_tests_part_2
  @submit_cvv_only @skip_form_inputs_load_wait
  Scenario: Tokenisation - successful payment by VISA card
    When User fills "SECURITY_CODE" field "123"
    And THREEDQUERY mock response is set to "ENROLLED_Y"
    And ACS mock response is set to "OK"
    And User clicks Pay button - AUTH response is set to "OK"
    Then User will see payment status information: "Payment has been successfully processed"
    And THREEDQUERY, AUTH ware sent only once in one request

  @config_tokenisation_amex
  @submit_cvv_only @skip_form_inputs_load_wait
  Scenario: Tokenisation case 1 - successful payment by AMEX card
    When User fills "SECURITY_CODE" field "1234"
    And Frictionless THREEDQUERY, AUTH response is set to OK
    And User clicks Pay button
    Then User will see payment status information: "Payment has been successfully processed"

  @config_tokenisation_amex
  @submit_cvv_only @skip_form_inputs_load_wait
  Scenario: Tokenisation case 2 - successful payment by AMEX card
    When User fills "SECURITY_CODE" field "1234"
    And THREEDQUERY mock response is set to "ENROLLED_Y"
    And ACS mock response is set to "OK"
    And User clicks Pay button - AUTH response is set to "OK"
    Then User will see payment status information: "Payment has been successfully processed"
    And AUTH request was sent only once

  @config_tokenisation_bypass_cards_visa
  @submit_cvv_only @skip_form_inputs_load_wait
  Scenario: Tokenisation and bypassCard - successful payment by VISA card
    When User fills "SECURITY_CODE" field "123"
    And THREEDQUERY mock response is set to "ENROLLED_Y"
    And ACS mock response is set to "OK"
    And User clicks Pay button - AUTH response is set to "OK"
    Then User will see payment status information: "Payment has been successfully processed"
    And THREEDQUERY, AUTH ware sent only once in one request

  @config_tokenisation_visa_request_types
  @submit_cvv_only @skip_form_inputs_load_wait
  Scenario: Tokenisation - successful payment by VISA with request types: RISKDEC, ACCOUNTCHECK, TDQ, AUTH
    When User fills "SECURITY_CODE" field "123"
    And RISKDEC, ACCOUNTCHECK, THREEDQUERY mock response is set to OK
    And ACS mock response is set to "OK"
    And User clicks Pay button - AUTH response is set to "OK"
    Then User will see payment status information: "Payment has been successfully processed"
    #ToDo
#    And RISKDEC, ACCOUNTCHECK, THREEDQUERY, AUTH ware sent only once in one request
    And AUTH request was sent only once
