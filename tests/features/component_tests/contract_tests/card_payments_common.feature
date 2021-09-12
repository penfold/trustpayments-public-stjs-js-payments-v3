Feature: Card Payments

  As a user
  I want to use card payments method
  In order to check full payment functionality

  Background:
    Given JavaScript configuration is set for scenario based on scenario's @config tag

  @base_config
  Scenario: Verify number on JSINIT requests
    When User opens mock payment page
    Then JSINIT request was sent only once

  @base_config
  Scenario: Verify number of JSINIT requests together with UpdateJWT
    Given User opens mock payment page WITH_UPDATE_JWT
      | jwtName          |
      | BASE_UPDATED_JWT |
    When User fills payment form with defined card MASTERCARD_SUCCESSFUL_FRICTIONLESS_AUTH
    And THREEDQUERY, AUTH mock response is set to OK
    And User calls updateJWT function by filling amount field
    And User clicks Pay button - AUTH response is set to "OK"
    Then User will see notification frame text: "Payment has been successfully processed"
    And JSINIT request was sent 2 time
    And JSINIT requests contains updated jwt
