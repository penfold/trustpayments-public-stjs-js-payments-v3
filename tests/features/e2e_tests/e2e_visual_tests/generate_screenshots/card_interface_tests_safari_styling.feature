Feature: Visual regression - E2E Card Payments
  As a user
  I want to use card payments method
  In order to check full payment functionality

  #feature just for screenshot creation purposes (e.g. when you need to create them again)

  Background:
    Given JavaScript configuration is set for scenario based on scenario's @config tag
    And User opens mock payment page MINIMAL_HTML
    And User changes minimal example page language to "de_DE"


  @base_config_validation_styling @visual_regression_styling_generation_safari @scrn_card_interface_with_validation_styling
  Scenario: scanriusz testowy 2
    When User fills payment form with defined card MASTERCARD_INVALID_EXP_DATE_CARD
    And User focuses on "EXPIRATION_DATE" field
    Then Make screenshot after 6 seconds

