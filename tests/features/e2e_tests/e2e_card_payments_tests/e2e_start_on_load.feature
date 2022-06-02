Feature: E2E startOnLoad

  As a user
  I want to use card payments method with startOnLoad config
  In order to check full payment functionality


  Scenario: Successful non-frictionless payment with startOnLoad
    Given JS library configured by inline params START_ON_LOAD_CONFIG and jwt JWT_WITH_NON_FRICTIONLESS_CARD with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page WITHOUT_SUBMIT_BUTTON
    And User fills V2 authentication modal
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: False


  Scenario: Successful payment with startOnLoad and additional request types: ACCOUNTCHECK, TDQ, AUTH, SUBSCRIPTION
    Given JS library configured by inline params START_ON_LOAD_CONFIG and jwt JWT_NON_FRICTIONLESS_CARD_SUBSCRIPTION with additional attributes
      | key                     | value                                      |
      | requesttypedescriptions | ACCOUNTCHECK THREEDQUERY AUTH SUBSCRIPTION |
    And User opens example page WITHOUT_SUBMIT_BUTTON
    And User fills V2 authentication modal
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: False


  Scenario: Unsuccessful payment with request types: THREEDQUERY AUTH - non-frictionless
    Given JS library configured by inline params START_ON_LOAD_CONFIG and jwt JWT_FAILED_NON_FRICTIONLESS_CARD with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    When User opens example page WITHOUT_SUBMIT_BUTTON
    And User fills V2 authentication modal
    Then User will see notification frame text: "An error occurred"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | error         |
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: True


  Scenario Outline: Successful non-frictionless payment with submitOnSuccess and request types: <request_types>
    Given JS library configured with START_ON_LOAD_CONFIG and additional attributes
      | key             | value |
      | submitOnSuccess | true  |
    And JS library authenticated by jwt JWT_WITH_NON_FRICTIONLESS_CARD with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    When User opens example page WITHOUT_SUBMIT_BUTTON
    And User fills V2 authentication modal
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | <baseamount>                            |
      | currencyiso3a        | <currencyiso3a>                         |
      | errorcode            | 0                                       |
      | threedresponse       | <threedresponse>                        |
      | enrolled             | Y                                       |
      | settlestatus         | 0                                       |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |

    Examples:
      | request_types            | threedresponse     | baseamount     | currencyiso3a  |
      | THREEDQUERY AUTH         | should be none     | 1000           | GBP            |
      | ACCOUNTCHECK THREEDQUERY | should not be none | should be none | should be none |


  Scenario: Unsuccessful payment with submitOnError and request types: THREEDQUERY AUTH
    Given JS library configured with START_ON_LOAD_CONFIG and additional attributes
      | key           | value |
      | submitOnError | true  |
    And JS library authenticated by jwt JWT_FAILED_NON_FRICTIONLESS_CARD with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    When User opens example page WITHOUT_SUBMIT_BUTTON
    And User fills V2 authentication modal
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value              |
      | errormessage         | An error occurred  |
      | errorcode            | 50003              |
      | enrolled             | Y                  |
      | settlestatus         | 0                  |
      | transactionreference | should not be none |
      | jwt                  | should not be none |
      | threedresponse       | should not be none |


  Scenario Outline: Successful frictionless payment with startOnLoad
    Given JS library configured by inline params START_ON_LOAD_CONFIG and jwt JWT_WITH_FRICTIONLESS_CARD with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page WITHOUT_SUBMIT_BUTTON
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: False

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |
      | THREEDQUERY ACCOUNTCHECK |
