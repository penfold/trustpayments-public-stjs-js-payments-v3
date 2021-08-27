@3ds_sdk_v2.0_MASTERCARD_V21
@3ds_sdk_v2.0
Feature: 3ds SDK v2 E2E tests with redirection after payment - MasterCard v2.1
  As a user
  I want to use card payments method
  In order to check 3ds SDK integration


  Scenario Outline: TC_6b - Authentication success after retry when DS timeout in first call - Card: MASTERCARD_V21 Request types: <request_types>
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
    And User waits for whole form to be loaded
    When User fills payment form with defined card MASTERCARD_V21_3DS_SDK_DS_UNAVAILABLE_RETRY
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


  Scenario Outline: TC_14 - successful frictionless with transaction timed out error for method url- Card: MASTERCARD_V21 Request types: <request_types>
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
    And User waits for whole form to be loaded
    When User fills payment form with defined card MASTERCARD_V21_3DS_SDK_TRANSACTION_TIMEOUT
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


  Scenario Outline: TC_4a - successful frictionless with transaction timed out at athe ACS - Card: MASTERCARD_V21 Request types: <request_types>
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
    And User waits for whole form to be loaded
    When User fills payment form with defined card MASTERCARD_V21_3DS_SDK_TRANS_STATUS_AUTH_FAILED
    And User clicks Pay button
    And User waits to be sent into page with url "www.example.com" after ACS mock timeout
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


  Scenario Outline: TC_4d - successful frictionless with transaction timed out at the ACS - Card: MASTERCARD_V21 Request types: <request_types>
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
    And User waits for whole form to be loaded
    When User fills payment form with defined card MASTERCARD_V21_3DS_SDK_TRANS_STATUS_TRANSACTION_TIMEOUT_AT_ACS
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
