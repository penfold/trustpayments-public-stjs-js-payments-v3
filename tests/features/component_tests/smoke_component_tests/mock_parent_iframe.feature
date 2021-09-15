Feature: Payment form embedded into iframe

  @base_config @parent_iframe
  Scenario: App is embedded in another iframe - Cardinal Commerce test
    Given JavaScript configuration is set for scenario based on scenario's @config tag
    And User opens mock payment page
    When User waits for whole form to be loaded
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And THREEDQUERY mock response is set to "ENROLLED_Y"
    And ACS mock response is set to "OK"
    And User clicks Pay button - AUTH response is set to "OK"
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
