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
    When User fills payment form with defined card MASTERCARD_ERROR_ON_AUTH
    And User clicks Pay button
    Then User will see notification frame text: "NOTIFICATION_ERROR_TRANSLATION_OVERRIDE"


  @3ds_sdk_smoke @3ds_sdk
  Scenario: Locale translation override by config for 3ds SDK library challenge Cancel button
    Given JS library configured by inline params CUSTOM_TRANSLATION_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value             |
      | requesttypedescriptions | THREEDQUERY AUTH  |
      | sitereference           | trustthreeds76424 |
      | customercountryiso2a    | GB                |
      | billingcountryiso2a     | GB                |
    And User opens example page
    And User fills payment form with defined card MASTERCARD_V21_3DS_SDK_NON_FRICTIONLESS
    When User clicks Pay button
    And User see 3ds SDK challenge is displayed
    Then User see 3ds SDK challenge POPUP mode "cancel" button translation is "CANCEL_TRANSLATION_OVERRIDE"
