@merchant_feature_close_3ds_pop_up
Feature: Close ACS pop-up (3DS modal)
  As a merchant
  I should be able to close the popup (from code))
  In the case when the st.js token expired

  @e2e_smoke_test
  Scenario: Close 3ds pop up for NON_FRICTIONLESS card
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    And User toggle action buttons bar
    And User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    And User see V2 authentication modal is displayed
    When User clicks cancel 3ds action button
    Then User will see payment status information: "An error occurred"
    And User will see that notification frame has "red" color
    And "submit" callback is called only once
    And "error" callback is called only once
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: False
    And User will see that Submit button is "enabled" after payment
    And User will see that ALL input fields are "enabled"
