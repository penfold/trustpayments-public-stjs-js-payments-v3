Feature: Visual regression - acs pop up


  @visual_regression @scrn_card_interface_acs_popup @STJS-1709_visual_regression_styling_IE
  Scenario: ACS pop-up display
    Given JS library configured by inline params VALIDATION_STYLES_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens minimal.html page with inline param
    And User waits for whole form to be displayed
    When User fills payment form with defined card MASTERCARD_NON_FRICTIONLESS
    And User clicks Pay button
    Then Screenshot is taken after 6 seconds and checked
