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
    Then User will see payment status information: "Payment has been successfully processed"
    And JSINIT request was sent 2 time
    And JSINIT requests contains updated jwt

  @config_bypass_cards
  Scenario: Security code disabled if server error on PIBA
    Given User opens mock payment page
    When User fills payment form with credit card number "3089500000000000021", expiration date "12/23"
    And THREEDQUERY mock response is set to "ENROLLED_Y"
    And ACS mock response is set to "OK"
    And User clicks Pay button - AUTH response is set to "DECLINE"
    Then User will see payment status information: "Decline"
    And User will see that SECURITY_CODE input field is "disabled"
