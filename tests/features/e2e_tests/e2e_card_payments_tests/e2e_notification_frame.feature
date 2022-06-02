Feature: Notification frame
  As a user
  I want to use card payments method
  In order to check notification frame after payment

  Scenario: Disabled Notification frame is not displayed after payment
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key                 | value |
      | disableNotification | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    And User clicks Pay button
    Then User will not see notification frame

  Scenario Outline: Notification frame is not displayed after payment with submitOn<submitOn>
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key             | value |
      | submitOnSuccess | true  |
      | submitOnError   | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
      | baseamount              | <amount>         |
    And User opens example page
    When User fills payment form with defined card VISA_V21_FRICTIONLESS
    And User clicks Pay button
    Then User will not see notification frame

    Examples:
      | amount |
      | 1000   |
      | 70000  |

  Scenario: Notification frame is displayed after payment
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User fills payment form with defined card VISA_V21_FAILED_FRICTIONLESS_AUTH
    And User clicks Pay button
    Then User will see notification frame text: "Unauthenticated"
    And User will see that notification frame has "red" color
    And User waits for notification frame to disappear
    When User clears form
    And User fills payment form with defined card VISA_V21_FRICTIONLESS
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
