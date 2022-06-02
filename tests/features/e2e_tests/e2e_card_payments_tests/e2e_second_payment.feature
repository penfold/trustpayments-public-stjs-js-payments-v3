Feature: E2E second payment


  Scenario: Successful payment after form validation
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User clicks Pay button
    And User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    And User fills V2 authentication modal
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: False

  @STJS-1336
  Scenario: retry payment - all request types should be performed in second payment
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
      | baseamount              | 60010            |
    And User opens example page
    When User fills payment form with defined card VISA_V22_NON_FRICTIONLESS
    And User clicks Pay button
    And User fills V2 authentication modal
    Then User will see notification frame text: "Bank System Error"
    And User waits for notification frame to disappear
    And Wait for popups to disappear
    When User clicks Pay button
    And User fills V2 authentication modal
    Then User will see notification frame text: "Bank System Error"
    And "submit" callback is called only once in second payment
    And "error" callback is called only once in second payment
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: False


  Scenario: Failed Frictionless Authentication in second payment
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User fills payment form with defined card VISA_V21_FAILED_FRICTIONLESS_AUTH
    And User clicks Pay button
    Then User will see notification frame text: "Unauthenticated"
    And User waits for notification frame to disappear
    And Wait for popups to disappear
    And User clicks Pay button
    And User will see notification frame text: "Unauthenticated"
    And User will see that notification frame has "red" color
    And "submit" callback is called only once in second payment
    And "error" callback is called only once in second payment
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: False


  Scenario: startOnLoad retry payment - successful second payment after error
    Given JS library configured by inline params START_ON_LOAD_CONFIG and jwt JWT_FAILED_NON_FRICTIONLESS_CARD with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens page WITH_UPDATE_JWT and jwt BASE_UPDATED_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User fills V2 authentication modal
    Then User will see notification frame text: "An error occurred"
    And User waits for notification frame to disappear
    And Wait for popups to disappear
    When User calls updateJWT function by filling amount field
    And User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    And User fills V2 authentication modal
    Then User will see notification frame text: "Payment has been successfully processed"
    And "submit" callback is called only once in second payment
    And User will see following callback type called only once
      | callback_type |
      | success       |
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: False
