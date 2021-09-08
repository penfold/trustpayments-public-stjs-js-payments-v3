Feature: E2E Card Payments with bypass
  As a user
  I want to use card payments method
  In order to check full payment functionality

  @bypass_property
  Scenario Outline: Bypass Cards - Successful payment by <card_type>
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                      | value                                    |
      | requesttypedescriptions  | THREEDQUERY AUTH                         |
      | threedbypasspaymenttypes | VISA AMEX MASTERCARD DISCOVER JCB DINERS |
    And User opens example page
    When User fills payment form with defined card <card>
    And User clicks Pay button
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |

    Examples:
      | card            |
      | VISA_CARD       |
      | AMEX_CARD       |
      | DISCOVER_CARD   |
      | JCB_CARD        |
      | MASTERCARD_CARD |
      | DINERS_CARD     |

  @bypass_property
  Scenario Outline: Successful payment with bypassCard and custom request types
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                      | value                                 |
      | requesttypedescriptions  | <request_types>                       |
      | threedbypasspaymenttypes | VISA AMEX DISCOVER JCB DINERS MAESTRO |
    And User opens example page
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |

    Examples:
      | request_types                              |
      | AUTH                                       |
      | THREEDQUERY AUTH                           |
      | THREEDQUERY AUTH RISKDEC                   |
      | ACCOUNTCHECK THREEDQUERY AUTH              |
      | RISKDEC ACCOUNTCHECK THREEDQUERY AUTH      |
      | ACCOUNTCHECK THREEDQUERY AUTH SUBSCRIPTION |

  @bypass_property
  Scenario: Unsuccessful payment with bypassCard and request types: THREEDQUERY
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                      | value       |
      | requesttypedescriptions  | THREEDQUERY |
      | threedbypasspaymenttypes | VISA        |
    And User opens example page
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    Then User will see payment status information: "Bypass"
    And User will see that notification frame has "red" color
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | error         |


  @bypass_property
  Scenario: Successful payment with bypassCard using Mastercard
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                      | value                                 |
      | requesttypedescriptions  | RISKDEC ACCOUNTCHECK THREEDQUERY AUTH |
      | threedbypasspaymenttypes | MASTERCARD                            |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_SUCCESSFUL_AUTH_CARD
    And User clicks Pay button
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |


  @bypass_property
  Scenario: Successful payment bypass cards without 3d secure
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                      | value                                 |
      | requesttypedescriptions  | THREEDQUERY AUTH                      |
      | threedbypasspaymenttypes | VISA AMEX DISCOVER JCB DINERS MAESTRO |
    And User opens example page
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |


  @bypass_property
  Scenario: Successful payment bypass cards with 3d secure
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                      | value                                 |
      | requesttypedescriptions  | THREEDQUERY AUTH                      |
      | threedbypasspaymenttypes | VISA AMEX DISCOVER JCB DINERS MAESTRO |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_SUCCESSFUL_AUTH_CARD
    And User clicks Pay button
    And User fills V1 authentication modal
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |


  @bypass_property
  Scenario: Unsuccessful payment with bypassCard using Mastercard - invalid expiration date
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                      | value                                 |
      | requesttypedescriptions  | RISKDEC ACCOUNTCHECK THREEDQUERY AUTH |
      | threedbypasspaymenttypes | MASTERCARD                            |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_INVALID_EXP_DATE_CARD
    And User clicks Pay button
    Then User will see payment status information: "Invalid field"
    And User will see that notification frame has "red" color
    And User will see that "EXPIRATION_DATE" field is highlighted
    And User will see "Invalid field" message under field: "EXPIRATION_DATE"


  @bypass_property
  Scenario: Unsuccessful payment with bypassCard using Maestro - lack of secure code
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                      | value                                 |
      | requesttypedescriptions  | THREEDQUERY AUTH                      |
      | threedbypasspaymenttypes | VISA AMEX DISCOVER JCB DINERS MAESTRO |
    And User opens example page
    When User fills payment form with defined card MAESTRO_CARD
    And User clicks Pay button
    Then User will see payment status information: "Maestro must use SecureCode"
    And User will see that notification frame has "red" color
