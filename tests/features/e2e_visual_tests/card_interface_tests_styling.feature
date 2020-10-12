Feature: Visual regression - E2E Card Payments
  As a user
  I want to use card payments method
  In order to check full payment functionality


  @visual_regression_styling @scrn_card_interface_after_successful_payment_styling
  Scenario: Card interface after successful payment
    Given JS library is configured with BYPASS_MASTERCARD_WITH_STYLING_CONFIG and BASE_JWT_DE
    And User opens example page
    When User fills payment form with defined card MASTERCARD_FIXED_EXP_DATE_CARD
    And User clicks Pay button
    And Wait for notification frame
    And Wait for popups to disappear
    Then Screenshot is taken after 0 seconds and checked

  @visual_regression_styling @scrn_card_interface_before_payment_styling
  Scenario: Card interface before payment
    Given JS library is configured with BYPASS_MASTERCARD_WITH_STYLING_CONFIG and BASE_JWT_DE
    And User opens example page
    Then Screenshot is taken after 6 seconds and checked

  @visual_regression_styling @scrn_card_interface_error_expiry_date_styling
  Scenario: Card interface after unsuccessful payment - invalid expiration date
    Given JS library is configured with BYPASS_MASTERCARD_WITH_STYLING_CONFIG and BASE_JWT_DE
    And User opens example page
    When User fills payment form with defined card MASTERCARD_INVALID_EXP_DATE_CARD
    And User clicks Pay button
    And Wait for notification frame
    And Wait for popups to disappear
    Then Screenshot is taken after 0 seconds and checked

  @visual_regression_styling @scrn_card_interface_error_invalid_patterns_styling
  Scenario: Card interface before payment - invalid pattern data
    Given JS library is configured with BYPASS_MASTERCARD_WITH_STYLING_CONFIG and BASE_JWT_DE
    And User opens example page
    When User fills payment form with defined card MASTERCARD_INVALID_PATTERN_CARD
    And User clicks Pay button
    Then Screenshot is taken after 6 seconds and checked

  @visual_regression_styling @scrn_card_interface_with_validation_styling
  Scenario: Card interface with validation styling
    Given JS library is configured with VALIDATION_STYLES_CONFIG and BASE_JWT
    And User opens example page
    When User fills only security code for saved MASTERCARD_INVALID_CVV_CARD card
    And Change field focus
    Then Screenshot is taken after 6 seconds and checked
