Feature: Payment form embedded into iframe

  @parent_iframe
  Scenario: App is embedded in another iframe - Cardinal Commerce test
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And Challenge card payment mock responses are set as BASE_JSINIT and payment status SUCCESS
    And ACS mock response is set to "OK"
    And User opens example page IN_IFRAME
    And User waits for form inputs to be loaded
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
