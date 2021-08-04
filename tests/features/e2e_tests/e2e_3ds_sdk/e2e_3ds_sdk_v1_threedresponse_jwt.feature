
Feature: 3ds SDK v1 E2E tests - v1 Threedresponse
  As a user
  I want to use card payments method
  In order to check 3ds SDK integration


  Background:
    Given JS library configured by inline config BASIC_CONFIG

  Scenario Outline: Sending threedresponse JWT to merchants with Request types: <request_types>
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_V1_3DS_SDK_NON_FRICTIONLESS
    And User clicks Pay button
    And User see 3ds SDK challenge for v1 is displayed
    And User fills 3ds SDK v1 challenge with THREE_DS_CODE_V1_SUCCESS and submit
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: True
    And THREEDRESPONSE contains paramaters
      | key              | value               |
      | ActionCode       | COMPLETED           |
      | ErrorNumber      | 0                   |
      | ErrorDescription | Challenge completed |
    Examples:
      | request_types            |
      | THREEDQUERY              |
      | ACCOUNTCHECK THREEDQUERY |
      | RISKDEC THREEDQUERY      |


  Scenario Outline: Sending threedresponse JWT to merchants with Request types: <request_types>
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    When User fills payment form with defined card VISA_V1_3DS_SDK_NON_FRICTIONLESS
    And User clicks Pay button
    And User see 3ds SDK challenge for v1 is displayed
    And User fills 3ds SDK v1 challenge with THREE_DS_CODE_V1_SUCCESS and submit
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: True
    And THREEDRESPONSE contains paramaters
      | key              | value               |
      | ActionCode       | COMPLETED           |
      | ErrorNumber      | 0                   |
      | ErrorDescription | Challenge completed |
    Examples:
      | request_types            |
      | THREEDQUERY              |
      | ACCOUNTCHECK THREEDQUERY |
      | RISKDEC THREEDQUERY      |
