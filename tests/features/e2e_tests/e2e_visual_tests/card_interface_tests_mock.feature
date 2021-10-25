Feature: Visual regression - E2E Card Payments
  As a user
  I want to use card payments method
  In order to check full payment functionality

  Background:
    Given JS library configured by inline params VISUAL_BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And Frictionless card payment mock responses are set as BASE_JSINIT and payment status SUCCESS
    And User opens minimal.html page with inline param

  @visual_regression_safari @scrn_card_interface_after_successful_payment
  Scenario: Card interface after successful payment
    When User fills payment form with defined card MASTERCARD_FIXED_EXP_DATE_CARD
    And User clicks Pay button
    And Wait for notification frame
    And User focuses on the page title
    Then Screenshot is taken after 0 seconds and checked

  @visual_regression_safari @scrn_card_interface_before_payment
  Scenario: Card interface before payment
    When User focuses on the page title
    Then Screenshot is taken after 1 seconds and checked

  @visual_regression_safari @scrn_card_interface_error_expiry_date
  Scenario: Card interface after unsuccessful payment - invalid expiration date
    When User fills payment form with defined card MASTERCARD_INVALID_EXP_DATE_CARD
    And InvalidField response set for "EXPIRATION_DATE"
    And User clicks Pay button
    And Wait for notification frame
    And User focuses on the page title
    Then Screenshot is taken after 0 seconds and checked

  @visual_regression_safari @scrn_card_interface_error_invalid_patterns
  Scenario: Card interface before payment - invalid pattern data
    When User fills payment form with defined card MASTERCARD_INVALID_PATTERN_CARD
    And User clicks Pay button
    And User focuses on the page title
    Then Screenshot is taken after 6 seconds and checked
