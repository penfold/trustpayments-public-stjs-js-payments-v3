@translations
Feature: Payment form translations from config with 3ds SDK library
  As a user
  I want to use card payments method
  In order to check full payment functionality in various languages


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
