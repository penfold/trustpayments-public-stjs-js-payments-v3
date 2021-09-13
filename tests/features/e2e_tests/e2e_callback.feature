Feature: E2E callbacks after payment


  Scenario Outline: success and submit callback for successful payment - challenge flow
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    And User fills V2 authentication modal
    Then User will see payment status information: "Payment has been successfully processed"
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: <threedresponse_defined>
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |

    Examples:
      | request_types            | threedresponse_defined |
      | THREEDQUERY AUTH         | False                  |
      | ACCOUNTCHECK THREEDQUERY | True                   |


  Scenario Outline: success and submit callback for successful payment - frictionless payment
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_SUCCESSFUL_FRICTIONLESS_AUTH
    And User clicks Pay button
    Then User will see payment status information: "Payment has been successfully processed"
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: False
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |


  Scenario: error and submit callback for unsuccessful payment - frictionless payment
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User fills payment form with defined card VISA_V21_REJECTED_FRICTIONLESS_AUTH
    And User clicks Pay button
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: False
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | error         |


  Scenario Outline: error and submit callback for unsuccessful payment - challenge flow
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_ERROR_ON_AUTH
    And User clicks Pay button
    And User fills V2 authentication modal
    Then User will see payment status information: "An error occurred"
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: True
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | error         |

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |


  Scenario Outline: error and submit callback after cancel acs popup
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    And User clicks Cancel button on authentication modal
    Then User will see payment status information: "An error occurred"
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: True
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | error         |

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |


  Scenario: Verify redirect on submit callback
    Given JS library configured by inline params REDIRECT_ON_SUBMIT_CALLBACK_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User fills payment form with defined card VISA_V21_FRICTIONLESS
    And User clicks Pay button
    Then User will not see notification frame
    And User will be sent to page with url "example.org" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | 1000                                    |
      | currencyiso3a        | GBP                                     |
      | errorcode            | 0                                       |
      | status               | A                                       |
      | eci                  | 06                                      |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | enrolled             | Y                                       |
      | settlestatus         | 0                                       |


  Scenario: Verify redirect on success callback
    Given JS library configured by inline params REDIRECT_ON_SUCCESS_CALLBACK_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User fills payment form with defined card VISA_V21_FRICTIONLESS
    And User clicks Pay button
    Then User will not see notification frame
    And User will be sent to page with url "example.org" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | 1000                                    |
      | currencyiso3a        | GBP                                     |
      | errorcode            | 0                                       |
      | status               | A                                       |
      | eci                  | 06                                      |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | enrolled             | Y                                       |
      | settlestatus         | 0                                       |


  Scenario: Verify redirect on error callback
    Given JS library configured by inline params REDIRECT_ON_ERROR_CALLBACK_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User fills payment form with defined card VISA_DECLINED_CARD
    And User clicks Pay button
    Then User will not see notification frame
    And User will be sent to page with url "example.org" having params
      | key                  | value              |
      | errormessage         | Decline            |
      | baseamount           | 1000               |
      | currencyiso3a        | GBP                |
      | errorcode            | 70000              |
      | currencyiso3a        | GBP                |
      | transactionreference | should not be none |
      | jwt                  | should not be none |
      | eci                  | 07                 |
      | settlestatus         | 3                  |


  Scenario: Verify redirect on submit callback - declined payment
    Given JS library configured by inline params REDIRECT_ON_SUBMIT_CALLBACK_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User fills payment form with defined card VISA_DECLINED_CARD
    And User clicks Pay button
    Then User will not see notification frame
    And User will be sent to page with url "example.org" having params
      | key                  | value              |
      | errormessage         | Decline            |
      | baseamount           | 1000               |
      | currencyiso3a        | GBP                |
      | errorcode            | 70000              |
      | threedresponse       | should be none     |
      | transactionreference | should not be none |
      | jwt                  | should not be none |
      | eci                  | 07                 |
      | settlestatus         | 3                  |


  Scenario: Verify redirect on submit callback with additional errorcode check
    Given JS library configured by inline params REDIRECT_ON_SUBMIT_CALLBACK_WITH_ERROR_CODE_CHECK_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User fills payment form with defined card VISA_V21_FRICTIONLESS
    And User clicks Pay button
    Then User will not see notification frame
    And User will be sent to page with url "example.org" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | 1000                                    |
      | currencyiso3a        | GBP                                     |
      | errorcode            | 0                                       |
      | status               | A                                       |
      | eci                  | 06                                      |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | enrolled             | Y                                       |
      | settlestatus         | 0                                       |


  Scenario Outline: Verify if <callback_type> callback is triggered before submitOn feature
    Given JS library configured by inline params <config> and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User fills payment form with defined card <card_type>
    And User clicks Pay button
    Then User will not see notification frame
    And User will be sent to page with url "example.org" having params
      | key       | value       |
      | errorcode | <errorcode> |

    Examples:
      | callback_type | config                                                | card_type             | errorcode |
      | submit        | SUBMIT_ON_WITH_REDIRECT_SUBMIT_CALLBACK_CONFIG        | VISA_V21_FRICTIONLESS | 0         |
      | success       | SUBMIT_ON_SUCCESS_ERROR_WITH_REDIRECT_CALLBACK_CONFIG | VISA_V21_FRICTIONLESS | 0         |
      | error         | SUBMIT_ON_SUCCESS_ERROR_WITH_REDIRECT_CALLBACK_CONFIG | VISA_DECLINED_CARD    | 70000     |


  Scenario: Verify error callback for in-browser validation
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User clicks Pay button
    Then User will see "error" popup
    And "error" callback is called only once


  Scenario: Verify data type passing to callback function
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    When User opens example page
    And User fills payment form with defined card VISA_V21_FRICTIONLESS
    And User clicks Pay button
    Then User will see correct error code displayed in popup
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |


  @ignore_on_headless
  Scenario: Verify callback function about browser data
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    When User opens example page WITH_BROWSER_INFO
    Then User will see that browser is marked as supported: "True"
    And User will see that operating system is marked as supported: "True"
