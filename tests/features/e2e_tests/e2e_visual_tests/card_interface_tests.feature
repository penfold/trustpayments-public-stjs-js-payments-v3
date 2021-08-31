Feature: Visual regression - E2E Card Payments
  As a user
  I want to use card payments method
  In order to check full payment functionality

  Background:
    Given JS library configured by inline params VISUAL_BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens minimal.html page with inline param


  @visual_regression @scrn_card_interface_error_invalid_patterns @STJS-1709_visual_regression_IE
  Scenario: scenariusz testowy 3
    And User waits for whole form to be displayed
    When User fills payment form with defined card MASTERCARD_INVALID_PATTERN_CARD
    And User focuses on "EXPIRATION_DATE" field
    And User focuses on "SECURITY_CODE" field
    And User clicks Pay button
    And User focuses on the page title
    Then Screenshot is taken after 6 seconds and checked
