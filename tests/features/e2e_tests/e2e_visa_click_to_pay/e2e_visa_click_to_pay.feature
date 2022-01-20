Feature: As a User I would like to be able to
  pay with Visa click to pay


Scenario: button placement configuration override
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline VisaC2P config VC2P_BUTTON_PLACEMENT_CONFIG
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value     |
      | requesttypedescriptions | AUTH      |
    When User opens example page WITH_VC2P
    And User waits for Pay button to be active
    Then User see that visa button is displayed in place defined in config
