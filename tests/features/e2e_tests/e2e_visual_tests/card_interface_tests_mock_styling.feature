Feature: Visual regression - E2E Card Payments
  As a user
  I want to use card payments method
  In order to check full payment functionality


  @visual_regression_styling_safari @scrn_card_interface_after_successful_payment_styling
  Scenario: Card interface after successful payment
    Given JS library configured by inline params VISUAL_BASIC_WITH_STYLES_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
      | locale                  | de_DE            |
    And Frictionless card payment mock responses are set as BASE_JSINIT and payment status SUCCESS
    And User opens minimal.html page with inline param
    And User waits for whole form to be displayed
    When User fills payment form with defined card MASTERCARD_FIXED_EXP_DATE_CARD
    And User clicks Pay button
    And Wait for notification frame
    And User focuses on the page title
    Then Screenshot is taken after 0 seconds and checked

  @visual_regression_styling_safari @scrn_card_interface_before_payment_styling
  Scenario: Card interface before payment
    Given JS library configured by inline params VISUAL_BASIC_WITH_STYLES_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
      | locale                  | de_DE            |
    And Frictionless card payment mock responses are set as BASE_JSINIT and payment status SUCCESS
    And User opens minimal.html page with inline param
    And User waits for whole form to be displayed
    When User focuses on the page title
    Then Screenshot is taken after 1 seconds and checked

  @visual_regression_styling_safari @scrn_card_interface_error_expiry_date_styling
  Scenario: Card interface after unsuccessful payment - invalid expiration date
    Given JS library configured by inline params VISUAL_BASIC_WITH_STYLES_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
      | locale                  | de_DE            |
    And Frictionless card payment mock responses are set as BASE_JSINIT and payment status SUCCESS
    And User opens minimal.html page with inline param
    And User waits for whole form to be displayed
    When User fills payment form with defined card MASTERCARD_INVALID_EXP_DATE_CARD
    And InvalidField response set for "EXPIRATION_DATE"
    And User clicks Pay button
    And Wait for notification frame
    And User focuses on the page title
    Then Screenshot is taken after 6 seconds and checked

  @visual_regression_styling_safari @scrn_card_interface_error_invalid_patterns_styling
  Scenario: Card interface before payment - invalid pattern data
    Given JS library configured by inline params VISUAL_BASIC_WITH_STYLES_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
      | locale                  | de_DE            |
    And Frictionless card payment mock responses are set as BASE_JSINIT and payment status SUCCESS
    And User opens minimal.html page with inline param
    And User waits for whole form to be displayed
    When User fills payment form with defined card MASTERCARD_INVALID_PATTERN_CARD
    And User clicks Pay button
    And User focuses on the page title
    Then Screenshot is taken after 6 seconds and checked

  @visual_regression_styling_safari @scrn_card_interface_with_validation_styling
  Scenario: Card interface with validation styling
    Given JS library configured by inline params VALIDATION_STYLES_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
      | locale                  | de_DE            |
    And Frictionless card payment mock responses are set as BASE_JSINIT and payment status SUCCESS
    And User opens minimal.html page with inline param
    And User waits for whole form to be displayed
    When User fills only security code for saved MASTERCARD_INVALID_CVV_CARD card
    And User focuses on "ANIMATED_CARD" field
    And User focuses on the page title
    Then Screenshot is taken after 6 seconds and checked
