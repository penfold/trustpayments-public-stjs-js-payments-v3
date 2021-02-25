@merchant_feature_close_3ds_pop_up
Feature: Close ACS pop-up (3DS modal) with update jwt
  As a merchant
  I should be able to close the popup (from code))
  In the case when the st.js token expired


  Scenario: Close 3ds pop up and retry payment with updated jwt and NON_FRICTIONLESS card
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page WITH_UPDATE_JWT
      | jwtName          |
      | BASE_UPDATED_JWT |
    And User toggle action buttons bar
    And User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    And User see V2 authentication modal is displayed
    And User clicks cancel 3ds action button
    And User will see payment status information: "An error occurred"
    And Wait for notification frame to disappear
    And User calls updateJWT function by filling amount field
    And User toggle action buttons bar
    When User clicks Pay button
    And User fills V2 authentication modal
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color


  Scenario: Close 3ds pop up and retry payment with updated jwt and FRICTIONLESS card
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page WITH_UPDATE_JWT
      | jwtName          |
      | BASE_UPDATED_JWT |
    And User toggle action buttons bar
    And User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    And User see V2 authentication modal is displayed
    And User clicks cancel 3ds action button
    And User will see payment status information: "An error occurred"
    And Wait for notification frame to disappear
    And User calls updateJWT function by filling amount field
    And User re-fills payment form with defined card MASTERCARD_FRICTIONLESS
    And User toggle action buttons bar
    When User clicks Pay button
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
