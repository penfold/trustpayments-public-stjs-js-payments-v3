@3ds_sdk
Feature: Cancel payment with 3ds SDK library
  As a user
  I want to be able to cancel 3ds payment
  So that I can interrupt payment process


  Scenario Outline: Cancel payment for INLINE modal
    Given JS library configured by inline params THREE_DS_SDK_INLINE_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | trustthreeds76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_V21_3DS_SDK_NON_FRICTIONLESS
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User clicks Cancel button on 3ds SDK challenge in INLINE mode
    Then User will see payment status information: "Payment has been cancelled"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | cancel        |
    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |


  Scenario Outline: Cancel payment for POPUP modal
    Given JS library configured by inline params THREE_DS_SDK_POPUP_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | trustthreeds76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_V21_3DS_SDK_NON_FRICTIONLESS
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User clicks Cancel button on 3ds SDK challenge in POPUP mode
    Then User will see payment status information: "Payment has been cancelled"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | cancel        |
    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |


  Scenario: Filling and submitting 3ds challenge with incorrect secure code
    Given JS library configured by inline params THREE_DS_SDK_INLINE_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | THREEDQUERY AUTH    |
      | sitereference           | trustthreeds76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_V21_3DS_SDK_NON_FRICTIONLESS
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User fills 3ds SDK challenge with THREE_DS_INCORRECT_CODE and submit
    Then User see challenge modal error message "The code entered was incorrect. Please try again."


  Scenario Outline: Cancel payment after filling and submitting 3ds challenge with INLINE configuration
    Given JS library configured by inline params THREE_DS_SDK_INLINE_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | trustthreeds76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_V21_3DS_SDK_NON_FRICTIONLESS
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User fills 3ds SDK challenge with THREE_DS_INCORRECT_CODE and submit
    And User clicks Cancel button on 3ds SDK challenge in INLINE mode
    Then User will see payment status information: "Payment has been cancelled"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | cancel        |
    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |


  Scenario Outline: Cancel - locale translation
    Given JS library configured by inline params THREE_DS_SDK_POPUP_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | THREEDQUERY AUTH   |
      | locale                  | <LOCALE_CODE>      |
      | sitereference           | trustthreeds76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    And User fills payment form with defined card MASTERCARD_V21_3DS_SDK_NON_FRICTIONLESS
    When User clicks Pay button
    And User see 3ds SDK challenge is displayed
    Then User see 3ds SDK challenge POPUP mode "cancel" button translated into <LOCALE_CODE>

    @3ds_sdk_smoke
    Examples:
      | LOCALE_CODE |
      | en_GB       |
      | fr_FR       |

    Examples:
      | LOCALE_CODE |
      | en_US       |
      | cy_GB       |
      | da_DK       |
      | de_DE       |
      | es_ES       |
      | nl_NL       |
      | no_NO       |
      | sv_SE       |


  @3ds_sdk_smoke
  Scenario: Cancel - locale translation override by config
    Given JS library configured by inline params THREE_DS_SDK_POPUP_TRANSLATIONS_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | THREEDQUERY AUTH   |
      | sitereference           | trustthreeds76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    And User fills payment form with defined card MASTERCARD_V21_3DS_SDK_NON_FRICTIONLESS
    When User clicks Pay button
    And User see 3ds SDK challenge is displayed
    Then User see 3ds SDK challenge POPUP mode "cancel" button translation is "INTENTIONALLY_HARDCODED_VALUE"
