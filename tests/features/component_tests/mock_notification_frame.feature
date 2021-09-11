Feature: Notification frame

  As a user
  I want to use card payments method
  In order to check notification frame after payment

  Background:
    Given JavaScript configuration is set for scenario based on scenario's @config tag
    And User opens mock payment page

  @config_disable_notifications_true
  Scenario: Notification frame is not displayed after payment
    When User fills payment form with defined card MASTERCARD_SUCCESSFUL_FRICTIONLESS_AUTH
    And THREEDQUERY, AUTH mock response is set to OK
    And User clicks Pay button
    Then User will not see notification frame

  @config_submit_on_success_and_error_true
  Scenario Outline: Notification frame is not displayed after payment with submitOn<submitOn>
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And THREEDQUERY mock response is set to "ENROLLED_Y"
    And ACS mock response is set to "OK"
    And User clicks Pay button - AUTH response is set to "<action_code>"
    Then User will not see notification frame

    Examples:
      | submitOn | action_code |
      | Success  | OK          |
      | Error    | DECLINE     |

  @base_config
  Scenario: Checking notification banner style after second payment
    When User fills payment form with credit card number "4000000000001018", expiration date "01/22" and cvv "123"
    And THREEDQUERY mock response is set to "ENROLLED_Y"
    And ACS mock response is set to "OK"
    And User clicks Pay button - AUTH response is set to "UNAUTHENTICATED"
    Then User will see notification frame text: "Unauthenticated"
    And User will see that notification frame has "red" color
    And User waits for notification frame to disappear
    When User fills payment form with credit card number "4111110000000211", expiration date "01/22" and cvv "123"
    And User clicks Pay button - AUTH response is set to "OK"
    And User waits for payment to be processed
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
