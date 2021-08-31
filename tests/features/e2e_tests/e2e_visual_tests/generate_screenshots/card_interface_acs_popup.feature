Feature: Visual regression - acs pop up
  As a user
  I want to see ACS pop-up
  If I use non-frictionless card

  #feature just for screenshot creation purposes (e.g. when you need to create them again)

  @visual_regression_generation @scrn_card_interface_acs_popup
  Scenario: ACS pop-up display
    Given JS library configured by inline params VISUAL_BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    And User waits for whole form to be displayed
    When User fills payment form with defined card MASTERCARD_NON_FRICTIONLESS
    And User clicks Pay button
    And User focus on the acs popup element
    Then Make screenshot after 6 seconds
