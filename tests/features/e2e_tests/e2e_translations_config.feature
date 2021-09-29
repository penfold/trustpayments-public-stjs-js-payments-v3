@translations
Feature: Payment form translations from config
  As a user
  I want to use card payments method
  In order to check full payment functionality in various languages


  Scenario: Locale translation override by config for field labels, pay button and field validation messages
    Given JS library configured by inline params CUSTOM_TRANSLATION_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    And User waits for Pay button to be active
    Then User will see card number label text is "CARD_NO_TRANSLATION_OVERRIDE"
    Then User will see expiration date label text is "EXP_DATE_TRANSLATION_OVERRIDE"
    Then User will see security code label text is "CODE_TRANSLATION_OVERRIDE"
    Then User will see that Pay button text is "PAY_TRANSLATION_OVERRIDE"
    When User clicks Pay button
    Then User will see validation message "REQUIRED_TRANSLATION_OVERRIDE" under all fields


  Scenario: Locale translation override by config for "Success" payment notification
    Given JS library configured by inline params CUSTOM_TRANSLATION_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_SUCCESSFUL_FRICTIONLESS_AUTH
    And User clicks Pay button
    Then User will see notification frame text: "NOTIFICATION_SUCCESS_TRANSLATION_OVERRIDE"


  Scenario: Locale translation override by config for "Error" payment notification
    Given JS library configured by inline params CUSTOM_TRANSLATION_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_STEP_UP_AUTH_FAILED
    And User clicks Pay button
    And User fills V2 authentication modal
    Then User will see notification frame text: "NOTIFICATION_ERROR_TRANSLATION_OVERRIDE"
