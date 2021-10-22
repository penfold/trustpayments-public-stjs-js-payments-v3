Feature: iframe - validation of requests send
  As a user
  I want to use card payments method with iframe
  In order to check payments


  Scenario: Check if start on load working on example page with defined iframe
    Given JS library configured by inline params START_ON_LOAD_CONFIG and jwt JWT_WITH_FRICTIONLESS_CARD with additional attributes
      | key                     | value       |
      | requesttypedescriptions | THREEDQUERY |
    And Card payment mock responses are set as JSINIT_START_ON_LOAD_TDQ and request type THREEDQUERY
    And Single THREEDQUERY mock response is set to "NOT_ENROLLED_N"
    When User opens example page WITH_SPECIFIC_IFRAME
    Then User will see notification frame text: "Payment has been successfully processed"
    And Single THREEDQUERY request was sent only once with correct data


  Scenario: Check if payment working on example page with defined iframe
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And Challenge card payment mock responses are set as BASE_JSINIT and payment status SUCCESS
    And ACS mock response is set to "OK"
    And User opens example page WITH_SPECIFIC_IFRAME
    And User waits for form inputs to be loaded
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And AUTH and THREEDQUERY requests were sent only once with correct data
