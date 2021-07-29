Feature: Card Payments

  As a user
  I want to use card payments method
  In order to check full payment functionality

  Background:
    Given JavaScript configuration is set for scenario based on scenario's @config tag

  @base_config
  Scenario Outline: Payment form accessibility after payment process
    Given User opens mock payment page
    And User waits for whole form to be loaded
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And THREEDQUERY mock response is set to "ENROLLED_Y"
    And ACS mock response is set to "OK"
    And User clicks Pay button - AUTH response is set to "<action_code>"
    And User waits for payment to be processed
    Then User will see that Submit button is "<form_status>"
    And User will see that ALL input fields are "<form_status>"

    Examples:
      | action_code | form_status |
      | OK          | disabled    |

    Examples:
      | action_code | form_status |
      | DECLINE     | enabled     |

  @config_incorrect_request_type
  Scenario: Checking request types validation
    When User opens mock payment page with incorrect request type in config file
    Then User will see that application is not fully loaded

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
  Scenario: Security code re-enabled if server error on PIBA
    Given User opens mock payment page
    When User fills payment form with credit card number "3089500000000000021", expiration date "12/23"
    And THREEDQUERY mock response is set to "ENROLLED_Y"
    And ACS mock response is set to "OK"
    And User clicks Pay button - AUTH response is set to "DECLINE"
    Then User will see payment status information: "Decline"
    And User will see that "SECURITY_CODE" field is disabled
