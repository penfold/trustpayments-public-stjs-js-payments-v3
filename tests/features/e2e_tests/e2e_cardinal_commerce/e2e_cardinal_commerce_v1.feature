Feature: Cardinal Commerce E2E tests v1
  As a user
  I want to use card payments method
  In order to check Cardinal Commerce integration

  @e2e_smoke_test @e2e_cardinal_commerce_v1
  Scenario Outline: TC_1 - Successful Authentication, request type: <request_types>
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_SUCCESSFUL_AUTH_CARD
    And User clicks Pay button
    And User fills V1 authentication modal
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


  @e2e_cardinal_commerce_v1
  Scenario Outline: TC_2 - Failed Signature, request type: <request_types>
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_FAILED_SIGNATURE_CARD
    And User clicks Pay button
    And User fills V1 authentication modal
    Then User will see payment status information: "<payment_status>"
    And User will see following callback type called only once
      | <callback_type> |
    And User will see that Submit button is "<state>" after payment
    And User will see that ALL input fields are "<state>"

    Examples:
      | request_types            | payment_status                          | callback_type | state    |
      | THREEDQUERY AUTH         | Unauthenticated                         | error         | enabled  |
      | ACCOUNTCHECK THREEDQUERY | Payment has been successfully processed | success       | disabled |


  @e2e_cardinal_commerce_v1
  Scenario Outline: TC_3 - Failed Authentication, request type: <request_types>
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card AMERICAN_EXPRESS_FAILED_AUTH_CARD
    And User clicks Pay button
    And User fills V1 authentication modal
    Then User will see payment status information: "An error occurred"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | error         |
    And User will see that Submit button is "enabled" after payment
    And User will see that ALL input fields are "enabled"

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |


  @e2e_cardinal_commerce_v1
  Scenario Outline: TC_4 - Attempts/Non-Participating, request type: <request_types>
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card DISCOVER_PASSIVE_AUTH_CARD
    And User clicks Pay button
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |


  @e2e_cardinal_commerce_v1
  Scenario Outline: TC_6 - Not Enrolled, request type: <request_types>
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_NOT_ENROLLED_CARD
    And User clicks Pay button
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |


  @e2e_cardinal_commerce_v1
  Scenario Outline: TC_7 - Unavailable, request type: <request_types>
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card AMERICAN_EXPRESS_UNAVAILABLE_CARD
    And User clicks Pay button
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |


  @e2e_cardinal_commerce_v1
  Scenario Outline: TC_8 - Merchant Not Active, request type: <request_types>
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_MERCHANT_NOT_ACTIVE_CARD
    And User clicks Pay button
    Then User will see payment status information: "<payment_status>"
    And User will see following callback type called only once
      | <callback_type> |


    Examples:
      | request_types            | payment_status                          | callback_type |
      | THREEDQUERY AUTH         | Payment has been successfully processed | success       |
      | ACCOUNTCHECK THREEDQUERY | Bank System Error                       | error         |


  @e2e_cardinal_commerce_v1
  Scenario Outline: TC_9 - Cmpi lookup error, request type: <request_types>
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_CMPI_LOOKUP_ERROR_CARD
    And User clicks Pay button
    Then User will see payment status information: "<payment_status>"
    And User will see following callback type called only once
      | <callback_type> |

    Examples:
      | request_types            | payment_status                          | callback_type |
      | THREEDQUERY AUTH         | Payment has been successfully processed | success       |
      | ACCOUNTCHECK THREEDQUERY | Bank System Error                       | error         |


  @e2e_cardinal_commerce_v1
  Scenario Outline: TC_10 - Cmpi authenticate error, request type: <request_types>
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_CMPI_AUTH_ERROR_CARD
    And User clicks Pay button
    And User fills V1 authentication modal
    Then User will see payment status information: "An error occurred"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | error         |

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |


  @e2e_cardinal_commerce_v1
  Scenario Outline: TC_11 - Authentication Unavailable, request type: <request_types>
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_AUTH_UNAVAILABLE_CARD
    And User clicks Pay button
    And User fills V1 authentication modal
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |


  @e2e_cardinal_commerce_v1
  Scenario Outline: TC_12 - Bypassed Authentication, request type: <request_types>
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card DISCOVER_BYPASSED_AUTH_CARD
    And User clicks Pay button
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |


  @e2e_cardinal_commerce_v1
  Scenario Outline: retry payment after failed transaction, request type: <request_types>
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_CMPI_AUTH_ERROR_CARD
    And User clicks Pay button
    And User fills V1 authentication modal
    Then User will see payment status information: "An error occurred"
    And User waits for payment status to disappear
    And User clears form
    When User fills payment form with defined card DISCOVER_BYPASSED_AUTH_CARD
    And User clicks Pay button
    Then User will see payment status information: "Payment has been successfully processed"

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |
