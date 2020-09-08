Feature: E2E Card Payments - visual regression
  As a user
  I want to use card payments method
  In order to check full payment functionality


  @reactJS @visual_regression @example_for_screenshots
  @angular
  @e2e_config_bypass_mastercard @scrn_successful_payment_with_bypassCard_using_mastercard
  Scenario: Successful payment with bypassCard using Mastercard
    Given JS library is configured with BYPASS_MASTERCARD_CONFIG and BASE_JWT
    And User opens example page
    When User fills payment form with defined card MASTERCARD_SUCCESSFUL_AUTH_CARD
    And User clicks Pay button
    Then Screenshot is taken after 1 seconds and checked
