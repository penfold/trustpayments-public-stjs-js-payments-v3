Feature: E2E second payment

  @e2e_smoke_test
  Scenario: Successful payment after form validation
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User clicks Pay button
    And User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    And User fills V2 authentication modal
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color


   @STJS-1336
   Scenario: retry payment - all request types should be performed in second payment
    Given JS library configured by inline params DEFER_INIT_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
      | baseamount              | 14492            |
    And User opens example page
    When User fills payment form with defined card VISA_V22_NON_FRICTIONLESS
    And User clicks Pay button
    And User fills V2 authentication modal
    Then User will see payment status information: "Invalid process"
    And Wait for notification frame to disappear
    When User clicks Pay button
    And User fills V2 authentication modal
    Then User will see payment status information: "Invalid process"

    Scenario: Failed Frictionless Authentication in second payment
    Given JS library configured by inline params DEFER_INIT_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User fills payment form with defined card VISA_V21_FAILED_FRICTIONLESS_AUTH
    And User clicks Pay button
    Then User will see payment status information: "Unauthenticated"
    And Wait for notification frame to disappear
    And User clicks Pay button
    And User will see payment status information: "Unauthenticated"
    And User will see that notification frame has "red" color
