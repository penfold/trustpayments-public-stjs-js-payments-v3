@3ds_sdk
Feature: 3ds SDK library challenge V2
  As a user
  I want to use card payments method
  In order to check 3ds SDK integration


  Scenario Outline: Successful authentication with correct confirmation code - submitOnSuccess and request type: <request_types>
    Given JS library configured by inline params <config> and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_3DS_SDK_FRICTIONLESS
    And User clicks Pay button
    And User fills 3ds SDK challenge with THREE_DS_CODE and submit
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | 2000                                    |
      | currencyiso3a        | GBP                                     |
      | errorcode            | 0                                       |
      | status               | Y                                       |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | enrolled             | Y                                       |
      | settlestatus         | 0                                       |
      | eci                  | 05                                      |



    Examples:
      | config                                           | request_types            |
      | THREE_DS_LIBRARY_SUBMIT_ON_SUCCESS_INLINE_CONFIG | THREEDQUERY AUTH         |
      | THREE_DS_LIBRARY_SUBMIT_ON_SUCCESS_INLINE_CONFIG | ACCOUNTCHECK THREEDQUERY |
      | THREE_DS_LIBRARY_SUBMIT_ON_SUCCESS_POPUP_CONFIG  | THREEDQUERY AUTH         |
      | THREE_DS_LIBRARY_SUBMIT_ON_SUCCESS_POPUP_CONFIG  | ACCOUNTCHECK THREEDQUERY |


  Scenario Outline: Unsuccessful authentication with incorrect confirmation code - submitOnError and request type: <request_types>
    Given JS library configured by inline params <config> and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_3DS_SDK_FRICTIONLESS
    And User clicks Pay button
    And User fills 3ds SDK challenge with THREE_DS_INCORRECT_CODE and submit
    Then Invalid confirmation code label is visible

    Examples:
      | config                                           | request_types            |
      | THREE_DS_LIBRARY_SUBMIT_ON_SUCCESS_INLINE_CONFIG | THREEDQUERY AUTH         |
      | THREE_DS_LIBRARY_SUBMIT_ON_SUCCESS_INLINE_CONFIG | ACCOUNTCHECK THREEDQUERY |
      | THREE_DS_LIBRARY_SUBMIT_ON_SUCCESS_POPUP_CONFIG  | THREEDQUERY AUTH         |
      | THREE_DS_LIBRARY_SUBMIT_ON_SUCCESS_POPUP_CONFIG  | ACCOUNTCHECK THREEDQUERY |



  Scenario Outline: Successful authentication with correct confirmation code - submitOnSuccess and request type: <request_types>
    Given JS library configured by inline params <config> and jwt BASE_JWT with additional attributes
      | key                     | value                    |
      | requesttypedescriptions | <request_types>          |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_3DS_SDK_NON_FRICTIONLESS
    And User clicks Pay button
    And User fills 3ds SDK challenge with THREE_DS_CODE and submit
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | 2000                                    |
      | currencyiso3a        | GBP                                     |
      | errorcode            | 0                                       |
      | status               | Y                                       |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | enrolled             | Y                                       |
      | settlestatus         | 0                                       |
      | eci                  | 05                                      |

    Examples:
      | config                                           | request_types            |
      | THREE_DS_LIBRARY_SUBMIT_ON_SUCCESS_INLINE_CONFIG | THREEDQUERY AUTH         |
      | THREE_DS_LIBRARY_SUBMIT_ON_SUCCESS_INLINE_CONFIG | ACCOUNTCHECK THREEDQUERY |
      | THREE_DS_LIBRARY_SUBMIT_ON_SUCCESS_POPUP_CONFIG  | THREEDQUERY AUTH         |
      | THREE_DS_LIBRARY_SUBMIT_ON_SUCCESS_POPUP_CONFIG  | ACCOUNTCHECK THREEDQUERY |


  Scenario Outline: Unsuccessful authentication with incorrect confirmation code - submitOnError and request type: <request_types>
    Given JS library configured by inline params <config> and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_3DS_SDK_NON_FRICTIONLESS
    And User clicks Pay button
    And User fills 3ds SDK challenge with THREE_DS_INCORRECT_CODE and submit
    Then Invalid confirmation code label is visible

    Examples:
      | config                                           | request_types            |
      | THREE_DS_LIBRARY_SUBMIT_ON_SUCCESS_INLINE_CONFIG | THREEDQUERY AUTH         |
      | THREE_DS_LIBRARY_SUBMIT_ON_SUCCESS_INLINE_CONFIG | ACCOUNTCHECK THREEDQUERY |
      | THREE_DS_LIBRARY_SUBMIT_ON_SUCCESS_POPUP_CONFIG  | THREEDQUERY AUTH         |
      | THREE_DS_LIBRARY_SUBMIT_ON_SUCCESS_POPUP_CONFIG  | ACCOUNTCHECK THREEDQUERY |

