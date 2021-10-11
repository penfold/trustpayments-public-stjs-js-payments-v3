Feature: Visual regression - zip payment method
  As a user
  I want to see ZIP payment
  If I use alternative payment method

  @scrn_card_interface_zip_payment_method @visual_regression @visual_regression_safari
  Scenario: ZIP display in list of APM's
    Given JS library configured by inline params VISUAL_BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    And User waits for whole form to be displayed
    And User waits for Pay button to be active
    When User focuses on ZIP payment method
    Then Screenshot is taken after 1 seconds and checked
