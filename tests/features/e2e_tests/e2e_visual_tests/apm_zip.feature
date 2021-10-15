##@STJS-2437 - Tests automation task for Zip

Feature: Visual regression - zip payment method
  As a user
  I want to see ZIP payment
  If I use alternative payment method

  @scrn_card_interface_zip_payment_method @visual_regression @visual_regression_safari
  Scenario: ZIP display in list of APM's
    Given JS library configured by inline config VISUAL_BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens minimal.html page with inline params
    And User waits for whole form to be displayed
    And User waits for Pay button to be active
    When User focuses on ZIP payment method
    Then Screenshot is taken after 1 seconds and checked
