@3ds_sdk_v1.0_VISA
Feature: 3ds SDK v1 E2E tests with redirection after payment - Visa
  As a user
  I want to use card payments method
  In order to check 3ds SDK integration


  Background:
    Given JS library configured by inline config THREE_DS_SDK_SUBMIT_ON_SUCCESS_CONFIG


  Scenario Outline: TC_1 - Successful Step Up Authentication - Card: VISA_V1_3DS_SDK_NON_FRICTIONLESS
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    And User waits for whole form to be loaded
    When User fills payment form with defined card VISA_V1_3DS_SDK_NON_FRICTIONLESS
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User fills 3ds SDK challenge with THREE_DS_CODE_V1_SUCCESS and submit
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
      | THREEDQUERY AUTH         | 1000           | GBP            | 00             |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | should be none |
      | THREEDQUERY ACCOUNTCHECK | TODO           | TODO           | TODO           |

  Scenario Outline: TC_2 - attempted Step Up authentication - Card: VISA_V1_3DS_SDK_NON_FRICTIONLESS
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    And User waits for whole form to be loaded
    When User fills payment form with defined card VISA_V1_3DS_SDK_NON_FRICTIONLESS
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User fills 3ds SDK challenge with THREE_DS_CODE_V1_ATTEMPT and submit
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
      | THREEDQUERY AUTH         | 1000           | GBP            | 00             |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | should be none |
      | THREEDQUERY ACCOUNTCHECK | TODO           | TODO           | TODO           |


  Scenario Outline: TC_3 - unavailable Step Up authentication - Card: VISA_V1_3DS_SDK_NON_FRICTIONLESS
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    And User waits for whole form to be loaded
    When User fills payment form with defined card VISA_V1_3DS_SDK_NON_FRICTIONLESS
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User fills 3ds SDK challenge with THREE_DS_CODE_V1_UNAVAILABLE and submit
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
      | THREEDQUERY AUTH         | 1000           | GBP            | 00             |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | should be none |
      | THREEDQUERY ACCOUNTCHECK | TODO           | TODO           | TODO           |


  Scenario Outline: TC_4 - Failed Step Up Authentication - Card: VISA_V1_3DS_SDK_NON_FRICTIONLESS
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    And User waits for whole form to be loaded
    When User fills payment form with defined card VISA_V1_3DS_SDK_NON_FRICTIONLESS
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User fills 3ds SDK challenge with THREE_DS_CODE_V1_FAILED and submit
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
      | THREEDQUERY AUTH         | 1000           | GBP            | 00             |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | should be none |
      | THREEDQUERY ACCOUNTCHECK | TODO           | TODO           | TODO           |


  Scenario Outline: TC_5 - Not enrolled - Card: VISA_V1_3DS_SDK_NOT_ENROLLED
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    And User waits for whole form to be loaded
    When User fills payment form with defined card VISA_V1_3DS_SDK_NOT_ENROLLED
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
      | THREEDQUERY AUTH         | 1000           | GBP            | 00             |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | should be none |
      | THREEDQUERY ACCOUNTCHECK | TODO           | TODO           | TODO           |
