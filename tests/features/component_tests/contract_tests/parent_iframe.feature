Feature: Payment form embedded into iframe - validation of requests send


  Background:
    Given JavaScript configuration is set for scenario based on scenario's @config tag
    And User opens mock payment page


  @base_config @parent_iframe
  Scenario Outline: App is embedded in another iframe - Cardinal Commerce test
    When User opens mock payment page
    And User waits for whole form to be loaded
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And THREEDQUERY mock response is set to "ENROLLED_Y"
    And ACS mock response is set to "OK"
    And User clicks Pay button - AUTH response is set to "<action_code>"
    Then User will see notification frame text: "<payment_status_message>"
    And AUTH and THREEDQUERY requests were sent only once with correct data

    Examples:
      | action_code     | payment_status_message                  |
      | OK              | Payment has been successfully processed |
      | UNAUTHENTICATED | Unauthenticated                         |


  @base_config @parent_iframe
  Scenario: App is embedded in another iframe - fields validation test
    When User opens mock payment page
    And User clicks Pay button
    Then User will see validation message "Field is required" under all fields
    And User will see that all fields are highlighted
    And THREEDQUERY, AUTH request was not sent
