Feature: E2E Card Payments with updated jwt

  As a user
  I want to use card payments method
  In order to check full payment functionality with updated jwt

  @e2e_smoke_test
  Scenario: Successful payment with updated jwt
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page WITH_UPDATE_JWT
      | jwtName          |
      | BASE_UPDATED_JWT |
    When User calls updateJWT function by filling amount field
    And User fills payment form with defined card MASTERCARD_CARD
    And User clicks Pay button
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color

  Scenario: Successful payment with updated jwt and without locale param
    Given JS library configured by inline params BASIC_CONFIG and jwt JWT_WITHOUT_LOCALE with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page WITH_UPDATE_JWT
      | jwtName                                            |
      | JWT_WITHOUT_LOCALE_AND_UPDATED_AMOUNT_AND_CURRENCY |
    When User calls updateJWT function by filling amount field
    And User fills payment form with defined card MASTERCARD_CARD
    And User clicks Pay button
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And "submit" callback is called only once
    And "success" callback is called only once

  @e2e_smoke_test
  @update_jwt_test
  Scenario: Successful payment with updated jwt without locale param and submit on success config
    Given JS library configured by inline params SUBMIT_ON_SUCCESS_CONFIG and jwt JWT_WITHOUT_LOCALE with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page WITH_UPDATE_JWT
      | jwtName                                            |
      | JWT_WITHOUT_LOCALE_AND_UPDATED_AMOUNT_AND_CURRENCY |
    When User calls updateJWT function by filling amount field
    And User fills payment form with defined card MASTERCARD_CARD
    And User clicks Pay button
    Then User will not see notification frame
    And User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | 2000                                    |
      | currencyiso3a        | EUR                                     |
      | errorcode            | 0                                       |
      | transactionreference | should not be none                      |
      | eci                  | 00                                      |
      | enrolled             | U                                       |
      | settlestatus         | 0                                       |
      | jwt                  | should not be none                      |
