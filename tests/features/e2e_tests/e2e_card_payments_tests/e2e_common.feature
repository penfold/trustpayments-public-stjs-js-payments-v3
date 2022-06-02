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
    And Wait for notification frame
    Then User will see that Pay button is "<form_status>"
    And User will see that ALL input fields are "<form_status>"

    Examples:
      | form_status | card_number        |
      | disabled    | VISA_CARD          |
      | enabled     | VISA_DECLINED_CARD |

  Scenario: Payment form with incorrect request type description
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value                  |
      | requesttypedescriptions | INCORRECT_REQUEST_TYPE |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_SUCCESSFUL_FRICTIONLESS_AUTH
    And User clicks Pay button
    Then User will see notification frame text: "An error occurred"
