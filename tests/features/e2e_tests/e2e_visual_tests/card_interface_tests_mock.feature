Feature: Visual regression - E2E Card Payments
  As a user
  I want to use card payments method
  In order to check full payment functionality

  Background:
    Given JavaScript configuration is set for scenario based on scenario's @config tag
    And User opens mock payment page MINIMAL_HTML
    And User waits for whole form to be displayed


  @base_config_visual @visual_regression_safari @scrn_card_interface_after_successful_payment
  Scenario: scenariusz testowy
    When User fills payment form with defined card MASTERCARD_FIXED_EXP_DATE_CARD
    And THREEDQUERY mock response is set to "NOT_ENROLLED_N"
    And User clicks Pay button - AUTH response is set to "OK"
    And Wait for notification frame
    And User focuses on the page title
    Then Screenshot is taken after 0 seconds and checked
