Feature: E2E Card Payments with updated jwt

  As a user
  I want to use card payments method
  In order to check full payment functionality with updated jwt


  Scenario: Successful payment with updated jwt
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens page WITH_UPDATE_JWT and jwt BASE_UPDATED_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    When User calls updateJWT function by filling amount field
    And User fills payment form with defined card MASTERCARD_CARD
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color

  Scenario: Successful payment with updated jwt and without locale param
    Given JS library configured by inline params BASIC_CONFIG and jwt JWT_WITHOUT_LOCALE with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens page WITH_UPDATE_JWT and jwt JWT_WITHOUT_LOCALE_AND_UPDATED_AMOUNT_AND_CURRENCY with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    When User calls updateJWT function by filling amount field
    And User fills payment form with defined card MASTERCARD_CARD
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |


  Scenario: Successful payment with updated jwt without locale param and submit on success config
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key             | value |
      | submitOnSuccess | true  |
    And JS library authenticated by jwt JWT_WITHOUT_LOCALE with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens page WITH_UPDATE_JWT and jwt JWT_WITHOUT_LOCALE_AND_UPDATED_AMOUNT_AND_CURRENCY with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
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
