Feature: E2E for buttonID
  As a user
  I want to use config with button id
  In order to check payment

  Scenario: Successful payment by clicking on the main submit button
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page WITH_ADDITIONAL_BUTTON
    And User waits for Pay button to be active
    And User will see that Pay button is "enabled"
    And User will see that additional Submit button is "enabled"
    When User fills payment form with defined card MASTERCARD_SUCCESSFUL_AUTH_CARD
    And User clicks Pay button
    And User fills V1 authentication modal
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |
    And User will see that Pay button is "disabled"
    And User will see that additional Submit button is "enabled"
    And User will see that ALL input fields are "disabled"

  Scenario: Successful payment by clicking on additional button connected by 'buttonID' property
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key      | value             |
      | buttonId | additional-button |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page WITH_ADDITIONAL_BUTTON
    And User waits for form inputs to be loaded
    And User waits for additional Submit button to be active
    And User will see that Pay button is "disabled"
    And User will see that additional Submit button is "enabled"
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Additional button
    And User fills V2 authentication modal
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |
    And User will see that Pay button is "disabled"
    And User will see that additional Submit button is "disabled"
    And User will see that ALL input fields are "disabled"

  Scenario: Unsuccessful payment by clicking on additional button not connected by 'buttonID' property
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page WITH_ADDITIONAL_BUTTON
    And User waits for Pay button to be active
    When User fills payment form with defined card MASTERCARD_CARD
    And User will see that Pay button is "enabled"
    And User will see that additional Submit button is "enabled"
    And User clicks Additional button
    Then User will not see notification frame
    And User will see that Pay button is "enabled"
    And User will see that additional Submit button is "enabled"
    And User will see that ALL input fields are "enabled"
