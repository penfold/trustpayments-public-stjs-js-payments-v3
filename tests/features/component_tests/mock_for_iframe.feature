Feature: Mock for iframe
  As a user
  I want to use card payments method with iframe
  In order to check payments

  Background:
    Given JavaScript configuration is set for scenario based on scenario's @config tag

    #ToDo - start_on_load
#  @config_start_on_load_requestTypes_tdq
#  Scenario: Check if start on load working on example page with defined iframe
#    When THREEDQUERY mock response is set to "NOT_ENROLLED_N"
#    When User opens mock payment page WITH_SPECIFIC_IFRAME
#    Then User will see notification frame text: "Payment has been successfully processed"
#    And Single THREEDQUERY request was sent only once with correct data

  @base_config
  Scenario: Check if payment working on example page with defined iframe
    When User opens mock payment page WITH_SPECIFIC_IFRAME
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And THREEDQUERY mock response is set to "ENROLLED_Y"
    And ACS mock response is set to "OK"
    And User clicks Pay button - AUTH response is set to "OK"
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And AUTH and THREEDQUERY requests were sent only once with correct data

