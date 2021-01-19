@moto_payment
Feature: E2E MOTO Payments
  As a user
  I want to use MOTO payments method
  In order to check payment is processed


  Scenario Outline: Successful MOTO payment with requestTypes: AUTH - Notification message check
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value |
      | accounttypedescription  | MOTO  |
      | requesttypedescriptions | AUTH  |
    And User opens example page
    When User fills payment form with defined card <CARD>
    And User clicks Pay button
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And "submit" callback is called only once
    And "success" callback is called only once

    Examples:
      | CARD                  |
      | VISA_FRICTIONLESS     |
      | VISA_NON_FRICTIONLESS |
      | MASTERCARD_CARD       |


  Scenario Outline: Successful MOTO payment with requestTypes: AUTH - validation url params after redirect
    Given JS library configured by inline params SUBMIT_ON_SUCCESS_ONLY_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value |
      | accounttypedescription  | MOTO  |
      | requesttypedescriptions | AUTH  |
    And User opens example page
    When User fills payment form with defined card <CARD>
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | 1000                                    |
      | currencyiso3a        | GBP                                     |
      | errorcode            | 0                                       |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | settlestatus         | 0                                       |
      | threedresponse       | should be none                          |

    Examples:
      | CARD                  |
      | VISA_FRICTIONLESS     |
      | VISA_NON_FRICTIONLESS |
      | MASTERCARD_CARD       |
