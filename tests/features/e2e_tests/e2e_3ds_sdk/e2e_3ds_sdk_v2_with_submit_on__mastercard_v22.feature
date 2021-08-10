@3ds_sdk_v2.0_MASTERCARD_V22
@3ds_sdk_v2.0
Feature: 3ds SDK v2 E2E tests with redirection after payment - MasterCard v2.2
  As a user
  I want to use card payments method
  In order to check 3ds SDK integration


  Background:
    Given JS library configured by inline config THREE_DS_SDK_SUBMIT_ON_SUCCESS_CONFIG


  Scenario Outline: TC_1 - Successful Frictionless Authentication - Card: MASTERCARD_V22 Request types: <request_types>
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    And User waits for whole form to be loaded
    When User fills payment form with defined card MASTERCARD_V22_3DS_SDK_FRICTIONLESS_SUCCESS
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
      | THREEDQUERY AUTH         | 1000           | GBP            | TODO           |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | should be none |
      | THREEDQUERY ACCOUNTCHECK | 1000           | GBP            | TODO           |


  Scenario Outline: TC_2 - Failed Frictionless Authentication - Card: MASTERCARD_V22 Request types: <request_types>
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    And User waits for whole form to be loaded
    When User fills payment form with defined card MASTERCARD_V22_3DS_SDK_FRICTIONLESS_FAILED
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value              |
      | errormessage         | <payment_status>   |
      | baseamount           | <baseamount>       |
      | currencyiso3a        | <currencyiso3a>    |
      | errorcode            | 0                  |
      | status               | TODO               |
      | transactionreference | should not be none |
      | jwt                  | should not be none |
      | enrolled             | TODO               |
      | settlestatus         | TODO               |
      | eci                  | <eci>              |

    Examples:
      | request_types            | payment_status                          | baseamount     | currencyiso3a  | eci            |
      | THREEDQUERY AUTH         | Unauthenticated                         | 1000           | GBP            | TODO           |
      | ACCOUNTCHECK THREEDQUERY | Payment has been successfully processed | should be none | should be none | should be none |
      | THREEDQUERY ACCOUNTCHECK | Unauthenticated                         | 1000           | GBP            | TODO           |


  Scenario Outline: TC_3 - Attempts Stand-In Frictionless Authentication - Card: MASTERCARD_V22 Request types: <request_types>
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    And User waits for whole form to be loaded
    When User fills payment form with defined card MASTERCARD_V22_3DS_SDK_FRICTIONLESS_STAND_IN
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User fills 3ds SDK challenge with THREE_DS_CODE and submit
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | <baseamount>                            |
      | currencyiso3a        | <currencyiso3a>                         |
      | errorcode            | 0                                       |
      | status               | TODO                                    |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | enrolled             | TODO                                    |
      | settlestatus         | TODO                                    |
      | eci                  | <eci>                                   |

    Examples:
      | request_types            | baseamount     | currencyiso3a  | eci            |
      | THREEDQUERY AUTH         | 1000           | GBP            | 01             |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | should be none |
      | THREEDQUERY ACCOUNTCHECK | 1000           | GBP            | 01             |


  Scenario Outline: TC_4 - Unavailable Frictionless Authentication from the Issuer - Card: MASTERCARD_V22 Request types: <request_types>
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    And User waits for whole form to be loaded
    When User fills payment form with defined card MASTERCARD_V22_3DS_SDK_UNAVAILABLE_FRICTIONLESS_AUTH
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User fills 3ds SDK challenge with THREE_DS_CODE and submit
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | <baseamount>                            |
      | currencyiso3a        | <currencyiso3a>                         |
      | errorcode            | 0                                       |
      | status               | TODO                                    |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | enrolled             | TODO                                    |
      | settlestatus         | TODO                                    |
      | eci                  | <eci>                                   |

    Examples:
      | request_types            | baseamount     | currencyiso3a  | eci            |
      | THREEDQUERY AUTH         | 1000           | GBP            | 00             |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | should be none |
      | THREEDQUERY ACCOUNTCHECK | 1000           | GBP            | 00             |


  Scenario Outline: TC_5 - Rejected Frictionless Authentication by the Issuer - Card: MASTERCARD_V22 Request types: <request_types>
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    And User waits for whole form to be loaded
    When User fills payment form with defined card MASTERCARD_V22_3DS_SDK_REJECTED_FRICTIONLESS_AUTH
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value              |
      | errormessage         | <payment_status>   |
      | baseamount           | <baseamount>       |
      | currencyiso3a        | <currencyiso3a>    |
      | errorcode            | 0                  |
      | status               | TODO               |
      | transactionreference | should not be none |
      | jwt                  | should not be none |
      | enrolled             | TODO               |
      | settlestatus         | TODO               |
      | eci                  | <eci>              |

    Examples:
      | request_types            | payment_status                          | baseamount     | currencyiso3a  | eci            |
      | THREEDQUERY AUTH         | Unauthenticated                         | 1000           | GBP            | TODO           |
      | ACCOUNTCHECK THREEDQUERY | Payment has been successfully processed | should be none | should be none | should be none |
      | THREEDQUERY ACCOUNTCHECK | Unauthenticated                         | 1000           | GBP            | TODO           |


  Scenario Outline: TC_6 - Authentication failed by DS unavailability - Card: MASTERCARD_V22 Request types: <request_types>
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    And User waits for whole form to be loaded
    When User fills payment form with defined card MASTERCARD_V22_3DS_SDK_DS_UNAVAILABLE
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | <baseamount>                            |
      | currencyiso3a        | <currencyiso3a>                         |
      | errorcode            | 0                                       |
      | status               | TODO                                    |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | enrolled             | TODO                                    |
      | settlestatus         | TODO                                    |
      | eci                  | <eci>                                   |

    Examples:
      | request_types            | baseamount     | currencyiso3a  | eci  |
      | THREEDQUERY AUTH         | 1000           | GBP            | TODO |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | TODO |
      | THREEDQUERY ACCOUNTCHECK | 1000           | GBP            | TODO |


  Scenario Outline: TC_7 - Authentication failed by improper data in ARes message - Card: MASTERCARD_V22 Request types: <request_types>
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    And User waits for whole form to be loaded
    When User fills payment form with defined card MASTERCARD_V22_3DS_SDK_IMPROPER_ARES_DATA
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value              |
      | errormessage         | <payment_status>   |
      | baseamount           | <baseamount>       |
      | currencyiso3a        | <currencyiso3a>    |
      | errorcode            | 0                  |
      | status               | TODO               |
      | transactionreference | should not be none |
      | jwt                  | should not be none |
      | enrolled             | TODO               |
      | settlestatus         | TODO               |
      | eci                  | <eci>              |

    Examples:
      | request_types            | payment_status                          | baseamount     | currencyiso3a  | eci  |
      | THREEDQUERY AUTH         | Payment has been successfully processed | 1000           | GBP            | TODO |
      | ACCOUNTCHECK THREEDQUERY | Bank System Error                       | should be none | should be none | TODO |
      | THREEDQUERY ACCOUNTCHECK | Payment has been successfully processed | 1000           | GBP            | TODO |


  Scenario Outline: TC_8 - Error not completed threeDSMethod - Card: MASTERCARD_V22 Request types: <request_types>
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    And User waits for whole form to be loaded
    When User fills payment form with defined card MASTERCARD_V22_3DS_SDK_ACS_UNAVAILABLE
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | <baseamount>                            |
      | currencyiso3a        | <currencyiso3a>                         |
      | errorcode            | 0                                       |
      | status               | TODO                                    |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | enrolled             | TODO                                    |
      | settlestatus         | TODO                                    |
      | eci                  | <eci>                                   |

    Examples:
      | request_types            | baseamount     | currencyiso3a  | eci  |
      | THREEDQUERY AUTH         | 1000           | GBP            | TODO |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | TODO |
      | THREEDQUERY ACCOUNTCHECK | TODO           | TODO           | TODO |


  Scenario Outline: TC_9 -Successful Step Up Authentication - Card: MASTERCARD_V22 Request types: <request_types>
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    And User waits for whole form to be loaded
    When User fills payment form with defined card MASTERCARD_V22_3DS_SDK_NON_FRICTIONLESS
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User fills 3ds SDK challenge with THREE_DS_CODE and submit
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | <baseamount>                            |
      | currencyiso3a        | <currencyiso3a>                         |
      | errorcode            | 0                                       |
      | status               | TODO                                    |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | enrolled             | TODO                                    |
      | settlestatus         | TODO                                    |
      | eci                  | <eci>                                   |

    Examples:
      | request_types            | baseamount     | currencyiso3a  | eci            |
      | THREEDQUERY AUTH         | 1000           | GBP            | 00             |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | should be none |
      | THREEDQUERY ACCOUNTCHECK | TODO           | TODO           | TODO           |


  Scenario Outline: TC_10 - Failed Step Up Authentication - Card: MASTERCARD_V22 Request types: <request_types>
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    And User waits for whole form to be loaded
    When User fills payment form with defined card MASTERCARD_V22_3DS_SDK_STEP_UP_AUTH_FAILED
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User fills 3ds SDK challenge with THREE_DS_CODE and submit
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | <baseamount>                            |
      | currencyiso3a        | <currencyiso3a>                         |
      | errorcode            | 0                                       |
      | status               | TODO                                    |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | enrolled             | TODO                                    |
      | settlestatus         | TODO                                    |
      | eci                  | <eci>                                   |

    Examples:
      | request_types            | baseamount     | currencyiso3a  | eci            |
      | THREEDQUERY AUTH         | 1000           | GBP            | 00             |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | should be none |
      | THREEDQUERY ACCOUNTCHECK | TODO           | TODO           | TODO           |


  Scenario Outline: TC_11 - step up - Error on authentication - Card: MASTERCARD_V22 Request types: <request_types>
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    And User waits for whole form to be loaded
    When User fills payment form with defined card MASTERCARD_V22_3DS_SDK_STEP_UP_AUTH_ERROR
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User fills 3ds SDK challenge with THREE_DS_CODE and submit
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | <baseamount>                            |
      | currencyiso3a        | <currencyiso3a>                         |
      | errorcode            | 0                                       |
      | status               | TODO                                    |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | enrolled             | TODO                                    |
      | settlestatus         | TODO                                    |
      | eci                  | <eci>                                   |

    Examples:
      | request_types            | baseamount     | currencyiso3a  | eci            |
      | THREEDQUERY AUTH         | 1000           | GBP            | 00             |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | should be none |
      | THREEDQUERY ACCOUNTCHECK | TODO           | TODO           | TODO           |


  Scenario Outline: TC_12 - successful frictionless with require methodUrl - Card: MASTERCARD_V22 Request types: <request_types>
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    And User waits for whole form to be loaded
    When User fills payment form with defined card MASTERCARD_V22_3DS_SDK_FRICTIONLESS_SUCCESS_METHOD_URL
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | <baseamount>                            |
      | currencyiso3a        | <currencyiso3a>                         |
      | errorcode            | 0                                       |
      | status               | TODO                                    |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | enrolled             | TODO                                    |
      | settlestatus         | TODO                                    |
      | eci                  | <eci>                                   |

    Examples:
      | request_types            | baseamount     | currencyiso3a  | eci  |
      | THREEDQUERY AUTH         | 1000           | GBP            | TODO |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | TODO |
      | THREEDQUERY ACCOUNTCHECK | TODO           | TODO           | TODO |


  Scenario Outline: TC_13 - step up with require methodUrl - Card: MASTERCARD_V22 Request types: <request_types>
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    And User waits for whole form to be loaded
    When User fills payment form with defined card MASTERCARD_V22_3DS_SDK_NON_FRICTIONLESS_METHOD_URL
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User fills 3ds SDK challenge with THREE_DS_CODE and submit
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | <baseamount>                            |
      | currencyiso3a        | <currencyiso3a>                         |
      | errorcode            | 0                                       |
      | status               | TODO                                    |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | enrolled             | TODO                                    |
      | settlestatus         | TODO                                    |
      | eci                  | <eci>                                   |

    Examples:
      | request_types            | baseamount     | currencyiso3a  | eci  |
      | THREEDQUERY AUTH         | 1000           | GBP            | TODO |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | TODO |
      | THREEDQUERY ACCOUNTCHECK | TODO           | TODO           | TODO |


  Scenario Outline: TC_14 - successful frictionless with transaction timed out error for method url- Card: MASTERCARD_V22 Request types: <request_types>
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    And User waits for whole form to be loaded
    When User fills payment form with defined card MASTERCARD_V22_3DS_SDK_TRANSACTION_TIMEOUT
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | <baseamount>                            |
      | currencyiso3a        | <currencyiso3a>                         |
      | errorcode            | 0                                       |
      | status               | TODO                                    |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | enrolled             | TODO                                    |
      | settlestatus         | TODO                                    |
      | eci                  | <eci>                                   |

    Examples:
      | request_types            | baseamount     | currencyiso3a  | eci  |
      | THREEDQUERY AUTH         | 1000           | GBP            | TODO |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | TODO |
      | THREEDQUERY ACCOUNTCHECK | TODO           | TODO           | TODO |


  Scenario Outline: TC_4a - successful frictionless with transaction timed out at athe ACS - Card: MASTERCARD_V22 Request types: <request_types>
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    And User waits for whole form to be loaded
    When User fills payment form with defined card MASTERCARD_V22_3DS_SDK_TRANS_STATUS_AUTH_FAILED
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value              |
      | errormessage         | <payment_status>   |
      | baseamount           | <baseamount>       |
      | currencyiso3a        | <currencyiso3a>    |
      | errorcode            | 0                  |
      | status               | TODO               |
      | transactionreference | should not be none |
      | jwt                  | should not be none |
      | enrolled             | TODO               |
      | settlestatus         | TODO               |
      | eci                  | <eci>              |

    Examples:
      | request_types            | payment_status  | baseamount | currencyiso3a | eci  |
      | THREEDQUERY AUTH         | Unauthenticated | 1000       | GBP           | TODO |
#      | ACCOUNTCHECK THREEDQUERY | Payment has been successfully processed | should be none | should be none | should be none | #Timout in acs/gateway takes more time than wait in tests
      | THREEDQUERY ACCOUNTCHECK | Unauthenticated | 1000       | GBP           | TODO |


  Scenario Outline: TC_4b - successful frictionless with suspected fraud - Card: MASTERCARD_V22 Request types: <request_types>
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    And User waits for whole form to be loaded
    When User fills payment form with defined card MASTERCARD_V22_3DS_SDK_TRANS_STATUS_SUSPECTED_FRAUD
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | <baseamount>                            |
      | currencyiso3a        | <currencyiso3a>                         |
      | errorcode            | 0                                       |
      | status               | TODO                                    |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | enrolled             | TODO                                    |
      | settlestatus         | TODO                                    |
      | eci                  | <eci>                                   |

    Examples:
      | request_types            | baseamount     | currencyiso3a  | eci  |
      | THREEDQUERY AUTH         | 1000           | GBP            | 00   |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | TODO |
      | THREEDQUERY ACCOUNTCHECK | TODO           | TODO           | TODO |


  Scenario Outline: TC_4c - successful frictionless with card holder not enrolled in service - Card: MASTERCARD_V22 Request types: <request_types>
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    And User waits for whole form to be loaded
    When User fills payment form with defined card MASTERCARD_V22_3DS_SDK_TRANS_STATUS_NOT_ENROLLED
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value              |
      | errormessage         | <payment_status>   |
      | baseamount           | <baseamount>       |
      | currencyiso3a        | <currencyiso3a>    |
      | errorcode            | 0                  |
      | status               | TODO               |
      | transactionreference | should not be none |
      | jwt                  | should not be none |
      | enrolled             | TODO               |
      | settlestatus         | TODO               |
      | eci                  | <eci>              |

    Examples:
      | request_types            | payment_status  | baseamount | currencyiso3a | eci  |
      | THREEDQUERY AUTH         | Unauthenticated | 1000       | GBP           | TODO |
#      | ACCOUNTCHECK THREEDQUERY | Payment has been successfully processed | should be none | should be none | should be none | #Timout in acs/gateway takes more time than wait in tests
      | THREEDQUERY ACCOUNTCHECK | Unauthenticated | 1000       | GBP           | TODO |


  Scenario Outline: TC_4d - successful frictionless with transaction timed out at the ACS - Card: MASTERCARD_V22 Request types: <request_types>
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    And User waits for whole form to be loaded
    When User fills payment form with defined card MASTERCARD_V22_3DS_SDK_TRANS_STATUS_TRANSACTION_TIMEOUT_AT_ACS
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | <baseamount>                            |
      | currencyiso3a        | <currencyiso3a>                         |
      | errorcode            | 0                                       |
      | status               | TODO                                    |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | enrolled             | TODO                                    |
      | settlestatus         | TODO                                    |
      | eci                  | <eci>                                   |

    Examples:
      | request_types            | baseamount     | currencyiso3a  | eci  |
      | THREEDQUERY AUTH         | 1000           | GBP            | 00   |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | TODO |
      | THREEDQUERY ACCOUNTCHECK | TODO           | TODO           | TODO |


  Scenario Outline: TC_4e - successful frictionless with non-payment transaction not supported - Card: MASTERCARD_V22 Request types: <request_types>
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    And User waits for whole form to be loaded
    When User fills payment form with defined card MASTERCARD_V22_3DS_SDK_TRANS_STATUS_TRANSACTION_NON_PAYMENT
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | <baseamount>                            |
      | currencyiso3a        | <currencyiso3a>                         |
      | errorcode            | 0                                       |
      | status               | TODO                                    |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | enrolled             | TODO                                    |
      | settlestatus         | TODO                                    |
      | eci                  | <eci>                                   |

    Examples:
      | request_types            | baseamount     | currencyiso3a  | eci  |
      | THREEDQUERY AUTH         | 1000           | GBP            | 00   |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | TODO |
      | THREEDQUERY ACCOUNTCHECK | TODO           | TODO           | TODO |


  Scenario Outline: TC_4f - successful frictionless with 3RI transaction not supported - Card: MASTERCARD_V22 Request types: <request_types>
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    And User waits for whole form to be loaded
    When User fills payment form with defined card MASTERCARD_V22_3DS_SDK_TRANS_STATUS_3RI_TRANSACTION_NOT_SUPPORTED
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | <baseamount>                            |
      | currencyiso3a        | <currencyiso3a>                         |
      | errorcode            | 0                                       |
      | status               | TODO                                    |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | enrolled             | TODO                                    |
      | settlestatus         | TODO                                    |
      | eci                  | <eci>                                   |

    Examples:
      | request_types            | baseamount     | currencyiso3a  | eci  |
      | THREEDQUERY AUTH         | 1000           | GBP            | 00   |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | TODO |
      | THREEDQUERY ACCOUNTCHECK | TODO           | TODO           | TODO |
