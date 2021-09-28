@3ds_sdk_v1.0_VISA
@3ds_sdk_v1.0
@3ds_sdk
Feature: 3ds SDK v1 E2E tests with redirection after payment - Visa
  As a user
  I want to use card payments method
  In order to check 3ds SDK integration


  Scenario Outline: TC_1 - Successful Step Up Authentication - Card: MASTERCARD_V1_3DS_SDK_NON_FRICTIONLESS
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key             | value |
      | submitOnSuccess | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value             |
      | requesttypedescriptions | <request_types>   |
      | sitereference           | trustthreeds76424 |
      | customercountryiso2a    | GB                |
      | billingcountryiso2a     | GB                |
    And User opens example page
    And User waits for form inputs to be loaded
    When User fills payment form with defined card VISA_V1_3DS_SDK_NON_FRICTIONLESS
    And User clicks Pay button
    And User see 3ds SDK challenge for v1 is displayed
    And User fills 3ds SDK v1 challenge with THREE_DS_CODE_V1_SUCCESS and submit
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | <baseamount>                            |
      | currencyiso3a        | <currencyiso3a>                         |
      | errorcode            | 0                                       |
      | status               | <status>                                |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | enrolled             | <enrolled>                              |
      | settlestatus         | 0                                       |
      | eci                  | <eci>                                   |

    Examples:
      | request_types            | baseamount     | currencyiso3a  | eci            | status         | enrolled |
      | THREEDQUERY AUTH         | 1000           | GBP            | 05             | Y              | Y        |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | should be none | should be none | Y        |
      | THREEDQUERY ACCOUNTCHECK | 1000           | GBP            | 05             | Y              | Y        |


  Scenario Outline: TC_2 - attempted Step Up authentication - Card: MASTERCARD_V1_3DS_SDK_NON_FRICTIONLESS
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key             | value |
      | submitOnSuccess | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value             |
      | requesttypedescriptions | <request_types>   |
      | sitereference           | trustthreeds76424 |
      | customercountryiso2a    | GB                |
      | billingcountryiso2a     | GB                |
    And User opens example page
    And User waits for form inputs to be loaded
    When User fills payment form with defined card VISA_V1_3DS_SDK_NON_FRICTIONLESS
    And User clicks Pay button
    And User see 3ds SDK challenge for v1 is displayed
    And User fills 3ds SDK v1 challenge with THREE_DS_CODE_V1_ATTEMPT and submit
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | <baseamount>                            |
      | currencyiso3a        | <currencyiso3a>                         |
      | errorcode            | 0                                       |
      | status               | <status>                                |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | enrolled             | <enrolled>                              |
      | settlestatus         | 0                                       |
      | eci                  | <eci>                                   |

    Examples:
      | request_types            | baseamount     | currencyiso3a  | eci            | status         | enrolled |
      | THREEDQUERY AUTH         | 1000           | GBP            | 06             | A              | Y        |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | should be none | should be none | Y        |
      | THREEDQUERY ACCOUNTCHECK | 1000           | GBP            | 06             | A              | Y        |


  Scenario Outline: TC_3 - unavailable Step Up authentication - Card: MASTERCARD_V1_3DS_SDK_NON_FRICTIONLESS
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key             | value |
      | submitOnSuccess | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value             |
      | requesttypedescriptions | <request_types>   |
      | sitereference           | trustthreeds76424 |
      | customercountryiso2a    | GB                |
      | billingcountryiso2a     | GB                |
    And User opens example page
    And User waits for form inputs to be loaded
    When User fills payment form with defined card VISA_V1_3DS_SDK_NON_FRICTIONLESS
    And User clicks Pay button
    And User see 3ds SDK challenge for v1 is displayed
    And User fills 3ds SDK v1 challenge with THREE_DS_CODE_V1_UNAVAILABLE and submit
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | <baseamount>                            |
      | currencyiso3a        | <currencyiso3a>                         |
      | errorcode            | 0                                       |
      | status               | <status>                                |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | enrolled             | <enrolled>                              |
      | settlestatus         | 0                                       |
      | eci                  | <eci>                                   |

    Examples:
      | request_types            | baseamount     | currencyiso3a  | eci            | status         | enrolled |
      | THREEDQUERY AUTH         | 1000           | GBP            | should be none | U              | Y        |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | should be none | should be none | Y        |
      | THREEDQUERY ACCOUNTCHECK | 1000           | GBP            | should be none | U              | Y        |


  Scenario Outline: TC_4 - Failed Step Up Authentication - Card: MASTERCARD_V1_3DS_SDK_NON_FRICTIONLESS
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key          | value |
      | <e2e_config> | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value             |
      | requesttypedescriptions | <request_types>   |
      | sitereference           | trustthreeds76424 |
      | customercountryiso2a    | GB                |
      | billingcountryiso2a     | GB                |
    And User opens example page
    And User waits for form inputs to be loaded
    When User fills payment form with defined card VISA_V1_3DS_SDK_NON_FRICTIONLESS
    And User clicks Pay button
    And User see 3ds SDK challenge for v1 is displayed
    And User fills 3ds SDK v1 challenge with THREE_DS_CODE_V1_FAILED and submit
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value              |
      | errormessage         | <errormessage>     |
      | baseamount           | <baseamount>       |
      | currencyiso3a        | <currencyiso3a>    |
      | errorcode            | <errorcode>        |
      | status               | <status>           |
      | transactionreference | should not be none |
      | jwt                  | should not be none |
      | enrolled             | <enrolled>         |
      | settlestatus         | <settlestatus>     |
      | eci                  | <eci>              |

    Examples:
      | request_types            | e2e_config      | errormessage                            | baseamount     | currencyiso3a  | errorcode | eci            | status         | enrolled | settlestatus |
      | THREEDQUERY AUTH         | submitOnError   | Unauthenticated                         | 1000           | GBP            | 60022     | should be none | N              | Y        | 3            |
      | ACCOUNTCHECK THREEDQUERY | submitOnSuccess | Payment has been successfully processed | should be none | should be none | 0         | should be none | should be none | Y        | 0            |
      | THREEDQUERY ACCOUNTCHECK | submitOnError   | Unauthenticated                         | 1000           | GBP            | 60022     | should be none | N              | Y        | 0            |


#VISA not supported:
#This is because the mock doesnt support VPAY as a payment type.
#  Scenario Outline: TC_5 - Not enrolled - Card: MASTERCARD_V1_3DS_SDK_NOT_ENROLLED
#    Given JS library configured with BASIC_CONFIG and additional attributes
#      | key             | value |
#      | submitOnSuccess | true  |
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value             |
#      | requesttypedescriptions | <request_types>   |
#      | sitereference           | trustthreeds76424 |
#      | customercountryiso2a    | GB                |
#      | billingcountryiso2a     | GB                |
#    And User opens example page
#    And User waits for form inputs to be loaded
#    When User fills payment form with defined card VISA_V1_3DS_SDK_NOT_ENROLLED
#    And User clicks Pay button
#    Then User will be sent to page with url "www.example.com" having params
#      | key                  | value                                   |
#      | errormessage         | Payment has been successfully processed |
#      | baseamount           | <baseamount>                            |
#      | currencyiso3a        | <currencyiso3a>                         |
#      | errorcode            | 0                                       |
#      | status               | <status>                                |
#      | transactionreference | should not be none                      |
#      | jwt                  | should not be none                      |
#      | enrolled             | <enrolled>                              |
#      | settlestatus         | 0                                       |
#      | eci                  | <eci>                                   |
#
#    Examples:
#      | request_types            | baseamount     | currencyiso3a  | eci            | status         | enrolled |
#      | THREEDQUERY AUTH         | 1000           | GBP            | should be none | should be none | N        |
#      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | should be none | should be none | N        |
#      | THREEDQUERY ACCOUNTCHECK | 1000           | GBP            | should be none | should be none | N        |
