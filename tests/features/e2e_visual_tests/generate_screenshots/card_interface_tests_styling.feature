Feature: Visual regression - E2E Card Payments
  As a user
  I want to use card payments method
  In order to check full payment functionality

  #feature just for screenshot creation purposes (e.g. when you need to create them again)

  Background:
    Given JS library is configured with BYPASS_MASTERCARD_WITH_STYLING_CONFIG and BASE_JWT_DE
    And User opens example page

  @visual_regression_styling_generation @scrn_card_interface_after_successful_payment_styling
  Scenario: Card interface after successful payment
    When User fills payment form with defined card MASTERCARD_SUCCESSFUL_AUTH_CARD
    And User clicks Pay button
    And Wait for notification frame
    And Wait for popups to disappear
    Then Make screenshot after 0 seconds

  @visual_regression_styling_generation @scrn_card_interface_before_payment_styling
  Scenario: Card interface before payment
    Then Make screenshot after 6 seconds

  @visual_regression_styling_generation @scrn_card_interface_error_expiry_date_styling
  Scenario: Card interface after unsuccessful payment - invalid expiration date
    When User fills payment form with defined card MASTERCARD_INVALID_EXP_DATE_CARD
    And User clicks Pay button
    And Wait for notification frame
    And Wait for popups to disappear
    Then Make screenshot after 0 seconds

  @visual_regression_styling_generation @scrn_card_interface_error_invalid_patterns_styling
  Scenario: Card interface before payment - invalid pattern data
    When User fills payment form with defined card MASTERCARD_INVALID_PATTERN_CARD
    And User clicks Pay button
    Then Make screenshot after 6 seconds
