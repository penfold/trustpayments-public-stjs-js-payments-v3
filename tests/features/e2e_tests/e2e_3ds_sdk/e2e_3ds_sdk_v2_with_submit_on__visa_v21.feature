@3ds_sdk_v2.0_VISA_V21
@3ds_sdk_v2.0
Feature: 3ds SDK v2 E2E tests with redirection after payment - VISA v2.1
  As a user
  I want to use card payments method
  In order to check 3ds SDK integration


  Scenario Outline: TC_1 - Successful Frictionless Authentication - Card: VISA_V21_3DS_SDK_FRICTIONLESS_SUCCESS
    Given JS library configured by inline params THREE_DS_SDK_SUBMIT_ON_SUCCESS_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value                          |
      | requesttypedescriptions | <request_types>                |
      | sitereference           | test_js_automated_tests_tp_3ds |
    And User opens example page
    When User fills payment form with defined card VISA_V21_3DS_SDK_FRICTIONLESS_SUCCESS
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value              |
      | errormessage         | TODO               |
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
      | request_types            | baseamount     | currencyiso3a  | eci            |
      | THREEDQUERY AUTH         | 1000           | GBP            | 05             |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | should be none |
      | THREEDQUERY ACCOUNTCHECK | TODO           | TODO           | TODO           |


  Scenario Outline: TC_2 - Failed Frictionless Authentication - Card: VISA_V21_3DS_SDK_FRICTIONLESS_FAILED
    Given JS library configured by inline params THREE_DS_SDK_SUBMIT_ON_SUCCESS_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value                          |
      | requesttypedescriptions | <request_types>                |
      | sitereference           | test_js_automated_tests_tp_3ds |
    And User opens example page
    When User fills payment form with defined card VISA_V21_3DS_SDK_FRICTIONLESS_FAILED
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value              |
      | errormessage         | TODO               |
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
      | request_types            | baseamount     | currencyiso3a  | eci            |
      | THREEDQUERY AUTH         | 1000           | GBP            | 07             |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | should be none |
      | THREEDQUERY ACCOUNTCHECK | TODO           | TODO           | TODO           |


  Scenario Outline: TC_3 - Attempts Stand-In Frictionless Authentication - Card: VISA_V21_3DS_SDK_FRICTIONLESS_STAND_IN
    Given JS library configured by inline params THREE_DS_SDK_SUBMIT_ON_SUCCESS_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value                          |
      | requesttypedescriptions | <request_types>                |
      | sitereference           | test_js_automated_tests_tp_3ds |
    And User opens example page
    When User fills payment form with defined card VISA_V21_3DS_SDK_FRICTIONLESS_STAND_IN
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User fills 3ds SDK challenge with THREE_DS_CODE and submit
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value              |
      | errormessage         | TODO               |
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
      | request_types            | baseamount     | currencyiso3a  | eci            |
      | THREEDQUERY AUTH         | 1000           | GBP            | 06             |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | should be none |
      | THREEDQUERY ACCOUNTCHECK | TODO           | TODO           | TODO           |


  Scenario Outline: TC_4 - Unavailable Frictionless Authentication from the Issuer - Card: VISA_V21_3DS_SDK_UNAVAILABLE_FRICTIONLESS_AUTH
    Given JS library configured by inline params THREE_DS_SDK_SUBMIT_ON_SUCCESS_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value                          |
      | requesttypedescriptions | <request_types>                |
      | sitereference           | test_js_automated_tests_tp_3ds |
    And User opens example page
    When User fills payment form with defined card VISA_V21_3DS_SDK_UNAVAILABLE_FRICTIONLESS_AUTH
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User fills 3ds SDK challenge with THREE_DS_CODE and submit
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value              |
      | errormessage         | TODO               |
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
      | request_types            | baseamount     | currencyiso3a  | eci            |
      | THREEDQUERY AUTH         | 1000           | GBP            | should be none |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | should be none |
      | THREEDQUERY ACCOUNTCHECK | TODO           | TODO           | TODO           |


  Scenario Outline: TC_5 - Rejected Frictionless Authentication by the Issuer - Card: VISA_V21_3DS_SDK_REJECTED_FRICTIONLESS_AUTH
    Given JS library configured by inline params THREE_DS_SDK_SUBMIT_ON_SUCCESS_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value                          |
      | requesttypedescriptions | <request_types>                |
      | sitereference           | test_js_automated_tests_tp_3ds |
    And User opens example page
    When User fills payment form with defined card VISA_V21_3DS_SDK_REJECTED_FRICTIONLESS_AUTH
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value              |
      | errormessage         | TODO               |
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
      | request_types            | baseamount     | currencyiso3a  | eci            |
      | THREEDQUERY AUTH         | 1000           | GBP            | should be none |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | should be none |
      | THREEDQUERY ACCOUNTCHECK | TODO           | TODO           | TODO           |


  Scenario Outline: TC_6 - Authentication failed by DS unavailability - Card: VISA_V21_3DS_SDK_DS_UNAVAILABLE
    Given JS library configured by inline params THREE_DS_SDK_SUBMIT_ON_SUCCESS_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value                          |
      | requesttypedescriptions | <request_types>                |
      | sitereference           | test_js_automated_tests_tp_3ds |
    And User opens example page
    When User fills payment form with defined card VISA_V21_3DS_SDK_DS_UNAVAILABLE
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value              |
      | errormessage         | TODO               |
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
      | request_types            | baseamount     | currencyiso3a  | eci  |
      | THREEDQUERY AUTH         | 1000           | GBP            | TODO |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | TODO |
      | THREEDQUERY ACCOUNTCHECK | TODO           | TODO           | TODO |


  Scenario Outline: TC_7 - Authentication failed by improper data in ARes message - Card: VISA_V21_3DS_SDK_IMPROPER_ARES_DATA
    Given JS library configured by inline params THREE_DS_SDK_SUBMIT_ON_SUCCESS_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value                          |
      | requesttypedescriptions | <request_types>                |
      | sitereference           | test_js_automated_tests_tp_3ds |
    And User opens example page
    When User fills payment form with defined card VISA_V21_3DS_SDK_IMPROPER_ARES_DATA
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value              |
      | errormessage         | TODO               |
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
      | request_types            | baseamount     | currencyiso3a  | eci  |
      | THREEDQUERY AUTH         | 1000           | GBP            | TODO |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | TODO |
      | THREEDQUERY ACCOUNTCHECK | TODO           | TODO           | TODO |


  Scenario Outline: TC_8 - Error not completed threeDSMethod - Card: VISA_V21_3DS_SDK_ACS_UNAVAILABLE
    Given JS library configured by inline params THREE_DS_SDK_SUBMIT_ON_SUCCESS_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value                          |
      | requesttypedescriptions | <request_types>                |
      | sitereference           | test_js_automated_tests_tp_3ds |
    And User opens example page
    When User fills payment form with defined card VISA_V21_3DS_SDK_ACS_UNAVAILABLE
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value              |
      | errormessage         | TODO               |
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
      | request_types            | baseamount     | currencyiso3a  | eci  |
      | THREEDQUERY AUTH         | 1000           | GBP            | TODO |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | TODO |
      | THREEDQUERY ACCOUNTCHECK | TODO           | TODO           | TODO |


  Scenario Outline: TC_9 -Successful Step Up Authentication - Card: VISA_V21_3DS_SDK_NON_FRICTIONLESS
    Given JS library configured by inline params THREE_DS_SDK_SUBMIT_ON_SUCCESS_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value                          |
      | requesttypedescriptions | <request_types>                |
      | sitereference           | test_js_automated_tests_tp_3ds |
    And User opens example page
    When User fills payment form with defined card VISA_V21_3DS_SDK_NON_FRICTIONLESS
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User fills 3ds SDK challenge with THREE_DS_CODE and submit
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value              |
      | errormessage         | TODO               |
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
      | request_types            | baseamount     | currencyiso3a  | eci            |
      | THREEDQUERY AUTH         | 1000           | GBP            | 05             |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | should be none |
      | THREEDQUERY ACCOUNTCHECK | TODO           | TODO           | TODO           |


  Scenario Outline: TC_10 - Failed Step Up Authentication - Card: VISA_V21_3DS_SDK_STEP_UP_AUTH_FAILED
    Given JS library configured by inline params THREE_DS_SDK_SUBMIT_ON_SUCCESS_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value                          |
      | requesttypedescriptions | <request_types>                |
      | sitereference           | test_js_automated_tests_tp_3ds |
    And User opens example page
    When User fills payment form with defined card VISA_V21_3DS_SDK_STEP_UP_AUTH_FAILED
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User fills 3ds SDK challenge with THREE_DS_CODE and submit
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value              |
      | errormessage         | TODO               |
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
      | request_types            | baseamount     | currencyiso3a  | eci            |
      | THREEDQUERY AUTH         | 1000           | GBP            | 07             |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | should be none |
      | THREEDQUERY ACCOUNTCHECK | TODO           | TODO           | TODO           |


  Scenario Outline: TC_11 - step up - Error on authentication - Card: VISA_V21_3DS_SDK_STEP_UP_AUTH_ERROR
    Given JS library configured by inline params THREE_DS_SDK_SUBMIT_ON_SUCCESS_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value                          |
      | requesttypedescriptions | <request_types>                |
      | sitereference           | test_js_automated_tests_tp_3ds |
    And User opens example page
    When User fills payment form with defined card VISA_V21_3DS_SDK_STEP_UP_AUTH_ERROR
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User fills 3ds SDK challenge with THREE_DS_CODE and submit
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value              |
      | errormessage         | TODO               |
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
      | request_types            | baseamount     | currencyiso3a  | eci            |
      | THREEDQUERY AUTH         | 1000           | GBP            | 07             |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | should be none |
      | THREEDQUERY ACCOUNTCHECK | TODO           | TODO           | TODO           |


  Scenario Outline: TC_12 - successful frictionless with require methodUrl - Card: VISA_V21_3DS_SDK_FRICTIONLESS_SUCCESS_METHOD_URL
    Given JS library configured by inline params THREE_DS_SDK_SUBMIT_ON_SUCCESS_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value                          |
      | requesttypedescriptions | <request_types>                |
      | sitereference           | test_js_automated_tests_tp_3ds |
    And User opens example page
    When User fills payment form with defined card VISA_V21_3DS_SDK_FRICTIONLESS_SUCCESS_METHOD_URL
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value              |
      | errormessage         | TODO               |
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
      | request_types            | baseamount     | currencyiso3a  | eci  |
      | THREEDQUERY AUTH         | 1000           | GBP            | TODO |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | TODO |
      | THREEDQUERY ACCOUNTCHECK | TODO           | TODO           | TODO |


  Scenario Outline: TC_13 - step up with require methodUrl - Card: VISA_V21_3DS_SDK_FRICTIONLESS_SUCCESS_METHOD_URL
    Given JS library configured by inline params THREE_DS_SDK_SUBMIT_ON_SUCCESS_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value                          |
      | requesttypedescriptions | <request_types>                |
      | sitereference           | test_js_automated_tests_tp_3ds |
    And User opens example page
    When User fills payment form with defined card VISA_V21_3DS_SDK_NON_FRICTIONLESS_METHOD_URL
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User fills 3ds SDK challenge with THREE_DS_CODE and submit
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value              |
      | errormessage         | TODO               |
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
      | request_types            | baseamount     | currencyiso3a  | eci  |
      | THREEDQUERY AUTH         | 1000           | GBP            | TODO |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | TODO |
      | THREEDQUERY ACCOUNTCHECK | TODO           | TODO           | TODO |


  Scenario Outline: TC_14 - successful frictionless with transaction timed out error for method url- Card: VISA_V21_3DS_SDK_TRANSACTION_TIMEOUT
    Given JS library configured by inline params THREE_DS_SDK_SUBMIT_ON_SUCCESS_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value                          |
      | requesttypedescriptions | <request_types>                |
      | sitereference           | test_js_automated_tests_tp_3ds |
    And User opens example page
    When User fills payment form with defined card VISA_V21_3DS_SDK_TRANSACTION_TIMEOUT
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value              |
      | errormessage         | TODO               |
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
      | request_types            | baseamount     | currencyiso3a  | eci  |
      | THREEDQUERY AUTH         | 1000           | GBP            | TODO |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | TODO |
      | THREEDQUERY ACCOUNTCHECK | TODO           | TODO           | TODO |


  Scenario Outline: TC_4a - successful frictionless with transaction timed out at athe ACS - Card: VISA_V21_3DS_SDK_FRICTIONLESS_TRANSACTION_TIMEOUT_ACS
    Given JS library configured by inline params THREE_DS_SDK_SUBMIT_ON_SUCCESS_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value                          |
      | requesttypedescriptions | <request_types>                |
      | sitereference           | test_js_automated_tests_tp_3ds |
    And User opens example page
    When User fills payment form with defined card VISA_V21_3DS_SDK_FRICTIONLESS_TRANSACTION_TIMEOUT_ACS
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value              |
      | errormessage         | TODO               |
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
      | request_types            | baseamount     | currencyiso3a  | eci  |
      | THREEDQUERY AUTH         | 1000           | GBP            | 07   |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | TODO |
      | THREEDQUERY ACCOUNTCHECK | TODO           | TODO           | TODO |


  Scenario Outline: TC_4b - successful frictionless with suspected fraud - Card: VISA_V21_3DS_SDK_FRICTIONLESS_SUSPECTED_FRAUD
    Given JS library configured by inline params THREE_DS_SDK_SUBMIT_ON_SUCCESS_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value                          |
      | requesttypedescriptions | <request_types>                |
      | sitereference           | test_js_automated_tests_tp_3ds |
    And User opens example page
    When User fills payment form with defined card VISA_V21_3DS_SDK_FRICTIONLESS_SUSPECTED_FRAUD
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value              |
      | errormessage         | TODO               |
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
      | request_types            | baseamount     | currencyiso3a  | eci  |
      | THREEDQUERY AUTH         | 1000           | GBP            | 07   |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | TODO |
      | THREEDQUERY ACCOUNTCHECK | TODO           | TODO           | TODO |


  Scenario Outline: TC_4c - successful frictionless with card holder not enrolled in service - Card: VISA_V21_3DS_SDK_FRICTIONLESS_NOT_ENROLLED
    Given JS library configured by inline params THREE_DS_SDK_SUBMIT_ON_SUCCESS_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value                          |
      | requesttypedescriptions | <request_types>                |
      | sitereference           | test_js_automated_tests_tp_3ds |
    And User opens example page
    When User fills payment form with defined card VISA_V21_3DS_SDK_FRICTIONLESS_NOT_ENROLLED
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value              |
      | errormessage         | TODO               |
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
      | request_types            | baseamount     | currencyiso3a  | eci  |
      | THREEDQUERY AUTH         | 1000           | GBP            | 07   |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | TODO |
      | THREEDQUERY ACCOUNTCHECK | TODO           | TODO           | TODO |


  Scenario Outline: TC_4d - successful frictionless with transaction timed out at the ACS - Card: VISA_V21_3DS_SDK_FRICTIONLESS_TRANSACTION_TIMEOUT_2_ACS
    Given JS library configured by inline params THREE_DS_SDK_SUBMIT_ON_SUCCESS_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value                          |
      | requesttypedescriptions | <request_types>                |
      | sitereference           | test_js_automated_tests_tp_3ds |
    And User opens example page
    When User fills payment form with defined card VISA_V21_3DS_SDK_FRICTIONLESS_TRANSACTION_TIMEOUT_2_ACS
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value              |
      | errormessage         | TODO               |
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
      | request_types            | baseamount     | currencyiso3a  | eci  |
      | THREEDQUERY AUTH         | 1000           | GBP            | 07   |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | TODO |
      | THREEDQUERY ACCOUNTCHECK | TODO           | TODO           | TODO |


  Scenario Outline: TC_4e - successful frictionless with non-payment transaction not supported - Card: VISA_V21_3DS_SDK_FRICTIONLESS_TRANSACTION_NON_PAYMENT
    Given JS library configured by inline params THREE_DS_SDK_SUBMIT_ON_SUCCESS_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value                          |
      | requesttypedescriptions | <request_types>                |
      | sitereference           | test_js_automated_tests_tp_3ds |
    And User opens example page
    When User fills payment form with defined card VISA_V21_3DS_SDK_FRICTIONLESS_TRANSACTION_NON_PAYMENT
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value              |
      | errormessage         | TODO               |
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
      | request_types            | baseamount     | currencyiso3a  | eci  |
      | THREEDQUERY AUTH         | 1000           | GBP            | 07   |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | TODO |
      | THREEDQUERY ACCOUNTCHECK | TODO           | TODO           | TODO |


  Scenario Outline: TC_4f - successful frictionless with 3RI transaction not supported - Card: VISA_V21_3DS_SDK_FRICTIONLESS_3RI_TRANSACTION_NOT_SUPPORTED
    Given JS library configured by inline params THREE_DS_SDK_SUBMIT_ON_SUCCESS_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value                          |
      | requesttypedescriptions | <request_types>                |
      | sitereference           | test_js_automated_tests_tp_3ds |
    And User opens example page
    When User fills payment form with defined card VISA_V21_3DS_SDK_FRICTIONLESS_3RI_TRANSACTION_NOT_SUPPORTED
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value              |
      | errormessage         | TODO               |
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
      | request_types            | baseamount     | currencyiso3a  | eci  |
      | THREEDQUERY AUTH         | 1000           | GBP            | 07   |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | TODO |
      | THREEDQUERY ACCOUNTCHECK | TODO           | TODO           | TODO |
