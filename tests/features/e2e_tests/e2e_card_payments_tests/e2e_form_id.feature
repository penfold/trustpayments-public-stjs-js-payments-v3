Feature: E2E for form id

  As a user
  I want to use card payments method with another formId
  In order to check full payment functionality

  Background:
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key    | value    |
      | formId | testForm |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |

  Scenario: Successful non-frictionless payment with form id
    And User opens example page WITH_CHANGED_FORM_ID
    When User fills payment form with defined card VISA_CARD
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And User will see that Pay button is "disabled"
    And User will see that ALL input fields are "disabled"

  Scenario: Successful frictionless payment with form id
    And User opens example page WITH_CHANGED_FORM_ID
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    And User fills V2 authentication modal
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And User will see that Pay button is "disabled"
    And User will see that ALL input fields are "disabled"

  Scenario: Decline payment with form id
    And User opens example page WITH_CHANGED_FORM_ID
    When User fills payment form with defined card VISA_DECLINED_CARD
    And User clicks Pay button
    Then User will see notification frame text: "Decline"
    And User will see that notification frame has "red" color

  Scenario: Payment for form using different formId in config
    And User opens example page WITH_SPECIFIC_FORM_ID
    Then User will see that application is not fully loaded
