Feature: Visual regression - E2E Card Payments
  As a user
  I want to use card payments method
  In order to check full payment functionality

  @visual_regression @scrn_card_interface_after_successful_payment
  Scenario: Card interface after successful payment
    Given JS library is configured with BYPASS_MASTERCARD_CONFIG and BASE_JWT
    And User opens example page
    When User fills payment form with defined card MASTERCARD_SUCCESSFUL_AUTH_CARD
    And User clicks Pay button
    Then Screenshot is taken after 6 seconds and checked

  @visual_regression @scrn_card_interface_before_payment
  Scenario: Card interface before payment
    Given JS library is configured with BYPASS_MASTERCARD_CONFIG and BASE_JWT
    When User opens example page
    Then Screenshot is taken after 6 seconds and checked

  @visual_regression @scrn_card_interface_error_expiry_date
  Scenario: Card interface after unsuccessful payment - invalid expiration date
    Given JS library is configured with BYPASS_MASTERCARD_CONFIG and BASE_JWT
    And User opens example page
    When User fills payment form with defined card MASTERCARD_INVALID_EXP_DATE_CARD
    And User clicks Pay button
    Then Screenshot is taken after 6 seconds and checked

  @visual_regression @scrn_card_interface_error_invalid_patterns
  Scenario: Card interface before payment - invalid pattern data
    Given JS library is configured with BYPASS_MASTERCARD_CONFIG and BASE_JWT
    And User opens example page
    When User fills payment form with defined card MASTERCARD_INVALID_PATTERN_CARD
    And User clicks Pay button
    Then Screenshot is taken after 6 seconds and checked
