Feature: E2E for buttonID
  As a user
  I want to use config with button id
  In order to check payment

  @e2e_button_id_config
  Scenario: Successful Authentication
    Given JS library configured by inline params BUTTON_ID_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value                         |
      | requesttypedescriptions | THREEDQUERY AUTH              |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_SUCCESSFUL_AUTH_CARD
    And User clicks Pay button
    And User fills V1 authentication modal
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And User will see that Submit button is "disabled" after payment
    And User will see that ALL input fields are "disabled"
