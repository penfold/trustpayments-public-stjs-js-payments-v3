Feature: Notification frame
  As a user
  I want to use card payments method
  In order to check notification frame after payment

  Scenario: Notification frame is not displayed after payment
    Given JS library configured by inline params DISABLE_NOTIFICATION_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    And User clicks Pay button
    Then User will not see notification frame

  Scenario Outline: Notification frame is not displayed after payment with submitOn<submitOn>
    Given JS library configured by inline params SUBMIT_ON_SUCCESS_ERROR_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
      | baseamount              | <amount>         |
    And User opens example page
    When User fills payment form with defined card VISA_V21_FRICTIONLESS
    And User clicks Pay button
    Then User will not see notification frame

    Examples:
      | submitOn | amount |
      | Success  | 1000   |
      | Error    | 70000  |

  Scenario: Notification frame is not displayed after payment
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User fills payment form with defined card VISA_V21_FAILED_FRICTIONLESS_AUTH
    And User clicks Pay button
    Then User will see payment status information: "Unauthenticated"
    And User will see that notification frame has "red" color
    And User waits for payment status to disappear
    When User clears form
    And User fills payment form with defined card VISA_V21_FRICTIONLESS
    And User clicks Pay button
    And User waits for payment to be processed
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
