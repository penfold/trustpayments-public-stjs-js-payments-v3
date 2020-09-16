Feature: Visual regression - E2E Card Payments
  As a user
  I want to use card payments method
  In order to check full payment functionality

  Background:
    Given JavaScript configuration is set for scenario based on scenario's @config tag

  @base_config_visual @visual_regression_safari @scrn_card_interface_after_successful_payment
  Scenario: Card interface after successful payment
    Given User opens page with payment form
    When User fills payment form with defined card MASTERCARD_SUCCESSFUL_AUTH_CARD
    And THREEDQUERY mock response is set to "NOT_ENROLLED_N"
    And User clicks Pay button - AUTH response is set to "OK"
    Then Screenshot is taken after 6 seconds and checked

  @base_config_visual @visual_regression_safari @scrn_card_interface_before_payment
  Scenario: Card interface before payment
    When User opens page with payment form
    Then Screenshot is taken after 6 seconds and checked

  @base_config_visual @visual_regression_safari @scrn_card_interface_error_expiry_date
  Scenario: Card interface after unsuccessful payment - invalid expiration date
    Given User opens page with payment form
    When User fills payment form with defined card MASTERCARD_INVALID_EXP_DATE_CARD
    And InvalidField response set for "EXPIRATION_DATE"
    And User clicks Pay button
    Then Screenshot is taken after 6 seconds and checked

  @base_config_visual @visual_regression_safari @scrn_card_interface_error_invalid_patterns
  Scenario: Card interface before payment - invalid pattern data
    Given User opens page with payment form
    When User fills payment form with defined card MASTERCARD_INVALID_PATTERN_CARD
    And User clicks Pay button
    Then Screenshot is taken after 6 seconds and checked
