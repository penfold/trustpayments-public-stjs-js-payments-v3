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

  Scenario: Checking request types validation
    Given JS library configured by inline params INCORRECT_REQUEST_TYPE_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    Then User will see that application is not fully loaded
