Feature: Successful payments with various configurations

  As a user
  I want to use card payments method
  In order to check full payment functionality

  @<tag>
  Scenario Outline: Successful payment using most popular Credit Cards: <card_type>
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And Frictionless card payment mock responses are set as BASE_JSINIT and payment status SUCCESS
    And User opens example page
    And User waits for form inputs to be loaded
    And User waits for Pay button to be active
    When User fills payment form with credit card number "<card_number>", expiration date "<expiration_date>" and cvv "<cvv>"
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And Frictionless AUTH and THREEDQUERY requests were sent only once with correct data

    Examples:
      | card_number      | expiration_date | cvv  | card_type  | tag             |
      | 4111110000000211 | 12/22           | 123  | VISA       | smoke_mock_test |
      | 5100000000000511 | 12/22           | 123  | MASTERCARD |                 |
      | 340000000000611  | 12/22           | 1234 | AMEX       |                 |


  Scenario: Successful payment with updated JWT
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And Challenge card payment mock responses are set as JSINIT_UPDATED_JWT and payment status SUCCESS
    And ACS mock response is set to "OK"
    And User opens page WITH_UPDATE_JWT and jwt BASE_UPDATED_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User waits for form inputs to be loaded
    And User waits for Pay button to be active
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User calls updateJWT function by filling amount field
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And AUTH and THREEDQUERY requests were sent only once with correct data
    And JSINIT requests contains updated jwt


  Scenario: Successful payment
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And Challenge card payment mock responses are set as BASE_JSINIT and payment status SUCCESS
    And ACS mock response is set to "OK"
    And User opens example page
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    Then JSINIT request was sent only once
    And AUTH and THREEDQUERY requests were sent only once with correct data

  @submit_cvv_only
  Scenario: Successful payment when cvv field is selected to submit
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key            | value        |
      | fieldsToSubmit | securitycode |
    And JS library authenticated by jwt JWT_VISA_FRICTIONLESS_PARENT_TRANSACTION with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And Frictionless card payment mock responses are set as BASE_JSINIT and payment status SUCCESS
    And User opens example page
    When User fills "SECURITY_CODE" field "123"
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will not see form field CARD_NUMBER
    And User will not see form field EXPIRATION_DATE
    And THREEDQUERY, AUTH ware sent only once in one request

  @submit_cvv_only
  Scenario: Successful payment by AMEX when cvv field is selected to submit
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key            | value        |
      | fieldsToSubmit | securitycode |
    And JS library authenticated by jwt JWT_AMEX_NON_FRICTIONLESS_PARENT_TRANSACTION with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And Frictionless card payment mock responses are set as JSINIT_TOKENISATION_AMEX and payment status SUCCESS
    And User opens example page
    When User fills "SECURITY_CODE" field "1234"
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will not see form field CARD_NUMBER
    And User will not see form field EXPIRATION_DATE
    And THREEDQUERY, AUTH ware sent only once in one request

  @submit_cvv_only
  Scenario: Successful payment with fieldToSubmit and submitOnSuccess
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key             | value        |
      | submitOnSuccess | true         |
      | fieldsToSubmit  | securitycode |
    And JS library authenticated by jwt JWT_VISA_FRICTIONLESS_PARENT_TRANSACTION with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And Challenge card payment mock responses are set as JSINIT_TOKENISATION_VISA and payment status SUCCESS
    And User opens example page
    When User fills "SECURITY_CODE" field "123"
    And ACS mock response is set to "OK"
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key           | value                                   |
      | errormessage  | Payment has been successfully processed |
      | baseamount    | 1000                                    |
      | currencyiso3a | GBP                                     |
      | errorcode     | 0                                       |
    And THREEDQUERY, AUTH ware sent only once in one request
