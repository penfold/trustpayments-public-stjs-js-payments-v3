# Created by amiendlarzewski at 12.04.2022
Feature: Tokenized payments tests
  As a user
  I want to use tokenized jwt payments method
  In order to fasten my payment process


  Scenario: Successful payment - tokenized Visa Frictionless card
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
      | credentialsonfile       | 1                |
    And JS library configured with Tokenized Card BASE_JWT with additional attributes
      | key                        | value            |
      | requesttypedescriptions    | THREEDQUERY AUTH |
      | credentialsonfile          | 2                |
      | parenttransactionreference | 56-9-2255170     |
    And User opens example page WITH_TOKENIZED_CARD
    And User waits for Tokenized Card payment to be loaded
    And User waits for Pay button to be active
    When User fills Tokenized Card payment security code with 123
    And User clicks Pay button on Tokenized Card payment form
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |
    And User will see that Pay button is "disabled"
    And User will see that ALL input fields are "disabled"
    And User will see that TOKENIZED_SECURITY_CODE input fields are "disabled"
    And User will see that TOKENIZED_SUBMIT_BUTTON input fields are "disabled"

  Scenario: Cancel payment - tokenized tokenized Visa Non-Frictionless card
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
      | credentialsonfile       | 1                |
    And JS library configured with Tokenized Card BASE_JWT with additional attributes
      | key                        | value            |
      | requesttypedescriptions    | THREEDQUERY AUTH |
      | credentialsonfile          | 2                |
      | parenttransactionreference | 57-9-2278379     |
    And User opens example page WITH_TOKENIZED_CARD
    And User waits for Tokenized Card payment to be loaded
    And User waits for Pay button to be active
    When User fills Tokenized Card payment security code with 123
    And User clicks Pay button on Tokenized Card payment form
    And User see V2 authentication modal is displayed
    And User clicks Cancel button on authentication modal
    And User will see notification frame text: "An error occurred"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | error         |
    And User will see that Pay button is "enabled"
    And User will see that ALL input fields are "enabled"
    And User will see that TOKENIZED_SECURITY_CODE input fields are "enabled"
    And User will see that TOKENIZED_SUBMIT_BUTTON input fields are "enabled"

  Scenario: Successful payment with mainamount - tokenized Visa Non-frictionless card
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
      | credentialsonfile       | 1     |
    And JS library configured with Tokenized Card JWT_WITH_MAINAMOUNT with additional attributes
      | key                        | value            |
      | requesttypedescriptions    | THREEDQUERY AUTH |
      | credentialsonfile          | 2                |
      | parenttransactionreference | 57-9-2278379     |
    And User opens example page WITH_TOKENIZED_CARD
    And User waits for Tokenized Card payment to be loaded
    And User waits for Pay button to be active
    When User fills Tokenized Card payment security code with 123
    And User clicks Pay button on Tokenized Card payment form
    And User fills V2 authentication modal
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |
    And User will see that ALL input fields are "disabled"
    And User will see that TOKENIZED_SECURITY_CODE input fields are "disabled"
    And User will see that TOKENIZED_SUBMIT_BUTTON input fields are "disabled"

  Scenario: Invalid configuration - wrong parentrasactionreference parameter
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
      | credentialsonfile       | 1     |
    And JS library configured with Tokenized Card BASE_JWT with additional attributes
      | key                        | value            |
      | requesttypedescriptions    | THREEDQUERY AUTH |
      | credentialsonfile          | 2                |
      | parenttransactionreference | 123              |
    And User opens example page WITH_TOKENIZED_CARD
    And User waits for Tokenized Card payment to be loaded
    And User waits for Pay button to be active
    When User fills Tokenized Card payment security code with 123
    And User clicks Pay button on Tokenized Card payment form
    Then User will see notification frame text: "An error occurred"
    And User will see following callback type called only once
      | callback_type |
      | error         |
      | submit        |

  Scenario: Unsuccessful payment with SubmitOnError flag enabled and tokenized Visa Frictionless card
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key           | value |
      | submitOnError | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
      | credentialsonfile       | 1                |
    And JS library configured with Tokenized Card BASE_JWT with additional attributes
      | key                        | value            |
      | requesttypedescriptions    | THREEDQUERY AUTH |
      | credentialsonfile          | 2                |
      | parenttransactionreference | 59-9-2283412     |
    And User opens example page WITH_TOKENIZED_CARD
    And User waits for Tokenized Card payment to be loaded
    And User waits for Pay button to be active
    When User fills Tokenized Card payment security code with 123
    And User clicks Pay button on Tokenized Card payment form
    Then User will not see notification frame
    And User will be sent to page with url "www.example.com" having params
      | key          | value              |
      | errormessage | Missing parent     |
      | errorcode    | 20004              |
      | jwt          | should not be none |


  Scenario: Successful payment with SubmitOnSuccess flag enabled
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key             | value |
      | submitOnSuccess | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
      | credentialsonfile       | 1                |
    And JS library configured with Tokenized Card BASE_JWT with additional attributes
      | key                        | value            |
      | requesttypedescriptions    | THREEDQUERY AUTH |
      | credentialsonfile          | 2                |
      | parenttransactionreference | 56-9-2255170     |
    And User opens example page WITH_TOKENIZED_CARD
    And User waits for Tokenized Card payment to be loaded
    And User waits for Pay button to be active
    When User fills Tokenized Card payment security code with 123
    And User clicks Pay button on Tokenized Card payment form
    Then User will not see notification frame
    And User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | 1000                                    |
      | currencyiso3a        | GBP                                     |
      | errorcode            | 0                                       |
      | threedresponse       | should be none                          |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | orderreference       | should not be none                      |


  Scenario: Decline payment with tokenized Visa Frictionless  card
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
      | credentialsonfile       | 1                |
    And JS library configured with Tokenized Card BASE_JWT with additional attributes
      | key                        | value            |
      | requesttypedescriptions    | THREEDQUERY AUTH |
      | baseamount                 | 70000            |
      | credentialsonfile          | 2                |
      | parenttransactionreference | 56-9-2255170     |
    And User opens example page WITH_TOKENIZED_CARD
    And User waits for Tokenized Card payment to be loaded
    And User waits for Pay button to be active
    When User fills Tokenized Card payment security code with 123
    And User clicks Pay button on Tokenized Card payment form
    Then User will see notification frame text: "Decline"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | error         |
    And User will see following logs
      | name          | step                   |
      | CARD          | PAYMENT INIT STARTED   |
      | CARD          | PAYMENT INIT COMPLETED |
      | TokenizedCard | PAYMENT INIT STARTED   |
      | TokenizedCard | PAYMENT INIT COMPLETED |
      | TokenizedCard | PAYMENT STARTED        |
      | TokenizedCard | PAYMENT FAILED         |

  Scenario: Frontend validation "Value mismatch pattern" - for tokenized payment method
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
      | credentialsonfile       | 1                |
    And JS library configured with Tokenized Card BASE_JWT with additional attributes
      | key                        | value            |
      | requesttypedescriptions    | THREEDQUERY AUTH |
      | credentialsonfile          | 2                |
      | parenttransactionreference | 56-9-2255170     |
    And User opens example page WITH_TOKENIZED_CARD
    And User waits for Tokenized Card payment to be loaded
    And User waits for Pay button to be active
    When User fills Tokenized Card payment security code with 12
    And User clicks Pay button on Tokenized Card payment form
    Then User will see "Value mismatch pattern" message under field: "TOKENIZED_SECURITY_CODE"
    And User will see that "TOKENIZED_SECURITY_CODE" field is highlighted

  Scenario: Successful payment with tokenized Amex card -  validating security code placeholder
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
      | credentialsonfile       | 1                |
    And JS library configured with Tokenized Card BASE_JWT with additional attributes
      | key                        | value            |
      | requesttypedescriptions    | THREEDQUERY AUTH |
      | credentialsonfile          | 2                |
      | parenttransactionreference | 59-9-2289785     |
    And User opens example page WITH_TOKENIZED_CARD
    And User waits for Tokenized Card payment to be loaded
    And User waits for Pay button to be active
    When User fills Tokenized Card payment security code with 123
    And User clicks Pay button on Tokenized Card payment form
    Then User will see "Invalid field" message under field: "TOKENIZED_SECURITY_CODE"
    And User will see notification frame text: "Invalid field"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | error         |
    And User will see that "TOKENIZED_SECURITY_CODE" field is highlighted
    And User will see that Pay button is "enabled"
    And User will see that ALL input fields are "enabled"
    And User will see that TOKENIZED_SECURITY_CODE input fields are "enabled"
    And User will see that TOKENIZED_SUBMIT_BUTTON input fields are "enabled"
    And User waits for notification frame to disappear
    And Wait for popups to disappear
    And User clears Tokenized Card pyment security code field
    And User fills Tokenized Card payment security code with 1234
    And User clicks Pay button on Tokenized Card payment form
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that Pay button is "disabled"
    And User will see that ALL input fields are "disabled"
    And User will see that TOKENIZED_SECURITY_CODE input fields are "disabled"
    And User will see that TOKENIZED_SUBMIT_BUTTON input fields are "disabled"

  Scenario: Successful payment with tokenized AMEX Non-frictionless card
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
      | credentialsonfile       | 1                |
    And JS library configured with Tokenized Card BASE_JWT with additional attributes
      | key                        | value            |
      | requesttypedescriptions    | THREEDQUERY AUTH |
      | credentialsonfile          | 2                |
      | parenttransactionreference | 59-9-2289788     |
    And User opens example page WITH_TOKENIZED_CARD
    And User waits for Tokenized Card payment to be loaded
    And User waits for Pay button to be active
    When User fills Tokenized Card payment security code with 1234
    And User clicks Pay button on Tokenized Card payment form
    And User fills V2 authentication modal
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |
    And User will see that ALL input fields are "disabled"
    And User will see that TOKENIZED_SECURITY_CODE input fields are "disabled"
    And User will see that TOKENIZED_SUBMIT_BUTTON input fields are "disabled"


