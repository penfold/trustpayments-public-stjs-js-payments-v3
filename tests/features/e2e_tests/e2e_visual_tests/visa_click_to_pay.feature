Feature: Visual regression - Visa Click to Pay

  @scrn_vc2p_button @visual_regression
  Scenario: display Visa Click to Pay button
    Given JS library configured by inline config VISUAL_BASIC_CONFIG
    And JS library configured by inline VisaC2P config BASIC_CONFIG_VC2P
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                        |
      | requesttypedescriptions | AUTH                         |
    And User opens minimal.html page with VC2P inline params
    And User waits for whole form to be displayed
    And User waits for Pay button to be active
    Then Screenshot is taken after 1 seconds and checked
