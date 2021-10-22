Feature: payment flow with redirect

  As a user
  I want to use card payments method with redirect config
  In order to check if user is redirected or not after submit form action with success or error result

  @smoke_component_test
  Scenario: Successful payment - verify 'submitOnSuccess' is enabled by default
    Given JS library configured by inline params DEFAULT_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And Challenge card payment mock responses are set as BASE_JSINIT and payment status SUCCESS
    And ACS mock response is set to "OK"
    And User opens example page
    And User waits for form inputs to be loaded
    And User waits for Pay button to be active
    When User fills merchant data with name "John Test", email "test@example", phone "44422224444"
    And User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
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


  @smoke_component_test
  Scenario: Unsuccessful payment with submitOnError enabled
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key           | value |
      | submitOnError | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And Challenge card payment mock responses are set as BASE_JSINIT and payment status DECLINE
    And ACS mock response is set to "OK"
    And User opens example page
    And User waits for form inputs to be loaded
    And User waits for Pay button to be active
    When User fills merchant data with name "John Test", email "test@example", phone "44422224444"
    And User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
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


  @smoke_component_test
  Scenario: Successful payment with submitOnSuccess enabled
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key             | value |
      | submitOnSuccess | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And Frictionless card payment mock responses are set as BASE_JSINIT and payment status SUCCESS
    And User opens example page
    And User waits for form inputs to be loaded
    When User fills payment form with defined card VISA_V21_SUCCESSFUL_FRICTIONLESS_AUTH
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | 1000                                    |
      | currencyiso3a        | GBP                                     |
      | errorcode            | 0                                       |
      | status               | A                                       |
      | transactionreference | should not be none                      |
      | eci                  | 06                                      |
      | enrolled             | Y                                       |
      | settlestatus         | 0                                       |
      | jwt                  | should not be none                      |
