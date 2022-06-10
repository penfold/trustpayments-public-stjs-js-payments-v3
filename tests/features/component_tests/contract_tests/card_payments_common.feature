Feature: Card Payments - validation of requests send
  As a user
  I want to use card payments method
  In order to check full payment functionality

  Scenario: Verify number on JSINIT requests
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And Frictionless card payment mock responses are set as BASE_JSINIT and payment status SUCCESS
    When User opens example page
    When User fills payment form with defined card MASTERCARD_SUCCESSFUL_FRICTIONLESS_AUTH
    And User calls updateJWT function by filling amount field
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And JSINIT request was sent 1 time


  Scenario: Verify number of JSINIT requests together with UpdateJWT
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
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
    And JSINIT request was sent 2 time
    And JSINIT requests contains updated jwt
