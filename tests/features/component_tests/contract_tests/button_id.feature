Feature: Mock for button id
  As a user
  I want to open page with two buttons
  In order to check payment process for two buttons

  Background:
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And Challenge card payment mock responses are set as BASE_JSINIT and payment status SUCCESS
    And ACS mock response is set to "OK"
    And User opens example page WITH_ADDITIONAL_BUTTON

  Scenario: Click on button configured as button id
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And AUTH and THREEDQUERY requests were sent only once with correct data


  Scenario: Click on button configured as additional button
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Additional button
    Then THREEDQUERY, AUTH request was not sent

