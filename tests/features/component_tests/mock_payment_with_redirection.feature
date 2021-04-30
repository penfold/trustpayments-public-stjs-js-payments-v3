Feature: payment flow with redirect

  As a user
  I want to use card payments method with redirect config
  In order to check if user is redirected or not after submit form action with success or error result

  Background:
    Given JavaScript configuration is set for scenario based on scenario's @config tag
    And User opens mock payment page

  @config_default @smoke_component_test
  Scenario: Cardinal Commerce - successful payment - checking that 'submitOnSuccess' is enabled by default
    And User waits for whole form to be loaded
    And User waits for Pay button to be active
    When User fills merchant data with name "John Test", email "test@example", phone "44422224444"
    And User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And THREEDQUERY mock response is set to "ENROLLED_Y"
    And ACS mock response is set to "OK"
    And User clicks Pay button - AUTH response is set to "OK"
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | 1000                                    |
      | currencyiso3a        | GBP                                     |
      | errorcode            | 0                                       |
      | myBillName           | John Test                               |
      | myBillEmail          | test@example                            |
      | myBillTel            | 44422224444                             |
      | status               | Y                                       |
      | transactionreference | should not be none                      |
      | eci                  | 05                                      |
      | enrolled             | Y                                       |
      | settlestatus         | 0                                       |
      | jwt                  | should not be none                      |
    And AUTH and THREEDQUERY requests were sent only once with correct data

  @config_requestTypes_tdq_submit_on_error
  Scenario: Cardinal Commerce - invalid payment with request types: THREEDQUERY and submitOnError
    When Single THREEDQUERY mock response is set to "INVALID_ACQUIRER"
    And User fills merchant data with name "John Test", email "test@example", phone "44422224444"
    And Single THREEDQUERY mock response is set to "INVALID_ACQUIRER"
    And User fills payment form with credit card number "4111110000000211", expiration date "12/30" and cvv "123"
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key          | value                           |
      | errormessage | Invalid acquirer for 3-D Secure |
      | errorcode    | 60031                           |
      | jwt          | should not be none              |
      | myBillName   | John Test                       |
      | myBillEmail  | test@example                    |
      | myBillTel    | 44422224444                     |
    And Single THREEDQUERY request was sent only once with correct data

  @config_submit_on_error_true @smoke_component_test
  Scenario: Cardinal Commerce - error payment with enabled 'submit on error' process
    And User waits for whole form to be loaded
    And User waits for Pay button to be active
    When User fills merchant data with name "John Test", email "test@example", phone "44422224444"
    And User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And THREEDQUERY mock response is set to "ENROLLED_Y"
    And ACS mock response is set to "OK"
    And User clicks Pay button - AUTH response is set to "DECLINE"
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value              |
      | errormessage         | Decline            |
      | baseamount           | 70000              |
      | currencyiso3a        | GBP                |
      | errorcode            | 70000              |
      | myBillName           | John Test          |
      | status               | Y                  |
      | transactionreference | should not be none |
      | eci                  | 05                 |
      | enrolled             | Y                  |
      | settlestatus         | 3                  |
      | jwt                  | should not be none |
    And AUTH and THREEDQUERY requests were sent only once with correct data

  @config_submit_on_error_false
  Scenario: Cardinal Commerce - error payment with disabled 'submit on error' process
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And THREEDQUERY mock response is set to "ENROLLED_Y"
    And ACS mock response is set to "OK"
    And User clicks Pay button - AUTH response is set to "DECLINE"
    Then User remains on checkout page
    And User will see payment status information: "Decline"
    And User will see that notification frame has "red" color
    And AUTH and THREEDQUERY requests were sent only once with correct data

  @config_submit_on_success_true @smoke_component_test
  Scenario: Cardinal Commerce - successful payment with enabled 'submit on success' process
    And User waits for whole form to be loaded
    When User fills payment form with defined card MASTERCARD_SUCCESSFUL_FRICTIONLESS_AUTH
    And THREEDQUERY, AUTH mock response is set to OK
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | 1000                                    |
      | currencyiso3a        | GBP                                     |
      | errorcode            | 0                                       |
      | status               | Y                                       |
      | transactionreference | should not be none                      |
      | eci                  | 02                                      |
      | enrolled             | Y                                       |
      | settlestatus         | 0                                       |
      | jwt                  | should not be none                      |
    And Frictionless AUTH and THREEDQUERY requests were sent only once with correct data
