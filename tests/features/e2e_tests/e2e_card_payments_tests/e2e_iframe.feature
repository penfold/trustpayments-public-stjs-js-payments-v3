Feature: E2E tests for iframe
  As a user
  I want to use iframe page
  To make payment


  @parent_iframe
  Scenario: Successful frictionless payment on iframe
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page IN_IFRAME
    When User fills payment form with defined card VISA_V21_FRICTIONLESS
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And User will see that Pay button is "disabled"
    And User will see that ALL input fields are "disabled"

  @parent_iframe
  Scenario: Successful non-frictionless payment with startOnLoad on iframe
    Given JS library configured by inline params START_ON_LOAD_CONFIG and jwt JWT_WITH_NON_FRICTIONLESS_CARD with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page IN_IFRAME
    When User fills V2 authentication modal
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And User will see that Pay button is "disabled"
    And User will see that ALL input fields are "disabled"
