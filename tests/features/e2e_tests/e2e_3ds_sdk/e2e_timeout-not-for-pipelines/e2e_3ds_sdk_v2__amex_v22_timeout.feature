@3ds_sdk_v2.0_AMEX_V22
@3ds_sdk_v2.0
Feature: 3ds SDK v2 E2E tests - AMEX v2.2
  As a user
  I want to use card payments method
  In order to check 3ds SDK integration

  Background:
    Given JS library configured by inline config BASIC_CONFIG

  Scenario Outline: TC_6b - Authentication success after retry when DS timeout in first call - Card: AMEX_V22 Request types: <request_types>
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value             |
      | requesttypedescriptions | <request_types>   |
      | sitereference           | trustthreeds76424 |
      | customercountryiso2a    | GB                |
      | billingcountryiso2a     | GB                |
    And User opens example page
    And User waits for form inputs to be loaded
    When User fills payment form with defined card AMEX_V22_3DS_SDK_DS_UNAVAILABLE_RETRY
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |
    And User will see that Pay button is "disabled"
    And User will see that ALL input fields are "disabled"

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |
      | THREEDQUERY ACCOUNTCHECK |


  Scenario Outline: TC_14 - successful frictionless with transaction timed out error for method url- Card: AMEX_V22 Request types: <request_types>
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value             |
      | requesttypedescriptions | <request_types>   |
      | sitereference           | trustthreeds76424 |
      | customercountryiso2a    | GB                |
      | billingcountryiso2a     | GB                |
    And User opens example page
    And User waits for form inputs to be loaded
    When User fills payment form with defined card AMEX_V22_3DS_SDK_TRANSACTION_TIMEOUT
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |
    And User will see that Pay button is "disabled"
    And User will see that ALL input fields are "disabled"

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |
      | THREEDQUERY ACCOUNTCHECK |


  Scenario Outline: TC_4a - transaction timed out at athe ACS - Card: AMEX_V22 Request types: <request_types>
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value             |
      | requesttypedescriptions | <request_types>   |
      | sitereference           | trustthreeds76424 |
      | customercountryiso2a    | GB                |
      | billingcountryiso2a     | GB                |
    And User opens example page
    And User waits for form inputs to be loaded
    When User fills payment form with defined card AMEX_V22_3DS_SDK_TRANS_STATUS_AUTH_FAILED
    And User clicks Pay button
    And User waits for ACS mock timeout
    Then User will see notification frame text: "<payment_status>"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | <callback>    |
    And User will see that Pay button is "<state>"
    And User will see that ALL input fields are "<state>"

    Examples:
      | request_types            | payment_status                          | callback | state    |
      | THREEDQUERY AUTH         | Unauthenticated                         | error    | enabled  |
      | ACCOUNTCHECK THREEDQUERY | Payment has been successfully processed | success  | disabled |
      | THREEDQUERY ACCOUNTCHECK | Unauthenticated                         | error    | enabled  |


  Scenario Outline: TC_4d - transaction timed out at the ACS - Card: AMEX_V22 Request types: <request_types>
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value             |
      | requesttypedescriptions | <request_types>   |
      | sitereference           | trustthreeds76424 |
      | customercountryiso2a    | GB                |
      | billingcountryiso2a     | GB                |
    And User opens example page
    And User waits for form inputs to be loaded
    When User fills payment form with defined card AMEX_V22_3DS_SDK_TRANS_STATUS_TRANSACTION_TIMEOUT_AT_ACS
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |
    And User will see that Pay button is "disabled"
    And User will see that ALL input fields are "disabled"

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |
      | THREEDQUERY ACCOUNTCHECK |
