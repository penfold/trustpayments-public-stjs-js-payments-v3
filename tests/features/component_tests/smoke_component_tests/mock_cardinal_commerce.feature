Feature: Cardinal commerce

  As a user
  I want to use card payments method with cardinal commerce config
  In order to check full payment functionality


  @base_config @smoke_component_test
  Scenario Outline: Cardinal Commerce (step-up payment) - checking payment status for <action_code> response code
    Given JavaScript configuration is set for scenario based on scenario's @config tag
    And User opens mock payment page
    And User waits for whole form to be loaded
    When User fills payment form with defined card <card>
    And THREEDQUERY mock response is set to "ENROLLED_Y"
    And ACS mock response is set to "OK"
    And User clicks Pay button - AUTH response is set to "<action_code>"
    Then User will see notification frame text: "<payment_status_message>"
    And User will see that notification frame has "<color>" color

    Examples:
      | card                         | action_code | payment_status_message                  | color |
      | VISA_V21_NON_FRICTIONLESS    | OK          | Payment has been successfully processed | green |
      | VISA_V21_STEP_UP_AUTH_FAILED | DECLINE     | Decline                                 | red   |
