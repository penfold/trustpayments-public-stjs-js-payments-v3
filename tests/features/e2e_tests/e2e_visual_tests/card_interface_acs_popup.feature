Feature: Visual regression - acs pop up
  As a user
  I want to see ACS pop-up
  If I use non-frictionless card

  @visual_regression @STJS-1709_visual_regression_IE @scrn_card_interface_acs_popup
  Scenario: ACS pop-up display
    Given JS library configured by inline params VISUAL_BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value       |
      | requesttypedescriptions | THREEDQUERY |
    And User opens minimal.html page with inline param
    And User waits for whole form to be displayed
    When User fills payment form with defined card MASTERCARD_NON_FRICTIONLESS
    And User clicks Pay button
    Then Screenshot is taken after 6 seconds and checked
