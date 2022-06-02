Feature: E2E callbacks after payment


  Scenario Outline: submit and success callback for successful payment - frictionless
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_SUCCESSFUL_FRICTIONLESS_AUTH
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
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
      | THREEDQUERY ACCOUNTCHECK |


  Scenario Outline: submit and success callback for successful payment - non frictionless
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    And User fills V2 authentication modal
    Then User will see notification frame text: "Payment has been successfully processed"
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
      | THREEDQUERY ACCOUNTCHECK | False                  |


  Scenario: submit and error callback for unsuccessful payment - frictionless
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


  Scenario: submit and error callback for unsuccessful payment - non-frictionless
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_ERROR_ON_AUTH
    And User clicks Pay button
    And User fills V2 authentication modal
    Then User will see notification frame text: "An error occurred"
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: True
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | error         |


  Scenario Outline: submit and error callback after cancel acs popup (Cardinal Commerce)
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    And User clicks Cancel button on authentication modal
    Then User will see notification frame text: "An error occurred"
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
      | THREEDQUERY ACCOUNTCHECK |


#  Scenario: submit and cancel callback after cancel acs popup (Trust provider)
#    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
#      | key                     | value             |
#      | requesttypedescriptions | THREEDQUERY AUTH  |
#      | sitereference           | trustthreeds76424 |
#      | customercountryiso2a    | GB                |
#      | billingcountryiso2a     | GB                |
#    And User opens example page
#    When User fills payment form with defined card MASTERCARD_V21_3DS_SDK_NON_FRICTIONLESS
#    And User clicks Pay button
#    And User see 3ds SDK challenge is displayed
#    And User clicks Cancel button on 3ds SDK challenge in POPUP mode
#    Then User will see notification frame text: "Payment has been cancelled"
#    And submit callback contains JWT response
#    And submit callback contains THREEDRESPONSE: False
#    And User will see following callback type called only once
#      | callback_type |
#      | submit        |
#      | cancel        |


  Scenario: redirect on submit callback - successful payment
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key             | value               |
      | submitOnSuccess | false               |
      | submitCallback  | redirectionCallback |
    And JS library authenticated by jwt BASE_JWT with additional attributes
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


  Scenario: redirect on submit callback - error payment
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key            | value               |
      | submitOnError  | false               |
      | submitCallback | redirectionCallback |
    And JS library authenticated by jwt BASE_JWT with additional attributes
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


  Scenario: redirect on submit callback with additional errorcode check
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key             | value                             |
      | submitOnSuccess | false                             |
      | submitCallback  | errorCodeCheckAndRedirectCallback |
    And JS library authenticated by jwt BASE_JWT with additional attributes
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


  Scenario: redirect on success callback
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key             | value               |
      | submitOnSuccess | false               |
      | successCallback | redirectionCallback |
    And JS library authenticated by jwt BASE_JWT with additional attributes
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


  Scenario: redirect on error callback
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key           | value               |
      | submitOnError | false               |
      | errorCallback | redirectionCallback |
    And JS library authenticated by jwt BASE_JWT with additional attributes
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


#  Scenario: redirect on cancel callback
#    Given JS library configured with BASIC_CONFIG and additional attributes
#      | key            | value               |
#      | submitOnCancel | false               |
#      | cancelCallback | redirectionCallback |
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value             |
#      | requesttypedescriptions | THREEDQUERY AUTH  |
#      | sitereference           | trustthreeds76424 |
#      | customercountryiso2a    | GB                |
#      | billingcountryiso2a     | GB                |
#    And User opens example page
#    When User fills payment form with defined card MASTERCARD_V21_3DS_SDK_NON_FRICTIONLESS
#    And User clicks Pay button
#    And User see 3ds SDK challenge is displayed
#    And User clicks Cancel button on 3ds SDK challenge in POPUP mode
#    Then User will not see notification frame
#    And User will be sent to page with url "example.org" having params
#      | key          | value                      |
#      | errormessage | Payment has been cancelled |
#      | errorcode    | cancelled                  |


  Scenario Outline: submit callback is triggered before <submitOn> feature
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key            | value               |
      | <submitOn>     | true                |
      | submitCallback | redirectionCallback |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User fills payment form with defined card <card>
    And User clicks Pay button
    Then User will not see notification frame
    And User will be sent to page with url "example.org" having params
      | key       | value        |
      | errorcode | <error_code> |

    Examples:
      | submitOn        | card                  | error_code |
      | submitOnSuccess | VISA_V21_FRICTIONLESS | 0          |
      | submitOnError   | VISA_DECLINED_CARD    | 70000      |


  Scenario: success callback is triggered before submitOnSuccess feature
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key             | value               |
      | submitOnSuccess | true                |
      | successCallback | redirectionCallback |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User fills payment form with defined card VISA_V21_FRICTIONLESS
    And User clicks Pay button
    Then User will not see notification frame
    And User will be sent to page with url "example.org" having params
      | key       | value |
      | errorcode | 0     |


  Scenario: error callback is triggered before submitOnError feature
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key           | value               |
      | submitOnError | true                |
      | errorCallback | redirectionCallback |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User fills payment form with defined card VISA_DECLINED_CARD
    And User clicks Pay button
    Then User will not see notification frame
    And User will be sent to page with url "example.org" having params
      | key       | value |
      | errorcode | 70000 |


#  Scenario: cancel callback is triggered before submitOnCancel feature
#    Given JS library configured with BASIC_CONFIG and additional attributes
#      | key            | value               |
#      | submitOnCancel | true                |
#      | cancelCallback | redirectionCallback |
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value             |
#      | requesttypedescriptions | THREEDQUERY AUTH  |
#      | sitereference           | trustthreeds76424 |
#      | customercountryiso2a    | GB                |
#      | billingcountryiso2a     | GB                |
#    And User opens example page
#    When User fills payment form with defined card MASTERCARD_V21_3DS_SDK_NON_FRICTIONLESS
#    And User clicks Pay button
#    And User see 3ds SDK challenge is displayed
#    And User clicks Cancel button on 3ds SDK challenge in POPUP mode
#    Then User will not see notification frame
#    And User will be sent to page with url "example.org" having params
#      | key          | value                      |
#      | errormessage | Payment has been cancelled |
#      | errorcode    | cancelled                  |


  Scenario: error callback for in-browser validation
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User clicks Pay button
    Then User will see "error" popup
    And User will see following callback type called only once
      | callback_type |
      | error         |


  Scenario: data type passing to callback function
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
  Scenario: callback function about browser data
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    When User opens example page WITH_BROWSER_INFO
    Then User will see that browser is marked as supported: "True"
    And User will see that operating system is marked as supported: "True"
