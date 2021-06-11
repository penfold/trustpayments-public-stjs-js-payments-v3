@3ds_sdk_v2.0_MASTERCARD_V22
@3ds_sdk_v2.0
Feature: 3ds SDK v2 E2E tests - MasterCard v2.2
  As a user
  I want to use card payments method
  In order to check 3ds SDK integration


  Scenario Outline: TC_1 - Successful Frictionless Authentication - Card: MASTERCARD_V22_3DS_SDK_FRICTIONLESS_SUCCESS
    Given JS library configured by inline params THREE_DS_SDK_BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_V22_3DS_SDK_FRICTIONLESS_SUCCESS
    And User clicks Pay button
    Then User will see payment status information: "TODO"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | TODO          |
    And User will see that Submit button is "disabled" after payment
    And User will see that ALL input fields are "disabled"

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |
      | THREEDQUERY ACCOUNTCHECK |


  Scenario Outline: TC_2 - Failed Frictionless Authentication - Card: MASTERCARD_V22_3DS_SDK_FRICTIONLESS_FAILED
    Given JS library configured by inline params THREE_DS_SDK_BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_V22_3DS_SDK_FRICTIONLESS_FAILED
    And User clicks Pay button
    Then User will see payment status information: "<payment_status>"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | <callback>    |
    And User will see that Submit button is "<state>" after payment
    And User will see that ALL input fields are "<state>"

    Examples:
      | request_types            | payment_status | callback | state    |
      | THREEDQUERY AUTH         | TODO           | TODO     | enabled  |
      | ACCOUNTCHECK THREEDQUERY | TODO           | TODO     | disabled |
      | THREEDQUERY ACCOUNTCHECK | TODO           | TODO     | disabled |


  Scenario Outline: TC_3 - Attempts Stand-In Frictionless Authentication - Card: MASTERCARD_V22_3DS_SDK_FRICTIONLESS_STAND_IN
    Given JS library configured by inline params THREE_DS_SDK_BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_V22_3DS_SDK_FRICTIONLESS_STAND_IN
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User fills 3ds SDK challenge with THREE_DS_CODE and submit
    Then User will see payment status information: "TODO"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | TODO          |
    And User will see that Submit button is "disabled" after payment
    And User will see that ALL input fields are "disabled"

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |
      | THREEDQUERY ACCOUNTCHECK |


  Scenario Outline: TC_4 - Unavailable Frictionless Authentication from the Issuer - Card: MASTERCARD_V22_3DS_SDK_UNAVAILABLE_FRICTIONLESS_AUTH
    Given JS library configured by inline params THREE_DS_SDK_BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_V22_3DS_SDK_UNAVAILABLE_FRICTIONLESS_AUTH
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User fills 3ds SDK challenge with THREE_DS_CODE and submit
    Then User will see payment status information: "TODO"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | TODO          |
    And User will see that Submit button is "disabled" after payment
    And User will see that ALL input fields are "disabled"

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |
      | THREEDQUERY ACCOUNTCHECK |


  Scenario Outline: TC_5 - Rejected Frictionless Authentication by the Issuer - Card: MASTERCARD_V22_3DS_SDK_REJECTED_FRICTIONLESS_AUTH
    Given JS library configured by inline params THREE_DS_SDK_BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_V22_3DS_SDK_REJECTED_FRICTIONLESS_AUTH
    And User clicks Pay button
    Then User will see payment status information: "<payment_status>"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | <callback>    |

    Examples:
      | request_types            | payment_status | callback |
      | THREEDQUERY AUTH         | TODO           | TODO     |
      | ACCOUNTCHECK THREEDQUERY | TODO           | TODO     |
      | THREEDQUERY ACCOUNTCHECK | TODO           | TODO     |


  Scenario Outline: TC_6 - Authentication failed by DS unavailability - Card: MASTERCARD_V22_3DS_SDK_DS_UNAVAILABLE
    Given JS library configured by inline params THREE_DS_SDK_BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_V22_3DS_SDK_DS_UNAVAILABLE
    And User clicks Pay button
    Then User will see payment status information: "TODO"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | TODO          |

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |
      | THREEDQUERY ACCOUNTCHECK |


  Scenario Outline: TC_7 - Authentication failed by improper data in ARes message - Card: MASTERCARD_V22_3DS_SDK_IMPROPER_ARES_DATA
    Given JS library configured by inline params THREE_DS_SDK_BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_V22_3DS_SDK_IMPROPER_ARES_DATA
    And User clicks Pay button
    Then User will see payment status information: "<payment_status>"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | <callback>    |

    Examples:
      | request_types            | payment_status | callback |
      | THREEDQUERY AUTH         | TODO           | TODO     |
      | ACCOUNTCHECK THREEDQUERY | TODO           | TODO     |
      | THREEDQUERY ACCOUNTCHECK | TODO           | TODO     |


  Scenario Outline: TC_8 - Error not completed threeDSMethod - Card: MASTERCARD_V22_3DS_SDK_ACS_UNAVAILABLE
    Given JS library configured by inline params THREE_DS_SDK_BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_V22_3DS_SDK_ACS_UNAVAILABLE
    And User clicks Pay button
    Then User will see payment status information: "<payment_status>"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | <callback>    |

    Examples:
      | request_types            | payment_status | callback |
      | THREEDQUERY AUTH         | TODO           | TODO     |
      | ACCOUNTCHECK THREEDQUERY | TODO           | TODO     |
      | THREEDQUERY ACCOUNTCHECK | TODO           | TODO     |


  Scenario Outline: TC_9 -Successful Step Up Authentication - Card: MASTERCARD_V22_3DS_SDK_NON_FRICTIONLESS
    Given JS library configured by inline params THREE_DS_SDK_BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_V22_3DS_SDK_NON_FRICTIONLESS
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User fills 3ds SDK challenge with THREE_DS_CODE and submit
    Then User will see payment status information: "TODO"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | TODO          |

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |
      | THREEDQUERY ACCOUNTCHECK |


  Scenario Outline: TC_10 - Failed Step Up Authentication - Card: MASTERCARD_V22_3DS_SDK_STEP_UP_AUTH_FAILED
    Given JS library configured by inline params THREE_DS_SDK_BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_V22_3DS_SDK_STEP_UP_AUTH_FAILED
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User fills 3ds SDK challenge with THREE_DS_CODE and submit
    Then User will see payment status information: "TODO"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | TODO          |

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |
      | THREEDQUERY ACCOUNTCHECK |


  Scenario Outline: TC_11 - step up - Error on authentication - Card: MASTERCARD_V22_3DS_SDK_STEP_UP_AUTH_ERROR
    Given JS library configured by inline params THREE_DS_SDK_BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_V22_3DS_SDK_STEP_UP_AUTH_ERROR
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User fills 3ds SDK challenge with THREE_DS_CODE and submit
    Then User will see payment status information: "TODO"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | TODO          |

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |
      | THREEDQUERY ACCOUNTCHECK |


  Scenario Outline: TC_12 - successful frictionless with require methodUrl - Card: MASTERCARD_V22_3DS_SDK_FRICTIONLESS_SUCCESS_METHOD_URL
    Given JS library configured by inline params THREE_DS_SDK_BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_V22_3DS_SDK_FRICTIONLESS_SUCCESS_METHOD_URL
    And User clicks Pay button
    Then User will see payment status information: "TODO"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | TODO          |
    And User will see that Submit button is "disabled" after payment
    And User will see that ALL input fields are "disabled"

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |
      | THREEDQUERY ACCOUNTCHECK |


  Scenario Outline: TC_13 - step up with require methodUrl - Card: MASTERCARD_V22_3DS_SDK_FRICTIONLESS_SUCCESS_METHOD_URL
    Given JS library configured by inline params THREE_DS_SDK_BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_V22_3DS_SDK_NON_FRICTIONLESS_METHOD_URL
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User fills 3ds SDK challenge with THREE_DS_CODE and submit
    Then User will see payment status information: "TODO"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | TODO          |
    And User will see that Submit button is "disabled" after payment
    And User will see that ALL input fields are "disabled"

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |
      | THREEDQUERY ACCOUNTCHECK |


  Scenario Outline: TC_14 - successful frictionless with transaction timed out error for method url- Card: MASTERCARD_V22_3DS_SDK_TRANSACTION_TIMEOUT
    Given JS library configured by inline params THREE_DS_SDK_BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_V22_3DS_SDK_TRANSACTION_TIMEOUT
    And User clicks Pay button
    Then User will see payment status information: "<payment_status>"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | <callback>    |

    Examples:
      | request_types            | payment_status | callback |
      | THREEDQUERY AUTH         | TODO           | TODO     |
      | ACCOUNTCHECK THREEDQUERY | TODO           | TODO     |
      | THREEDQUERY ACCOUNTCHECK | TODO           | TODO     |


  Scenario Outline: TC_4a - successful frictionless with transaction timed out at athe ACS - Card: MASTERCARD_V22_3DS_SDK_FRICTIONLESS_TRANSACTION_TIMEOUT_ACS
    Given JS library configured by inline params THREE_DS_SDK_BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_V22_3DS_SDK_FRICTIONLESS_TRANSACTION_TIMEOUT_ACS
    And User clicks Pay button
    Then User will see payment status information: "<payment_status>"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | <callback>    |

    Examples:
      | request_types            | payment_status | callback |
      | THREEDQUERY AUTH         | TODO           | TODO     |
      | ACCOUNTCHECK THREEDQUERY | TODO           | TODO     |
      | THREEDQUERY ACCOUNTCHECK | TODO           | TODO     |


  Scenario Outline: TC_4b - successful frictionless with suspected fraud - Card: MASTERCARD_V22_3DS_SDK_FRICTIONLESS_SUSPECTED_FRAUD
    Given JS library configured by inline params THREE_DS_SDK_BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_V22_3DS_SDK_FRICTIONLESS_SUSPECTED_FRAUD
    And User clicks Pay button
    Then User will see payment status information: "<payment_status>"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | <callback>    |

    Examples:
      | request_types            | payment_status | callback |
      | THREEDQUERY AUTH         | TODO           | TODO     |
      | ACCOUNTCHECK THREEDQUERY | TODO           | TODO     |
      | THREEDQUERY ACCOUNTCHECK | TODO           | TODO     |


  Scenario Outline: TC_4c - successful frictionless with card holder not enrolled in service - Card: MASTERCARD_V22_3DS_SDK_FRICTIONLESS_NOT_ENROLLED
    Given JS library configured by inline params THREE_DS_SDK_BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_V22_3DS_SDK_FRICTIONLESS_NOT_ENROLLED
    And User clicks Pay button
    Then User will see payment status information: "<payment_status>"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | <callback>    |

    Examples:
      | request_types            | payment_status | callback |
      | THREEDQUERY AUTH         | TODO           | TODO     |
      | ACCOUNTCHECK THREEDQUERY | TODO           | TODO     |
      | THREEDQUERY ACCOUNTCHECK | TODO           | TODO     |


  Scenario Outline: TC_4d - successful frictionless with transaction timed out at the ACS - Card: MASTERCARD_V22_3DS_SDK_FRICTIONLESS_TRANSACTION_TIMEOUT_2_ACS
    Given JS library configured by inline params THREE_DS_SDK_BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_V22_3DS_SDK_FRICTIONLESS_TRANSACTION_TIMEOUT_2_ACS
    And User clicks Pay button
    Then User will see payment status information: "<payment_status>"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | <callback>    |

    Examples:
      | request_types            | payment_status | callback |
      | THREEDQUERY AUTH         | TODO           | TODO     |
      | ACCOUNTCHECK THREEDQUERY | TODO           | TODO     |
      | THREEDQUERY ACCOUNTCHECK | TODO           | TODO     |


  Scenario Outline: TC_4e - successful frictionless with non-payment transaction not supported - Card: MASTERCARD_V22_3DS_SDK_FRICTIONLESS_TRANSACTION_NON_PAYMENT
    Given JS library configured by inline params THREE_DS_SDK_BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_V22_3DS_SDK_FRICTIONLESS_TRANSACTION_NON_PAYMENT
    And User clicks Pay button
    Then User will see payment status information: "<payment_status>"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | <callback>    |

    Examples:
      | request_types            | payment_status | callback |
      | THREEDQUERY AUTH         | TODO           | TODO     |
      | ACCOUNTCHECK THREEDQUERY | TODO           | TODO     |
      | THREEDQUERY ACCOUNTCHECK | TODO           | TODO     |


  Scenario Outline: TC_4f - successful frictionless with 3RI transaction not supported - Card: MASTERCARD_V22_3DS_SDK_FRICTIONLESS_3RI_TRANSACTION_NOT_SUPPORTED
    Given JS library configured by inline params THREE_DS_SDK_BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | sitereference           | jstrustthreed76424 |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_V22_3DS_SDK_FRICTIONLESS_3RI_TRANSACTION_NOT_SUPPORTED
    And User clicks Pay button
    Then User will see payment status information: "<payment_status>"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | <callback>    |

    Examples:
      | request_types            | payment_status | callback |
      | THREEDQUERY AUTH         | TODO           | TODO     |
      | ACCOUNTCHECK THREEDQUERY | TODO           | TODO     |
      | THREEDQUERY ACCOUNTCHECK | TODO           | TODO     |
