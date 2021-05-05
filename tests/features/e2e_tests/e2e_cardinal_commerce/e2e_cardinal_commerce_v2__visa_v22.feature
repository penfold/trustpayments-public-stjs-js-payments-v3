@cardinal_commerce_v2.0_VISA_V22
Feature: Cardinal Commerce E2E tests - Visa v2.2
  As a user
  I want to use card payments method
  In order to check Cardinal Commerce integration

  @base_config @cardinal_commerce_v2.0
  Scenario Outline: TC_1 - Successful Frictionless Authentication - Card: VISA_V22_SUCCESSFUL_FRICTIONLESS_AUTH
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_V22_SUCCESSFUL_FRICTIONLESS_AUTH
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
  Scenario Outline: TC_2 - Failed Frictionless Authentication - Card: VISA_V22_FAILED_FRICTIONLESS_AUTH
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_V22_FAILED_FRICTIONLESS_AUTH
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
  Scenario Outline: TC_3 - Attempts Stand-In Frictionless Authentication - Card: VISA_V22_FRICTIONLESS
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_V22_FRICTIONLESS
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
  Scenario Outline: TC_4 - Unavailable Frictionless Authentication from the Issuer - Card: VISA_V22_UNAVAILABLE_FRICTIONLESS_AUTH
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_V22_UNAVAILABLE_FRICTIONLESS_AUTH
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
  Scenario Outline: TC_5 - Rejected Frictionless Authentication by the Issuer - Card: VISA_V22_REJECTED_FRICTIONLESS_AUTH
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_V22_REJECTED_FRICTIONLESS_AUTH
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
  Scenario Outline: TC_6 - Authentication Not Available on Lookup - Card: VISA_V22_AUTH_NOT_AVAILABLE_ON_LOOKUP
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_V22_AUTH_NOT_AVAILABLE_ON_LOOKUP
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
  Scenario Outline: TC_7 - Error on Lookup - Card: VISA_V22_ERROR_ON_LOOKUP
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_V22_ERROR_ON_LOOKUP
    And User clicks Pay button
    Then User will see payment status information: "<payment_status>"
    And User will see that notification frame has "<color>" color
    And "submit" callback is called only once
    And "<callback>" callback is called only once

    Examples:
      | request_types            | payment_status                          | color | callback |
      | THREEDQUERY AUTH         | Payment has been successfully processed | green | success  |
      | ACCOUNTCHECK THREEDQUERY | Bank System Error                       | red   | error    |


  @e2e_smoke_test @base_config @cardinal_commerce_v2.0
  Scenario Outline: TC_9 -Successful Step Up Authentication - Card: VISA_V22_NON_FRICTIONLESS
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_V22_NON_FRICTIONLESS
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
  Scenario Outline: TC_10 - Failed Step Up Authentication - Card: VISA_V22_STEP_UP_AUTH_FAILED
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_V22_STEP_UP_AUTH_FAILED
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
  Scenario Outline: TC_11 - Step Up Authentication is Unavailable - Card: VISA_V22_STEP_UP_AUTH_UNAVAILABLE
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_V22_STEP_UP_AUTH_UNAVAILABLE
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
  Scenario Outline: TC_12 - Error on Authentication - Card: VISA_V22_ERROR_ON_AUTH
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_V22_ERROR_ON_AUTH
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
  Scenario Outline: TC_13 - Bypassed Authentication - Card: VISA_V22_BYPASSED_AUTH
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_V22_BYPASSED_AUTH
    And User clicks Pay button
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And "submit" callback is called only once
    And "success" callback is called only once

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |
