Feature: Successful payments with various configurations

  As a user
  I want to use card payments method
  In order to check full payment functionality

  Background:
    Given JavaScript configuration is set for scenario based on scenario's @config tag

  @base_config @<tag>
  Scenario Outline: Successful payment using most popular Credit Cards: <card_type>
    Given User opens mock payment page
    And User waits for form inputs to be loaded
    And User waits for Pay button to be active
    When User fills payment form with credit card number "<card_number>", expiration date "<expiration_date>" and cvv "<cvv>"
    And Frictionless THREEDQUERY, AUTH response is set to OK
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And Frictionless AUTH and THREEDQUERY requests were sent only once with correct data

    Examples:
      | card_number      | expiration_date | cvv  | card_type  | tag             |
      | 4111110000000211 | 12/22           | 123  | VISA       | smoke_mock_test |
      | 5100000000000511 | 12/22           | 123  | MASTERCARD |                 |
      | 340000000000611  | 12/22           | 1234 | AMEX       |                 |

  @base_config
  Scenario: Successful payment with updated JWT
    Given User opens mock payment page WITH_UPDATE_JWT
      | jwtName          |
      | BASE_UPDATED_JWT |
    And User waits for form inputs to be loaded
    And User waits for Pay button to be active
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User calls updateJWT function by filling amount field
    And THREEDQUERY mock response is set to "ENROLLED_Y"
    And ACS mock response is set to "OK"
    And User clicks Pay button - AUTH response is set to "OK"
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And AUTH and THREEDQUERY requests were sent only once with correct data
    And JSINIT requests contains updated jwt

  @base_config
  Scenario: Successful payment
    Given User opens mock payment page
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And THREEDQUERY mock response is set to "ENROLLED_Y"
    And ACS mock response is set to "OK"
    And User clicks Pay button - AUTH response is set to "OK"
    Then User will see notification frame text: "Payment has been successfully processed"
    Then JSINIT request was sent only once
    And AUTH and THREEDQUERY requests were sent only once with correct data

  @config_submit_cvv_only
  @submit_cvv_only
  Scenario: Successful payment when cvv field is selected to submit
    Given User opens mock payment page
    When User fills "SECURITY_CODE" field "123"
    And THREEDQUERY, AUTH mock response is set to OK
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will not see form field CARD_NUMBER
    And User will not see form field EXPIRATION_DATE
    And THREEDQUERY, AUTH ware sent only once in one request

  @config_submit_cvv_for_amex
  @submit_cvv_only
  Scenario: Successful payment by AMEX when cvv field is selected to submit
    Given User opens mock payment page
    When User fills "SECURITY_CODE" field "1234"
    And THREEDQUERY, AUTH mock response is set to OK
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will not see form field CARD_NUMBER
    And User will not see form field EXPIRATION_DATE
    And THREEDQUERY, AUTH ware sent only once in one request

  @config_cvvToSubmit_and_submitOnSuccess
  @submit_cvv_only
  Scenario: Successful payment with fieldToSubmit and submitOnSuccess
    Given User opens mock payment page
    When User fills "SECURITY_CODE" field "123"
    And THREEDQUERY mock response is set to "ENROLLED_Y"
    And ACS mock response is set to "OK"
    And User clicks Pay button - AUTH response is set to "OK"
    Then User will be sent to page with url "www.example.com" having params
      | key           | value                                   |
      | errormessage  | Payment has been successfully processed |
      | baseamount    | 1000                                    |
      | currencyiso3a | GBP                                     |
      | errorcode     | 0                                       |
    And THREEDQUERY, AUTH ware sent only once in one request

  @config_skip_jsinit
  Scenario: Successful payment with skipped JSINIT process
    Given User opens mock payment page
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And THREEDQUERY mock response is set to "ENROLLED_Y"
    And ACS mock response is set to "OK"
    And User clicks Pay button - AUTH response is set to "OK"
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And AUTH and THREEDQUERY requests were sent only once with correct data
