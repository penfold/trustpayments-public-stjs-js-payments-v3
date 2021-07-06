@3ds_sdk_v2.0_VISA_V22
@3ds_sdk_v2.0
Feature: 3ds SDK v2 E2E tests - VISA v2.2
  As a user
  I want to use card payments method
  In order to check 3ds SDK integration


  Background:
    Given JS library configured by inline config BASIC_CONFIG


  Scenario Outline: TC_1 - Successful Frictionless Authentication - Card: VISA_V22 Request types: <request_types>
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    And User waits for whole form to be loaded
    When User fills payment form with defined card VISA_V22_3DS_SDK_FRICTIONLESS_SUCCESS
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


  Scenario Outline: TC_2 - Failed Frictionless Authentication - Card: VISA_V22 Request types: <request_types>
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    And User waits for whole form to be loaded
    When User fills payment form with defined card VISA_V22_3DS_SDK_FRICTIONLESS_FAILED
    And User clicks Pay button
    Then User will see payment status information: "<payment_status>"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | <callback>    |
    And User will see that Submit button is "<state>" after payment
    And User will see that ALL input fields are "<state>"

    Examples:
      | request_types            | payment_status                          | callback | state    |
      | THREEDQUERY AUTH         | Unauthenticated                         | error    | enabled  |
      | ACCOUNTCHECK THREEDQUERY | Payment has been successfully processed | success  | disabled |
      | THREEDQUERY ACCOUNTCHECK | Unauthenticated                         | error    | enabled  |


  Scenario Outline: TC_3 - Attempts Stand-In Frictionless Authentication - Card: VISA_V22 Request types: <request_types>
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    And User waits for whole form to be loaded
    When User fills payment form with defined card VISA_V22_3DS_SDK_FRICTIONLESS_STAND_IN
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

  Scenario Outline: TC_4 - Unavailable Frictionless Authentication from the Issuer - Card: VISA_V22 Request types: <request_types>
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    And User waits for whole form to be loaded
    When User fills payment form with defined card VISA_V22_3DS_SDK_UNAVAILABLE_FRICTIONLESS_AUTH
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


  Scenario Outline: TC_5 - Rejected Frictionless Authentication by the Issuer - Card: VISA_V22 Request types: <request_types>
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    And User waits for whole form to be loaded
    When User fills payment form with defined card VISA_V22_3DS_SDK_REJECTED_FRICTIONLESS_AUTH
    And User clicks Pay button
    Then User will see payment status information: "<payment_status>"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | <callback>    |
    And User will see that Submit button is "<state>" after payment
    And User will see that ALL input fields are "<state>"

    Examples:
      | request_types            | payment_status                          | callback | state    |
      | THREEDQUERY AUTH         | Unauthenticated                         | error    | enabled  |
      | ACCOUNTCHECK THREEDQUERY | Payment has been successfully processed | success  | disabled |
      | THREEDQUERY ACCOUNTCHECK | Unauthenticated                         | error    | enabled  |


  Scenario Outline: TC_6a - Authentication failed by DS permanent unavailability - Card: VISA_V22 Request types: <request_types>
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    And User waits for whole form to be loaded
    When User fills payment form with defined card VISA_V22_3DS_SDK_DS_UNAVAILABLE
    And User clicks Pay button
    Then User will see payment status information: "<payment_status>"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | <callback>         |
    And User will see that Submit button is "<state>" after payment
    And User will see that ALL input fields are "<state>"

    Examples:
      | request_types            | payment_status                          | callback | state    |
      | THREEDQUERY AUTH         | Payment has been successfully processed | success  | disabled |
      | ACCOUNTCHECK THREEDQUERY | Bank System Error                       | error    | enabled  |
      | THREEDQUERY ACCOUNTCHECK | Payment has been successfully processed | success  | disabled |


  Scenario Outline: TC_6b - Authentication success after retry when DS timeout in first call - Card: VISA_V22 Request types: <request_types>
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    And User waits for whole form to be loaded
    When User fills payment form with defined card VISA_V22_3DS_SDK_DS_UNAVAILABLE_RETRY
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


  Scenario Outline: TC_7 - Authentication failed by improper data in ARes message - Card: VISA_V22 Request types: <request_types>
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    And User waits for whole form to be loaded
    When User fills payment form with defined card VISA_V22_3DS_SDK_IMPROPER_ARES_DATA
    And User clicks Pay button
    Then User will see payment status information: "<payment_status>"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | <callback>    |
    And User will see that Submit button is "<state>" after payment
    And User will see that ALL input fields are "<state>"

    Examples:
      | request_types            | payment_status                          | callback | state    |
      | THREEDQUERY AUTH         | Payment has been successfully processed | success  | disabled |
      | ACCOUNTCHECK THREEDQUERY | Bank System Error                       | error    | enabled  |
      | THREEDQUERY ACCOUNTCHECK | Payment has been successfully processed | success  | disabled |


  Scenario Outline: TC_8 - Error not completed threeDSMethod - Card: VISA_V22 Request types: <request_types>
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    And User waits for whole form to be loaded
    When User fills payment form with defined card VISA_V22_3DS_SDK_ACS_UNAVAILABLE
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

  Scenario Outline: TC_9 - Successful Step Up Authentication - Card: VISA_V22 Request types: <request_types>
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    And User waits for whole form to be loaded
    When User fills payment form with defined card VISA_V22_3DS_SDK_NON_FRICTIONLESS
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User fills 3ds SDK challenge with THREE_DS_CODE and submit
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |
      | THREEDQUERY ACCOUNTCHECK |


  Scenario Outline: TC_10 - Failed Step Up Authentication - Card: VISA_V22 Request types: <request_types>
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    And User waits for whole form to be loaded
    When User fills payment form with defined card VISA_V22_3DS_SDK_STEP_UP_AUTH_FAILED
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User fills 3ds SDK challenge with THREE_DS_CODE and submit
    Then User will see payment status information: "An error occurred"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | error         |

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |
      | THREEDQUERY ACCOUNTCHECK |


  Scenario Outline: TC_11 - step up - Error on authentication - Card: VISA_V22 Request types: <request_types>
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    And User waits for whole form to be loaded
    When User fills payment form with defined card VISA_V22_3DS_SDK_STEP_UP_AUTH_ERROR
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User fills 3ds SDK challenge with THREE_DS_CODE and submit
    Then User will see payment status information: "An error occurred"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | error         |

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |
      | THREEDQUERY ACCOUNTCHECK |


  Scenario Outline: TC_12 - successful frictionless with require methodUrl - Card: VISA_V22 Request types: <request_types>
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    And User waits for whole form to be loaded
    When User fills payment form with defined card VISA_V22_3DS_SDK_FRICTIONLESS_SUCCESS_METHOD_URL
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

  Scenario Outline: TC_13 - step up with require methodUrl - Card: VISA_V22 Request types: <request_types>
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    And User waits for whole form to be loaded
    When User fills payment form with defined card VISA_V22_3DS_SDK_NON_FRICTIONLESS_METHOD_URL
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User fills 3ds SDK challenge with THREE_DS_CODE and submit
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


  Scenario Outline: TC_14 - successful frictionless with transaction timed out error for method url- Card: VISA_V22 Request types: <request_types>
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    And User waits for whole form to be loaded
    When User fills payment form with defined card VISA_V22_3DS_SDK_TRANSACTION_TIMEOUT
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


  Scenario Outline: TC_4a - transaction timed out at athe ACS - Card: VISA_V22 Request types: <request_types>
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    And User waits for whole form to be loaded
    When User fills payment form with defined card VISA_V22_3DS_SDK_TRANS_STATUS_AUTH_FAILED
    And User clicks Pay button
    Then User will see payment status information: "<payment_status>"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | <callback>    |
    And User will see that Submit button is "<state>" after payment
    And User will see that ALL input fields are "<state>"

    Examples:
      | request_types            | payment_status  | callback | state   |
      | THREEDQUERY AUTH         | Unauthenticated | error    | enabled |
#      | ACCOUNTCHECK THREEDQUERY | Payment has been successfully processed | success  | disabled | Timout in acs/gateway takes more time than wait in tests
      | THREEDQUERY ACCOUNTCHECK | Unauthenticated | error    | enabled |


  Scenario Outline: TC_4b - suspected fraud - Card: VISA_V22 Request types: <request_types>
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    And User waits for whole form to be loaded
    When User fills payment form with defined card VISA_V22_3DS_SDK_TRANS_STATUS_SUSPECTED_FRAUD
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


  Scenario Outline: TC_4c - card holder not enrolled in service - Card: VISA_V22 Request types: <request_types>
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    And User waits for whole form to be loaded
    When User fills payment form with defined card VISA_V22_3DS_SDK_TRANS_STATUS_NOT_ENROLLED
    And User clicks Pay button
    Then User will see payment status information: "<payment_status>"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | <callback>    |
    And User will see that Submit button is "<state>" after payment
    And User will see that ALL input fields are "<state>"

    Examples:
      | request_types            | payment_status                          | callback | state    |
      | THREEDQUERY AUTH         | Unauthenticated                         | error    | enabled  |
      | ACCOUNTCHECK THREEDQUERY | Payment has been successfully processed | success  | disabled |
      | THREEDQUERY ACCOUNTCHECK | Unauthenticated                         | error    | enabled  |


  Scenario Outline: TC_4d - transaction timed out at the ACS - Card: VISA_V22 Request types: <request_types>
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    And User waits for whole form to be loaded
    When User fills payment form with defined card VISA_V22_3DS_SDK_TRANS_STATUS_TRANSACTION_TIMEOUT_AT_ACS
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


  Scenario Outline: TC_4e - non-payment transaction not supported - Card: VISA_V22 Request types: <request_types>
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    And User waits for whole form to be loaded
    When User fills payment form with defined card VISA_V22_3DS_SDK_TRANS_STATUS_TRANSACTION_NON_PAYMENT
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


  Scenario Outline: TC_4f - 3RI transaction not supported - Card: VISA_V22 Request types: <request_types>
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    And User waits for whole form to be loaded
    When User fills payment form with defined card VISA_V22_3DS_SDK_TRANS_STATUS_3RI_TRANSACTION_NOT_SUPPORTED
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

