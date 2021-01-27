@cardinal_commerce_v2.0_MASTERCARD
Feature: Cardinal Commerce E2E tests v2 - MasterCard
  As a user
  I want to use card payments method
  In order to check Cardinal Commerce integration

  @base_config @cardinal_commerce_v2.0
  Scenario Outline: TC_1 - Successful Frictionless Authentication - Card: MASTERCARD_SUCCESSFUL_FRICTIONLESS_AUTH
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_SUCCESSFUL_FRICTIONLESS_AUTH
    And User clicks Pay button
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And "submit" callback is called only once
    And "success" callback is called only once
    And User will see that Submit button is "disabled" after payment
    And User will see that ALL input fields are "disabled"

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |


  @base_config @cardinal_commerce_v2.0
  Scenario Outline: TC_2 - Failed Frictionless Authentication - Card: MASTERCARD_FAILED_FRICTIONLESS_AUTH
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_FAILED_FRICTIONLESS_AUTH
    And User clicks Pay button
    Then User will see payment status information: "<payment_status>"
    And User will see that notification frame has "<color>" color
    And "submit" callback is called only once
    And "<callback>" callback is called only once
    And User will see that Submit button is "<state>" after payment
    And User will see that ALL input fields are "<state>"

    Examples:
      | request_types            | payment_status                          | color | callback | state    |
      | THREEDQUERY AUTH         | Unauthenticated                         | red   | error    | enabled  |
      | ACCOUNTCHECK THREEDQUERY | Payment has been successfully processed | green | success  | disabled |


  @base_config @cardinal_commerce_v2.0
  Scenario Outline: TC_3 - Attempts Stand-In Frictionless Authentication - Card: MASTERCARD_FRICTIONLESS
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_FRICTIONLESS
    And User clicks Pay button
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And "submit" callback is called only once
    And "success" callback is called only once
    And User will see that Submit button is "disabled" after payment
    And User will see that ALL input fields are "disabled"

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |


  @base_config @cardinal_commerce_v2.0
  Scenario Outline: TC_4 - Unavailable Frictionless Authentication from the Issuer - Card: MASTERCARD_UNAVAILABLE_FRICTIONLESS_AUTH
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_UNAVAILABLE_FRICTIONLESS_AUTH
    And User clicks Pay button
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And "submit" callback is called only once
    And "success" callback is called only once
    And User will see that Submit button is "disabled" after payment
    And User will see that ALL input fields are "disabled"

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |


  @base_config @cardinal_commerce_v2.0
  Scenario Outline: TC_5 - Rejected Frictionless Authentication by the Issuer - Card: MASTERCARD_REJECTED_FRICTIONLESS_AUTH
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_REJECTED_FRICTIONLESS_AUTH
    And User clicks Pay button
    Then User will see payment status information: "<payment_status>"
    And User will see that notification frame has "<color>" color
    And "submit" callback is called only once
    And "<callback>" callback is called only once

    Examples:
      | request_types            | payment_status                          | color | callback |
      | THREEDQUERY AUTH         | Unauthenticated                         | red   | error    |
      | ACCOUNTCHECK THREEDQUERY | Payment has been successfully processed | green | success  |


  @base_config @cardinal_commerce_v2.0
  Scenario Outline: TC_6 - Authentication Not Available on Lookup - Card: MASTERCARD_AUTH_NOT_AVAILABLE_ON_LOOKUP
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_AUTH_NOT_AVAILABLE_ON_LOOKUP
    And User clicks Pay button
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And "submit" callback is called only once
    And "success" callback is called only once

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |


  @base_config @cardinal_commerce_v2.0
  Scenario Outline: TC_7 - Error on Lookup - Card: MASTERCARD_ERROR_ON_LOOKUP
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_ERROR_ON_LOOKUP
    And User clicks Pay button
    Then User will see payment status information: "<payment_status>"
    And User will see that notification frame has "<color>" color
    And "submit" callback is called only once
    And "<callback>" callback is called only once

    Examples:
      | request_types            | payment_status                          | color | callback |
      | THREEDQUERY AUTH         | Payment has been successfully processed | green | success  |
      | ACCOUNTCHECK THREEDQUERY | Bank System Error                       | red   | error    |


  @base_config @cardinal_commerce_v2.0
  Scenario Outline: TC_8 - Timeout on cmpi_lookup Transaction - Card: MASTERCARD_TIMEOUT_ON_CMPI_LOOKUP_TRANSACTION
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_TIMEOUT_ON_CMPI_LOOKUP_TRANSACTION
    And User clicks Pay button
    Then User will see payment status information: "<payment_status>"
    And User will see that notification frame has "<color>" color
    And "submit" callback is called only once
    And "<callback>" callback is called only once

    Examples:
      | request_types            | payment_status                          | color | callback |
      | THREEDQUERY AUTH         | Payment has been successfully processed | green | success  |
      | ACCOUNTCHECK THREEDQUERY | Bank System Error                       | red   | error    |


  @base_config @cardinal_commerce_v2.0
  Scenario Outline: TC_9 -Successful Step Up Authentication - Card: MASTERCARD_NON_FRICTIONLESS
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_NON_FRICTIONLESS
    And User clicks Pay button
    And User fills V2 authentication modal
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And "submit" callback is called only once
    And "success" callback is called only once

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |


  @base_config @cardinal_commerce_v2.0
  Scenario Outline: TC_10 - Failed Step Up Authentication - Card: MASTERCARD_STEP_UP_AUTH_FAILED
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_STEP_UP_AUTH_FAILED
    And User clicks Pay button
    And User fills V2 authentication modal
    Then User will see payment status information: "An error occurred"
    And User will see that notification frame has "red" color
    And "submit" callback is called only once
    And "error" callback is called only once

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |


  @base_config @cardinal_commerce_v2.0
  Scenario Outline: TC_11 - Step Up Authentication is Unavailable - Card: MASTERCARD_STEP_UP_AUTH_UNAVAILABLE
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_STEP_UP_AUTH_UNAVAILABLE
    And User clicks Pay button
    And User fills V2 authentication modal
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And "submit" callback is called only once
    And "success" callback is called only once

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |


  @base_config @cardinal_commerce_v2.0
  Scenario Outline: TC_12 - Error on Authentication - Card: MASTERCARD_ERROR_ON_AUTH
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_ERROR_ON_AUTH
    And User clicks Pay button
    And User fills V2 authentication modal
    Then User will see payment status information: "An error occurred"
    And User will see that notification frame has "red" color
    And "submit" callback is called only once
    And "error" callback is called only once
    And User will see that Submit button is "enabled" after payment
    And User will see that ALL input fields are "enabled"

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |


  @base_config @cardinal_commerce_v2.0
  Scenario Outline: TC_13 - Bypassed Authentication - Card: MASTERCARD_BYPASSED_AUTH
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_BYPASSED_AUTH
    And User clicks Pay button
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And "submit" callback is called only once
    And "success" callback is called only once

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |


  @base_config @cardinal_commerce_v2.0
  Scenario Outline: Prompt for Whitelist
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_PROMPT_FOR_WHITELIST
    And User clicks Pay button
    And User fills V2 authentication modal
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And "submit" callback is called only once
    And "success" callback is called only once

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |

# ToDo - This test case is no longer supported by Cardinal - to clarify
#  @base_config @cardinal_commerce_v2.0
#  Scenario: Pre-Whitelisted - Visabase_config
#    When User fills payment form with defined card VISA_PRE_WHITELISTED_VISABASE_CONFIG
#    And User clicks Pay button
#    And User fills V2 authentication modal
#    Then User will see payment status information: "Payment has been successfully processed"
#    And User will see that notification frame has "green" color


  @base_config @cardinal_commerce_v2.0
  Scenario Outline: Support TransStatus I
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_SUPPORT_TRANS_STATUS_I
    And User clicks Pay button
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And "submit" callback is called only once
    And "success" callback is called only once

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |


  @base_config @e2e_cardinal_commerce_v2.0
  Scenario Outline: retry payment after failed transaction
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_ERROR_ON_AUTH
    And User clicks Pay button
    And User fills V2 authentication modal
    Then User will see payment status information: "An error occurred"
    And User will see that notification frame has "red" color
    And User waits for payment status to disappear
    And User clears form
    When User fills payment form with defined card MASTERCARD_BYPASSED_AUTH
    And User clicks Pay button
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And "submit" callback is called only once
    And "success" callback is called only once

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |
