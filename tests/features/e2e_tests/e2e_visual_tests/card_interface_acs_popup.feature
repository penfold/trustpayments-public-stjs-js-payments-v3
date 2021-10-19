Feature: Visual regression - acs pop up
  As a user
  I want to see ACS pop-up
  If I use non-frictionless card

  @visual_acs_popup_regression @scrn_card_interface_acs_popup
  Scenario: ACS pop-up display for V2
    Given JS library configured by inline params VISUAL_BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens minimal.html page with inline param
    And User waits for whole form to be displayed
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    And User focus on the acs V2 popup element
    Then Screenshot is taken after 8 seconds and checked
