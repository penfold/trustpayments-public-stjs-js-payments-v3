Feature: Visual regression - apm buttons list
  As a user
  I want to see apms payments options
  To make sure they are displayed properly

  @scrn_apm_interface_payment_method @visual_regression @visual_regression_safari @1
  Scenario: display list of APM's buttons
    Given JS library configured by inline config VISUAL_BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens minimal.html page with inline params
    And User waits for whole form to be displayed
    And User waits for Pay button to be active
    When User focuses on APM payment methods section
    Then Screenshot is taken after 3 seconds and checked
