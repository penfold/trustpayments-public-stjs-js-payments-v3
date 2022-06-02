Feature: E2E Card Payments with mainamount field in jwt payload

  Scenario: Successful payment with mainamount field in jwt payload
    Given JS library configured by inline params BASIC_CONFIG and jwt JWT_WITH_MAINAMOUNT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User fills payment form with defined card VISA_V21_FRICTIONLESS
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |
    And submit callback contains JWT response

  Scenario: Successful payment with submitOnSuccess and mainamount field in jwt payload
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key             | value |
      | submitOnSuccess | true  |
    And JS library authenticated by jwt JWT_WITH_MAINAMOUNT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    And User fills V2 authentication modal
    Then User will not see notification frame
    And User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | 1025                                    |
      | currencyiso3a        | GBP                                     |
      | errorcode            | 0                                       |
      | enrolled             | Y                                       |
      | settlestatus         | 0                                       |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |


  Scenario: Unsuccessful payment with submitOnError and mainamount field in jwt payload
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key           | value |
      | submitOnError | true  |
    And JS library authenticated by jwt JWT_WITH_MAINAMOUNT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_DECLINED_CARD
    And User clicks Pay button
    Then User will not see notification frame
    And User will be sent to page with url "www.example.com" having params
      | key                  | value              |
      | errormessage         | Decline            |
      | baseamount           | 1025               |
      | currencyiso3a        | GBP                |
      | errorcode            | 70000              |
      | enrolled             | U                  |
      | settlestatus         | 3                  |
      | transactionreference | should not be none |
      | jwt                  | should not be none |


  Scenario: Successful payment with startOnLoad and mainamount field in jwt payload
    Given JS library configured by inline params START_ON_LOAD_CONFIG and jwt JWT_WITH_MAINAMOUNT_AND_FRICTIONLESS with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page WITHOUT_SUBMIT_BUTTON
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: False
