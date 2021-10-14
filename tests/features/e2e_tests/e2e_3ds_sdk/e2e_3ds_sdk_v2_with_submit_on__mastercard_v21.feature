@MASTERCARD
@3ds_sdk_v2.0
@3ds_sdk
Feature: 3ds SDK v2 E2E tests with redirection after payment - MasterCard v2.1
  As a user
  I want to use card payments method
  In order to check 3ds SDK integration


  Scenario Outline: TC_1 - Successful Frictionless Authentication - Card: MASTERCARD_V21 Request types: <request_types>
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key             | value |
      | submitOnSuccess | true  |
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value             |
      | requesttypedescriptions | <request_types>   |
      | sitereference           | trustthreeds76424 |
      | customercountryiso2a    | GB                |
      | billingcountryiso2a     | GB                |
    And User opens example page
    And User waits for form inputs to be loaded
    When User fills payment form with defined card MASTERCARD_V21_3DS_SDK_FRICTIONLESS_SUCCESS
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | <baseamount>                            |
      | currencyiso3a        | <currencyiso3a>                         |
      | errorcode            | 0                                       |
      | status               | Y                                       |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | enrolled             | Y                                       |
      | settlestatus         | 0                                       |
      | eci                  | <eci>                                   |

    Examples:
      | request_types            | baseamount     | currencyiso3a  | eci            |
      | THREEDQUERY AUTH         | 1000           | GBP            | 02             |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | should be none |
      | THREEDQUERY ACCOUNTCHECK | 1000           | GBP            | 02             |


  Scenario Outline: TC_2 - Failed Frictionless Authentication - Card: MASTERCARD_V21 Request types: <request_types>
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key          | value |
      | <e2e_config> | true  |
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value             |
      | requesttypedescriptions | <request_types>   |
      | sitereference           | trustthreeds76424 |
      | customercountryiso2a    | GB                |
      | billingcountryiso2a     | GB                |
    And User opens example page
    And User waits for form inputs to be loaded
    When User fills payment form with defined card MASTERCARD_V21_3DS_SDK_FRICTIONLESS_FAILED
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value              |
      | errormessage         | <errormessage>     |
      | baseamount           | should be none     |
      | currencyiso3a        | should be none     |
      | errorcode            | <errorcode>        |
      | status               | <status>           |
      | transactionreference | should not be none |
      | jwt                  | should not be none |
      | enrolled             | <enrolled>         |
      | settlestatus         | <settlestatus>     |
      | eci                  | should be none     |

    Examples:
      | request_types            | e2e_config      | errormessage                            | errorcode | status         | enrolled       | settlestatus   |
      | THREEDQUERY AUTH         | submitOnError   | Unauthenticated                         | 60022     | should be none | should be none | should be none |
      | ACCOUNTCHECK THREEDQUERY | submitOnSuccess | Payment has been successfully processed | 0         | N              | Y              | 0              |
      | THREEDQUERY ACCOUNTCHECK | submitOnError   | Unauthenticated                         | 60022     | should be none | should be none | should be none |


  Scenario Outline: TC_3 - Attempts Stand-In Frictionless Authentication - Card: MASTERCARD_V21 Request types: <request_types>
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key             | value |
      | submitOnSuccess | true  |
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value             |
      | requesttypedescriptions | <request_types>   |
      | sitereference           | trustthreeds76424 |
      | customercountryiso2a    | GB                |
      | billingcountryiso2a     | GB                |
    And User opens example page
    And User waits for form inputs to be loaded
    When User fills payment form with defined card MASTERCARD_V21_3DS_SDK_FRICTIONLESS_STAND_IN
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | <baseamount>                            |
      | currencyiso3a        | <currencyiso3a>                         |
      | errorcode            | 0                                       |
      | status               | A                                       |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | enrolled             | Y                                       |
      | settlestatus         | 0                                       |
      | eci                  | <eci>                                   |

    Examples:
      | request_types            | baseamount     | currencyiso3a  | eci            |
      | THREEDQUERY AUTH         | 1000           | GBP            | 01             |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | should be none |
      | THREEDQUERY ACCOUNTCHECK | 1000           | GBP            | 01             |


  Scenario Outline: TC_4 - Unavailable Frictionless Authentication from the Issuer - Card: MASTERCARD Request types: <request_types>
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key             | value |
      | submitOnSuccess | true  |
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value             |
      | requesttypedescriptions | <request_types>   |
      | sitereference           | trustthreeds76424 |
      | customercountryiso2a    | GB                |
      | billingcountryiso2a     | GB                |
    And User opens example page
    And User waits for form inputs to be loaded
    When User fills payment form with defined card MASTERCARD_V21_3DS_SDK_UNAVAILABLE_FRICTIONLESS_AUTH
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | <baseamount>                            |
      | currencyiso3a        | <currencyiso3a>                         |
      | errorcode            | 0                                       |
      | status               | U                                       |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | enrolled             | Y                                       |
      | settlestatus         | 0                                       |
      | eci                  | <eci>                                   |

    Examples:
      | request_types            | baseamount     | currencyiso3a  | eci            |
      | THREEDQUERY AUTH         | 1000           | GBP            | 00             |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | should be none |
      | THREEDQUERY ACCOUNTCHECK | 1000           | GBP            | 00             |


  Scenario Outline: TC_5 - Rejected Frictionless Authentication by the Issuer - Card: MASTERCARD_V21 Request types: <request_types>
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key          | value |
      | <e2e_config> | true  |
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value             |
      | requesttypedescriptions | <request_types>   |
      | sitereference           | trustthreeds76424 |
      | customercountryiso2a    | GB                |
      | billingcountryiso2a     | GB                |
    And User opens example page
    And User waits for form inputs to be loaded
    When User fills payment form with defined card MASTERCARD_V21_3DS_SDK_REJECTED_FRICTIONLESS_AUTH
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value              |
      | errormessage         | <errormessage>     |
      | baseamount           | should be none     |
      | currencyiso3a        | should be none     |
      | errorcode            | <errorcode>        |
      | status               | <status>           |
      | transactionreference | should not be none |
      | jwt                  | should not be none |
      | enrolled             | <enrolled>         |
      | settlestatus         | <settlestatus>     |
      | eci                  | should be none     |

    Examples:
      | request_types            | e2e_config      | errormessage                            | errorcode | status         | enrolled       | settlestatus   |
      | THREEDQUERY AUTH         | submitOnError   | Unauthenticated                         | 60022     | should be none | should be none | should be none |
      | ACCOUNTCHECK THREEDQUERY | submitOnSuccess | Payment has been successfully processed | 0         | R              | Y              | 0              |
      | THREEDQUERY ACCOUNTCHECK | submitOnError   | Unauthenticated                         | 60022     | should be none | should be none | should be none |


  Scenario Outline: TC_6a - Authentication failed by DS permanent unavailability - Card: MASTERCARD_V21 Request types: <request_types>
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key          | value |
      | <e2e_config> | true  |
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value             |
      | requesttypedescriptions | <request_types>   |
      | sitereference           | trustthreeds76424 |
      | customercountryiso2a    | GB                |
      | billingcountryiso2a     | GB                |
    And User opens example page
    And User waits for form inputs to be loaded
    When User fills payment form with defined card MASTERCARD_V21_3DS_SDK_DS_UNAVAILABLE
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value              |
      | errormessage         | <errormessage>     |
      | baseamount           | <baseamount>       |
      | currencyiso3a        | <currencyiso3a>    |
      | errorcode            | <errorcode>        |
      | status               | should be none     |
      | transactionreference | should not be none |
      | jwt                  | should not be none |
      | enrolled             | U                  |
      | settlestatus         | 0                  |
      | eci                  | should be none     |

    Examples:
      | request_types            | e2e_config      | errormessage                            | baseamount     | currencyiso3a  | errorcode |
      | THREEDQUERY AUTH         | submitOnSuccess | Payment has been successfully processed | 1000           | GBP            | 0         |
      | ACCOUNTCHECK THREEDQUERY | submitOnError   | Bank System Error                       | should be none | should be none | 60010     |
      | THREEDQUERY ACCOUNTCHECK | submitOnSuccess | Payment has been successfully processed | 1000           | GBP            | 0         |


  Scenario Outline: TC_7 - Authentication failed by improper data in ARes message - Card: MASTERCARD Request types: <request_types>
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key          | value |
      | <e2e_config> | true  |
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value             |
      | requesttypedescriptions | <request_types>   |
      | sitereference           | trustthreeds76424 |
      | customercountryiso2a    | GB                |
      | billingcountryiso2a     | GB                |
    And User opens example page
    And User waits for form inputs to be loaded
    When User fills payment form with defined card MASTERCARD_V21_3DS_SDK_IMPROPER_ARES_DATA
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value              |
      | errormessage         | <errormessage>     |
      | baseamount           | <baseamount>       |
      | currencyiso3a        | <currencyiso3a>    |
      | errorcode            | <errorcode>        |
      | status               | should be none     |
      | transactionreference | should not be none |
      | jwt                  | should not be none |
      | enrolled             | U                  |
      | settlestatus         | 0                  |
      | eci                  | should be none     |

    Examples:
      | request_types            | e2e_config      | errormessage                            | baseamount     | currencyiso3a  | errorcode |
      | THREEDQUERY AUTH         | submitOnSuccess | Payment has been successfully processed | 1000           | GBP            | 0         |
      | ACCOUNTCHECK THREEDQUERY | submitOnError   | Bank System Error                       | should be none | should be none | 60010     |
      | THREEDQUERY ACCOUNTCHECK | submitOnSuccess | Payment has been successfully processed | 1000           | GBP            | 0         |


  Scenario Outline: TC_8 - Error not completed threeDSMethod - Card: MASTERCARD_V21 Request types: <request_types>
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key             | value |
      | submitOnSuccess | true  |
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value             |
      | requesttypedescriptions | <request_types>   |
      | sitereference           | trustthreeds76424 |
      | customercountryiso2a    | GB                |
      | billingcountryiso2a     | GB                |
    And User opens example page
    And User waits for form inputs to be loaded
    When User fills payment form with defined card MASTERCARD_V21_3DS_SDK_ACS_UNAVAILABLE
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | <baseamount>                            |
      | currencyiso3a        | <currencyiso3a>                         |
      | errorcode            | 0                                       |
      | status               | Y                                       |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | enrolled             | Y                                       |
      | settlestatus         | 0                                       |
      | eci                  | <eci>                                   |

    Examples:
      | request_types            | baseamount     | currencyiso3a  | eci            |
      | THREEDQUERY AUTH         | 1000           | GBP            | 02             |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | should be none |
      | THREEDQUERY ACCOUNTCHECK | 1000           | GBP            | 02             |


  Scenario Outline: TC_9 -Successful Step Up Authentication - Card: MASTERCARD_V21_3DS Request types: <request_types>
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key             | value |
      | submitOnSuccess | true  |
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value             |
      | requesttypedescriptions | <request_types>   |
      | sitereference           | trustthreeds76424 |
      | customercountryiso2a    | GB                |
      | billingcountryiso2a     | GB                |
    And User opens example page
    And User waits for form inputs to be loaded
    When User fills payment form with defined card MASTERCARD_V21_3DS_SDK_NON_FRICTIONLESS
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User fills 3ds SDK challenge with THREE_DS_CODE and submit
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | <baseamount>                            |
      | currencyiso3a        | <currencyiso3a>                         |
      | errorcode            | 0                                       |
      | status               | <status>                                |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | enrolled             | Y                                       |
      | settlestatus         | 0                                       |
      | eci                  | <eci>                                   |

    Examples:
      | request_types            | baseamount     | currencyiso3a  | eci            | status |
      | THREEDQUERY AUTH         | 1000           | GBP            | 02             | Y      |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | should be none | C      |
      | THREEDQUERY ACCOUNTCHECK | 1000           | GBP            | 02             | Y      |


  Scenario Outline: TC_10 - Failed Step Up Authentication - Card: MASTERCARD_V21 Request types: <request_types>
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key           | value |
      | submitOnError | true  |
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value             |
      | requesttypedescriptions | <request_types>   |
      | sitereference           | trustthreeds76424 |
      | customercountryiso2a    | GB                |
      | billingcountryiso2a     | GB                |
    And User opens example page
    And User waits for form inputs to be loaded
    When User fills payment form with defined card MASTERCARD_V21_3DS_SDK_STEP_UP_AUTH_FAILED
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User fills 3ds SDK challenge with THREE_DS_CODE and submit
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value              |
      | errormessage         | An error occurred  |
      | baseamount           | should be none     |
      | currencyiso3a        | should be none     |
      | errorcode            | 50003              |
      | status               | C                  |
      | transactionreference | should not be none |
      | jwt                  | should not be none |
      | enrolled             | Y                  |
      | settlestatus         | 0                  |
      | eci                  | should be none     |

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |
      | THREEDQUERY ACCOUNTCHECK |


  Scenario Outline: TC_11 - step up - Error on authentication - Card: MASTERCARD_V21 Request types: <request_types>
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key           | value |
      | submitOnError | true  |
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value             |
      | requesttypedescriptions | <request_types>   |
      | sitereference           | trustthreeds76424 |
      | customercountryiso2a    | GB                |
      | billingcountryiso2a     | GB                |
    And User opens example page
    And User waits for form inputs to be loaded
    When User fills payment form with defined card MASTERCARD_V21_3DS_SDK_STEP_UP_AUTH_ERROR
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User fills 3ds SDK challenge with THREE_DS_CODE and submit
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value              |
      | errormessage         | An error occurred  |
      | baseamount           | should be none     |
      | currencyiso3a        | should be none     |
      | errorcode            | 50003              |
      | status               | C                  |
      | transactionreference | should not be none |
      | jwt                  | should not be none |
      | enrolled             | Y                  |
      | settlestatus         | 0                  |
      | eci                  | should be none     |

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |
      | THREEDQUERY ACCOUNTCHECK |


  Scenario Outline: TC_12 - successful frictionless with require methodUrl - Card: MASTERCARD_V21 Request types: <request_types>
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key             | value |
      | submitOnSuccess | true  |
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value             |
      | requesttypedescriptions | <request_types>   |
      | sitereference           | trustthreeds76424 |
      | customercountryiso2a    | GB                |
      | billingcountryiso2a     | GB                |
    And User opens example page
    And User waits for form inputs to be loaded
    When User fills payment form with defined card MASTERCARD_V21_3DS_SDK_FRICTIONLESS_SUCCESS_METHOD_URL
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | <baseamount>                            |
      | currencyiso3a        | <currencyiso3a>                         |
      | errorcode            | 0                                       |
      | status               | Y                                       |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | enrolled             | Y                                       |
      | settlestatus         | 0                                       |
      | eci                  | <eci>                                   |

    Examples:
      | request_types            | baseamount     | currencyiso3a  | eci            |
      | THREEDQUERY AUTH         | 1000           | GBP            | 02             |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | should be none |
      | THREEDQUERY ACCOUNTCHECK | 1000           | GBP            | 02             |


  Scenario Outline: TC_13 - step up with require methodUrl - Card: MASTERCARD_V21 Request types: <request_types>
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key             | value |
      | submitOnSuccess | true  |
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value             |
      | requesttypedescriptions | <request_types>   |
      | sitereference           | trustthreeds76424 |
      | customercountryiso2a    | GB                |
      | billingcountryiso2a     | GB                |
    And User opens example page
    And User waits for form inputs to be loaded
    When User fills payment form with defined card MASTERCARD_V21_3DS_SDK_NON_FRICTIONLESS_METHOD_URL
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User fills 3ds SDK challenge with THREE_DS_CODE and submit
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | <baseamount>                            |
      | currencyiso3a        | <currencyiso3a>                         |
      | errorcode            | 0                                       |
      | status               | <status>                                |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | enrolled             | Y                                       |
      | settlestatus         | 0                                       |
      | eci                  | <eci>                                   |

    Examples:
      | request_types            | baseamount     | currencyiso3a  | eci            | status |
      | THREEDQUERY AUTH         | 1000           | GBP            | 02             | Y      |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | should be none | C      |
      | THREEDQUERY ACCOUNTCHECK | 1000           | GBP            | 02             | Y      |


  Scenario Outline: TC_4b - successful frictionless with suspected fraud - Card: MASTERCARD_V21 Request types: <request_types>
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key             | value |
      | submitOnSuccess | true  |
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value             |
      | requesttypedescriptions | <request_types>   |
      | sitereference           | trustthreeds76424 |
      | customercountryiso2a    | GB                |
      | billingcountryiso2a     | GB                |
    And User opens example page
    And User waits for form inputs to be loaded
    When User fills payment form with defined card MASTERCARD_V21_3DS_SDK_TRANS_STATUS_SUSPECTED_FRAUD
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | <baseamount>                            |
      | currencyiso3a        | <currencyiso3a>                         |
      | errorcode            | 0                                       |
      | status               | U                                       |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | enrolled             | Y                                       |
      | settlestatus         | 0                                       |
      | eci                  | <eci>                                   |

    Examples:
      | request_types            | baseamount     | currencyiso3a  | eci            |
      | THREEDQUERY AUTH         | 1000           | GBP            | 00             |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | should be none |
      | THREEDQUERY ACCOUNTCHECK | 1000           | GBP            | 00             |


  Scenario Outline: TC_4c - successful frictionless with card holder not enrolled in service - Card: MASTERCARD_V21 Request types: <request_types>
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key          | value |
      | <e2e_config> | true  |
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value             |
      | requesttypedescriptions | <request_types>   |
      | sitereference           | trustthreeds76424 |
      | customercountryiso2a    | GB                |
      | billingcountryiso2a     | GB                |
    And User opens example page
    And User waits for form inputs to be loaded
    When User fills payment form with defined card MASTERCARD_V21_3DS_SDK_TRANS_STATUS_NOT_ENROLLED
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value              |
      | errormessage         | <errormessage>     |
      | baseamount           | should be none     |
      | currencyiso3a        | should be none     |
      | errorcode            | <errorcode>        |
      | status               | <status>           |
      | transactionreference | should not be none |
      | jwt                  | should not be none |
      | enrolled             | <enrolled>         |
      | settlestatus         | <settlestatus>     |
      | eci                  | should be none     |

    Examples:
      | request_types            | e2e_config      | errormessage                            | errorcode | status         | enrolled       | settlestatus   |
      | THREEDQUERY AUTH         | submitOnError   | Unauthenticated                         | 60022     | should be none | should be none | should be none |
      | ACCOUNTCHECK THREEDQUERY | submitOnSuccess | Payment has been successfully processed | 0         | R              | Y              | 0              |
      | THREEDQUERY ACCOUNTCHECK | submitOnError   | Unauthenticated                         | 60022     | should be none | should be none | should be none |


  Scenario Outline: TC_4e - successful frictionless with non-payment transaction not supported - Card: MASTERCARD_V21 Request types: <request_types>
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key             | value |
      | submitOnSuccess | true  |
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value             |
      | requesttypedescriptions | <request_types>   |
      | sitereference           | trustthreeds76424 |
      | customercountryiso2a    | GB                |
      | billingcountryiso2a     | GB                |
    And User opens example page
    And User waits for form inputs to be loaded
    When User fills payment form with defined card MASTERCARD_V21_3DS_SDK_TRANS_STATUS_TRANSACTION_NON_PAYMENT
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | <baseamount>                            |
      | currencyiso3a        | <currencyiso3a>                         |
      | errorcode            | 0                                       |
      | status               | U                                       |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | enrolled             | Y                                       |
      | settlestatus         | 0                                       |
      | eci                  | <eci>                                   |

    Examples:
      | request_types            | baseamount     | currencyiso3a  | eci            |
      | THREEDQUERY AUTH         | 1000           | GBP            | 00             |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | should be none |
      | THREEDQUERY ACCOUNTCHECK | 1000           | GBP            | 00             |


  Scenario Outline: TC_4f - successful frictionless with 3RI transaction not supported - Card: MASTERCARD_V21 Request types: <request_types>
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key             | value |
      | submitOnSuccess | true  |
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value             |
      | requesttypedescriptions | <request_types>   |
      | sitereference           | trustthreeds76424 |
      | customercountryiso2a    | GB                |
      | billingcountryiso2a     | GB                |
    And User opens example page
    And User waits for form inputs to be loaded
    When User fills payment form with defined card MASTERCARD_V21_3DS_SDK_TRANS_STATUS_3RI_TRANSACTION_NOT_SUPPORTED
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | <baseamount>                            |
      | currencyiso3a        | <currencyiso3a>                         |
      | errorcode            | 0                                       |
      | status               | U                                       |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | enrolled             | Y                                       |
      | settlestatus         | 0                                       |
      | eci                  | <eci>                                   |

    Examples:
      | request_types            | baseamount     | currencyiso3a  | eci            |
      | THREEDQUERY AUTH         | 1000           | GBP            | 00             |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | should be none |
      | THREEDQUERY ACCOUNTCHECK | 1000           | GBP            | 00             |
