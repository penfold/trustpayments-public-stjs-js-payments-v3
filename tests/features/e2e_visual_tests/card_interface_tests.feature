Feature: Visual regression - E2E Card Payments
  As a user
  I want to use card payments method
  In order to check full payment functionality

  Background:
    Given JS library configured by inline params BYPASS_MASTERCARD_CONFIG and jwt BASE_JWT with additional attributes
      | key                      | value            |
      | requesttypedescriptions  | THREEDQUERY AUTH |
      | threedbypasspaymenttypes | MASTERCARD       |
    And User opens minimal.html page with inline param

  @visual_regression @scrn_card_interface_after_successful_payment
  Scenario: Card interface after successful payment
    And User waits for whole form to be displayed
    When User fills payment form with defined card MASTERCARD_FIXED_EXP_DATE_CARD
    And User clicks Pay button
    And Wait for notification frame
    Then Screenshot is taken after 0 seconds and checked

  @visual_regression @scrn_card_interface_before_payment
  Scenario: Card interface before payment
    And User waits for whole form to be displayed
    And User waits for Pay button to be active
    Then Screenshot is taken after 1 seconds and checked

  @visual_regression @scrn_card_interface_error_expiry_date
  Scenario: Card interface after unsuccessful payment - invalid expiration date
    And User waits for whole form to be displayed
    When User fills payment form with defined card MASTERCARD_INVALID_EXP_DATE_CARD
    And User clicks Pay button
    And Wait for notification frame
    Then Screenshot is taken after 0 seconds and checked

  @visual_regression @scrn_card_interface_error_invalid_patterns
  Scenario: Card interface before payment - invalid pattern data
    And User waits for whole form to be displayed
    When User fills payment form with defined card MASTERCARD_INVALID_PATTERN_CARD
    And User clicks Pay button
    Then Screenshot is taken after 6 seconds and checked
