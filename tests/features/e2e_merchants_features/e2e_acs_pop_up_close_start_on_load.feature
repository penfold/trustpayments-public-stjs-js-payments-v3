@merchant_feature_close_3ds_pop_up
Feature: Close ACS pop-up (3DS modal) with start on load
  As a merchant
  I should be able to close the popup (from code))
  In the case when the st.js token expired


  Scenario: Close 3ds pop up for startOnLoad payment
    Given JS library configured by inline params START_ON_LOAD_CONFIG and jwt JWT_WITH_NON_FRICTIONLESS_CARD with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page WITHOUT_SUBMIT_BUTTON
    And User toggle action buttons bar
    And User see V2 authentication modal is displayed
    When User clicks cancel 3ds action button
    Then User will see payment status information: "An error occurred"
    And User will see that notification frame has "red" color
    And "submit" callback is called only once
    And "error" callback is called only once
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: False
