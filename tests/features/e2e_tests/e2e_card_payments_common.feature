Feature: Card Payments
  As a user
  I want to use card payments method
  In order to check full payment functionality

  Scenario Outline: Payment form accessibility after <payment> payment process
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User fills payment form with defined card <card_number>
    And User clicks Pay button
    And User waits for payment to be processed
    Then User will see that Submit button is "<form_status>"
    And User will see that ALL input fields are "<form_status>"

    Examples:
      | payment    | form_status | card_number        |
      | successful | disabled    | VISA_CARD          |
      | invalid    | enabled     | VISA_DECLINED_CARD |

  Scenario: Payment form with incorrect request type description
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value                  |
      | requesttypedescriptions | INCORRECT_REQUEST_TYPE |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_SUCCESSFUL_FRICTIONLESS_AUTH
    And User clicks Pay button
    Then User will see payment status information: "An error occurred"

  Scenario: Security code disabled if server error on PIBA
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
      | baseamount              | 70000            |
    And User opens example page
    When User fills payment form with credit card number "3089500000000000021", expiration date "12/23"
    And User clicks Pay button
    Then User will see payment status information: "Decline"
    And User will see that SECURITY_CODE input field is "disabled"
