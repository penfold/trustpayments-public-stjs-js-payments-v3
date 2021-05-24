Feature: Visual regression - E2E Card Payments
  As a user
  I want to use card payments method
  In order to check full payment functionality

  Background:
    Given JavaScript configuration is set for scenario based on scenario's @config tag
    And User opens mock payment page MINIMAL_HTML
    And User changes minimal example page language to "de_DE"
    And User waits for whole form to be displayed

  @base_config_visual_styling @visual_regression_styling_safari @scrn_card_interface_after_successful_payment_styling
  Scenario: Card interface after successful payment
    When User fills payment form with defined card MASTERCARD_FIXED_EXP_DATE_CARD
    And THREEDQUERY mock response is set to "NOT_ENROLLED_N"
    And User clicks Pay button - AUTH response is set to "OK"
    And Wait for notification frame
    Then Screenshot is taken after 0 seconds and checked

  @base_config_visual_styling @visual_regression_styling_safari @scrn_card_interface_before_payment_styling
  Scenario: Card interface before payment
    Then Screenshot is taken after 1 seconds and checked

  @base_config_visual_styling @visual_regression_styling_safari @scrn_card_interface_error_expiry_date_styling
  Scenario: Card interface after unsuccessful payment - invalid expiration date
    When User fills payment form with defined card MASTERCARD_INVALID_EXP_DATE_CARD
    And InvalidField response set for "EXPIRATION_DATE"
    And User clicks Pay button
    And Wait for notification frame
    Then Screenshot is taken after 6 seconds and checked

  @base_config_visual_styling @visual_regression_styling_safari @scrn_card_interface_error_invalid_patterns_styling
  Scenario: Card interface before payment - invalid pattern data
    When User fills payment form with defined card MASTERCARD_INVALID_PATTERN_CARD
    And User clicks Pay button
    Then Screenshot is taken after 6 seconds and checked

  @base_config_validation_styling @visual_regression_styling_safari @scrn_card_interface_with_validation_styling
  Scenario: Card interface with validation styling
    When User fills only security code for saved MASTERCARD_INVALID_CVV_CARD card
    And User focuses on "ANIMATED_CARD" field
    Then Screenshot is taken after 6 seconds and checked
