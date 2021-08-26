@3ds_sdk
Feature: 3ds SDK library initialization
  As a JS-Payments
  I want to be able to integrate with 3ds SDK
  So that I can configure it by own config file

@MI
  Scenario: Initialize 3ds SDK with defaults
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | THREEDQUERY AUTH   |
      | sitereference           | trustthreeds76424 |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_V21_3DS_SDK_NON_FRICTIONLESS
    And User clicks Pay button
    Then User see 3ds SDK challenge is displayed
