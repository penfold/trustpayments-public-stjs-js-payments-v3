Feature: Visual regression - acs pop up

  #feature just for screenshot creation purposes (e.g. when you need to create them again)

  @visual_regression_generation @scrn_card_interface_acs_popup @STJS-1709_visual_regression_styling_IE
  Scenario: ACS pop-up display
    Given JS library configured by inline params VISUAL_BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens minimal.html page with inline param
    And User waits for whole form to be displayed
    When User fills payment form with defined card MASTERCARD_NON_FRICTIONLESS
    And User clicks Pay button
    Then Make screenshot after 6 seconds
