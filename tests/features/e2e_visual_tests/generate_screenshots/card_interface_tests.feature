Feature: Visual regression - E2E Card Payments
  As a user
  I want to use card payments method
  In order to check full payment functionality

  #feature just for screenshot creation purposes (e.g. when you need to create them again)

  @visual_regression_generation @scrn_card_interface_after_successful_payment
  Scenario: Card interface after successful payment
    Given JS library is configured with BYPASS_MASTERCARD_CONFIG and BASE_JWT
    And User opens example page
    When User fills payment form with defined card MASTERCARD_SUCCESSFUL_AUTH_CARD
    And User clicks Pay button
    Then Make screenshot after 5 seconds

  @visual_regression_generation @scrn_card_interface_before_payment
  Scenario: Card interface before payment
    Given JS library is configured with BYPASS_MASTERCARD_CONFIG and BASE_JWT
    When User opens example page
    Then Make screenshot after 5 seconds

  @visual_regression_generation @scrn_card_interface_error_expiry_date
  Scenario: Card interface after unsuccessful payment - invalid expiration date
    Given JS library is configured with BYPASS_MASTERCARD_CONFIG and BASE_JWT
    And User opens example page
    When User fills payment form with defined card MASTERCARD_INVALID_EXP_DATE_CARD
    And User clicks Pay button
    Then Make screenshot after 5 seconds

  @visual_regression_generation @scrn_card_interface_error_invalid_patterns
  Scenario: Card interface before payment - invalid pattern data
    Given JS library is configured with BYPASS_MASTERCARD_CONFIG and BASE_JWT
    And User opens example page
    When User fills payment form with defined card MASTERCARD_INVALID_PATTERN_CARD
    And User clicks Pay button
    Then Make screenshot after 5 seconds



