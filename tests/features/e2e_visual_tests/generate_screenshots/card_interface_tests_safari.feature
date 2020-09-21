Feature: Visual regression - E2E Card Payments
  As a user
  I want to use card payments method
  In order to check full payment functionality

  #feature just for screenshot creation purposes (e.g. when you need to create them again)

  Background:
    Given JavaScript configuration is set for scenario based on scenario's @config tag
    And User opens page with payment form

  @base_config_visual @visual_regression_generation_safari @scrn_card_interface_after_successful_payment
  Scenario: Card interface after successful payment
    When User fills payment form with defined card MASTERCARD_SUCCESSFUL_AUTH_CARD
    And THREEDQUERY mock response is set to "NOT_ENROLLED_N"
    And User clicks Pay button - AUTH response is set to "OK"
    And Wait for notification frame
    And Wait for popups to disappear
    Then Make screenshot after 0 seconds

  @base_config_visual @visual_regression_generation_safari @scrn_card_interface_before_payment
  Scenario: Card interface before payment
    Then Make screenshot after 6 seconds

  @base_config_visual @visual_regression_generation_safari @scrn_card_interface_error_expiry_date
  Scenario: Card interface after unsuccessful payment - invalid expiration date
    When User fills payment form with defined card MASTERCARD_INVALID_EXP_DATE_CARD
    And InvalidField response set for "EXPIRATION_DATE"
    And User clicks Pay button
    And Wait for notification frame
    And Wait for popups to disappear
    Then Make screenshot after 0 seconds

  @base_config_visual @visual_regression_generation_safari @scrn_card_interface_error_invalid_patterns
  Scenario: Card interface before payment - invalid pattern data
    When User fills payment form with defined card MASTERCARD_INVALID_PATTERN_CARD
    And User clicks Pay button
    Then Make screenshot after 6 seconds
