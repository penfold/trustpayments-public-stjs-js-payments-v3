@cardinal_commerce_v1
Feature: Cardinal Commerce E2E tests v1
  As a user
  I want to use card payments method
  In order to check Cardinal Commerce integration


  Scenario Outline: TC_1 - Successful Authentication, request type: <request_types>
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_SUCCESSFUL_AUTH_CARD
    And User clicks Pay button
    And User fills V1 authentication modal
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


  Scenario Outline: TC_2 - Failed Signature, request type: <request_types>
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_FAILED_SIGNATURE_CARD
    And User clicks Pay button
    And User fills V1 authentication modal
    Then User will see notification frame text: "<payment_status>"
    And User will see following callback type called only once
      | <callback_type> |
    And User will see that Pay button is "<state>"
    And User will see that ALL input fields are "<state>"

    Examples:
      | request_types            | payment_status                          | callback_type | state    |
      | THREEDQUERY AUTH         | Unauthenticated                         | error         | enabled  |
      | ACCOUNTCHECK THREEDQUERY | Payment has been successfully processed | success       | disabled |
      | THREEDQUERY ACCOUNTCHECK | Unauthenticated                         | error         | enabled  |


  Scenario Outline: TC_3 - Failed Authentication, request type: <request_types>
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card AMEX_FAILED_AUTH_CARD
    And User clicks Pay button
    And User fills V1 authentication modal
    Then User will see notification frame text: "An error occurred"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | error         |
    And User will see that Pay button is "enabled"
    And User will see that ALL input fields are "enabled"

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |
      | THREEDQUERY ACCOUNTCHECK |


  Scenario Outline: TC_4 - Attempts/Non-Participating, request type: <request_types>
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card <card>
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |

    Examples:
      | request_types            | card                       |
#TODO Uncomment when additional configuration will be added to new site reference
#      | THREEDQUERY AUTH         | DISCOVER_PASSIVE_AUTH_CARD |
#      | ACCOUNTCHECK THREEDQUERY | DISCOVER_PASSIVE_AUTH_CARD |
      | THREEDQUERY ACCOUNTCHECK | VISA_PASSIVE_AUTH_CARD     |


  Scenario Outline: TC_6 - Not Enrolled, request type: <request_types>
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_NOT_ENROLLED_CARD
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |
      | THREEDQUERY ACCOUNTCHECK |

  Scenario Outline: TC_7 - Unavailable, request type: <request_types>
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card <card>
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |

    Examples:
      | request_types            | card                        |
      | THREEDQUERY AUTH         | AMEX_UNAVAILABLE_CARD       |
      | ACCOUNTCHECK THREEDQUERY | AMEX_UNAVAILABLE_CARD       |
      | THREEDQUERY ACCOUNTCHECK | MASTERCARD_UNAVAILABLE_CARD |


  Scenario Outline: TC_8 - Merchant Not Active, request type: <request_types>
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_MERCHANT_NOT_ACTIVE_CARD
    And User clicks Pay button
    Then User will see notification frame text: "<payment_status>"
    And User will see following callback type called only once
      | <callback_type> |


    Examples:
      | request_types            | payment_status                          | callback_type |
      | THREEDQUERY AUTH         | Payment has been successfully processed | success       |
      | ACCOUNTCHECK THREEDQUERY | Bank System Error                       | error         |
      | THREEDQUERY ACCOUNTCHECK | Payment has been successfully processed | success       |


  Scenario Outline: TC_9 - Cmpi lookup error, request type: <request_types>
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_CMPI_LOOKUP_ERROR_CARD
    And User clicks Pay button
    Then User will see notification frame text: "<payment_status>"
    And User will see following callback type called only once
      | <callback_type> |

    Examples:
      | request_types            | payment_status                          | callback_type |
      | THREEDQUERY AUTH         | Payment has been successfully processed | success       |
      | ACCOUNTCHECK THREEDQUERY | Bank System Error                       | error         |
      | THREEDQUERY ACCOUNTCHECK | Payment has been successfully processed | success       |


  Scenario Outline: TC_10 - Cmpi authenticate error, request type: <request_types>
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_CMPI_AUTH_ERROR_CARD
    And User clicks Pay button
    And User fills V1 authentication modal
    Then User will see notification frame text: "An error occurred"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | error         |

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |
      | THREEDQUERY ACCOUNTCHECK |


  Scenario Outline: TC_11 - Authentication Unavailable, request type: <request_types>
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_AUTH_UNAVAILABLE_CARD
    And User clicks Pay button
    And User fills V1 authentication modal
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |
      | THREEDQUERY ACCOUNTCHECK |

  Scenario Outline: TC_12 - Bypassed Authentication, request type: <request_types>
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card <card>
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |

    Examples:
      | request_types            | card                        |
#TODO Uncomment when additional configuration will be added to new site reference
#      | THREEDQUERY AUTH         | DISCOVER_BYPASSED_AUTH_CARD |
#      | ACCOUNTCHECK THREEDQUERY | DISCOVER_BYPASSED_AUTH_CARD |
      | THREEDQUERY ACCOUNTCHECK | MASTERCARD_BYPASSED_AUTH_V1 |


  Scenario Outline: retry payment after failed transaction, request type: <request_types>
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_CMPI_AUTH_ERROR_CARD
    And User clicks Pay button
    And User fills V1 authentication modal
    Then User will see notification frame text: "An error occurred"
    And User waits for notification frame to disappear
    And User clears form
    When User fills payment form with defined card <card>
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"

    Examples:
      | request_types            | card                        |
#TODO Uncomment when additional configuration will be added to new site reference
#      | THREEDQUERY AUTH         | DISCOVER_BYPASSED_AUTH_CARD |
#      | ACCOUNTCHECK THREEDQUERY | DISCOVER_BYPASSED_AUTH_CARD |
      | THREEDQUERY ACCOUNTCHECK | MASTERCARD_BYPASSED_AUTH_V1 |
