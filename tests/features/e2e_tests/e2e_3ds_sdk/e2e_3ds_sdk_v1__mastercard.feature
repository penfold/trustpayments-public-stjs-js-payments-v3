@3ds_sdk_v1.0_MASTERCARD
Feature: 3ds SDK v1 E2E tests - MasterCard
  As a user
  I want to use card payments method
  In order to check 3ds SDK integration


  Scenario Outline: TC_1 - Successful Step Up Authentication - Card: MASTERCARD_V1_3DS_SDK_NON_FRICTIONLESS
    Given JS library configured by inline params THREE_DS_SDK_BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_V1_3DS_SDK_NON_FRICTIONLESS
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User fills 3ds SDK challenge with THREE_DS_CODE_V1_SUCCESS and submit
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |
    And User will see that Submit button is "disabled" after payment
    And User will see that ALL input fields are "disabled"

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |
      | THREEDQUERY ACCOUNTCHECK |


  Scenario Outline: TC_2 - attempted Step Up authentication - Card: MASTERCARD_V1_3DS_SDK_NON_FRICTIONLESS
    Given JS library configured by inline params THREE_DS_SDK_BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_V1_3DS_SDK_NON_FRICTIONLESS
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User fills 3ds SDK challenge with THREE_DS_CODE_V1_ATTEMPT and submit
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |
    And User will see that Submit button is "disabled" after payment
    And User will see that ALL input fields are "disabled"

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |
      | THREEDQUERY ACCOUNTCHECK |


  Scenario Outline: TC_3 - unavailable Step Up authentication - Card: MASTERCARD_V1_3DS_SDK_NON_FRICTIONLESS
    Given JS library configured by inline params THREE_DS_SDK_BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_V1_3DS_SDK_NON_FRICTIONLESS
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User fills 3ds SDK challenge with THREE_DS_CODE_V1_UNAVAILABLE and submit
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |
    And User will see that Submit button is "disabled" after payment
    And User will see that ALL input fields are "disabled"

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |
      | THREEDQUERY ACCOUNTCHECK |


  Scenario Outline: TC_4 - Failed Step Up Authentication - Card: MASTERCARD_V1_3DS_SDK_NON_FRICTIONLESS
    Given JS library configured by inline params THREE_DS_SDK_BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_V1_3DS_SDK_NON_FRICTIONLESS
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User fills 3ds SDK challenge with THREE_DS_CODE_V1_FAILED and submit
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |
    And User will see that Submit button is "disabled" after payment
    And User will see that ALL input fields are "disabled"

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |
      | THREEDQUERY ACCOUNTCHECK |


  Scenario Outline: TC_5 - Not enrolled - Card: MASTERCARD_V1_3DS_SDK_NOT_ENROLLED
    Given JS library configured by inline params THREE_DS_SDK_BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_V1_3DS_SDK_NOT_ENROLLED
    And User clicks Pay button
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |
    And User will see that Submit button is "disabled" after payment
    And User will see that ALL input fields are "disabled"

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |
      | THREEDQUERY ACCOUNTCHECK |
