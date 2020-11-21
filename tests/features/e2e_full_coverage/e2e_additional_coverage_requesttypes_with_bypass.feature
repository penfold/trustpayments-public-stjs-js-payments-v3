Feature: request type + bypass card - full test coverage

  Scenario Outline: successful payment with request types <request_types> and bypass set to used card - frictionless
    Given JS library configured by inline params REQUEST_TYPE_ACC_TDQ_AUTH_RISK_CONFIG and jwt BASE_JWT with additional attributes
      | key                      | value               |
      | requesttypedescriptions  | <request_types>     |
      | threedbypasspaymenttypes | VISA MASTERCARD     |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_CARD
    And User clicks Pay button
    Then User will see payment status information: "Payment has been successfully processed"

    Examples:
      | request_types                         |
      | AUTH                                  |
      | RISKDEC                               |
      | ACCOUNTCHECK                          |
      | RISKDEC THREEDQUERY AUTH              |
      | THREEDQUERY AUTH RISKDEC              |
      | ACCOUNTCHECK THREEDQUERY              |
      | ACCOUNTCHECK THREEDQUERY AUTH         |
      | RISKDEC THREEDQUERY ACCOUNTCHECK      |
      | RISKDEC THREEDQUERY                   |
      | RISKDEC ACCOUNTCHECK AUTH             |
      | THREEDQUERY ACCOUNTCHECK              |
      | THREEDQUERY AUTH                      |
      | RISKDEC ACCOUNTCHECK THREEDQUERY AUTH |
      | RISKDEC AUTH                          |
      | RISKDEC ACCOUNTCHECK THREEDQUERY      |
      | ACCOUNTCHECK AUTH                     |
      | RISKDEC ACCOUNTCHECK                  |
      | AUTH RISKDEC                          |

  Scenario Outline: successful payment with request types <request_types> and bypass set to used card - frictionless
    Given JS library configured by inline params REQUEST_TYPE_ACC_TDQ_AUTH_RISK_CONFIG and jwt JWT_WITH_SUBSCRIPTION with additional attributes
      | key                      | value               |
      | requesttypedescriptions  | <request_types>     |
      | threedbypasspaymenttypes | VISA MASTERCARD     |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_CARD
    And User clicks Pay button
    Then User will see payment status information: "Payment has been successfully processed"

    Examples:
      | request_types                                      |
      | RISKDEC ACCOUNTCHECK AUTH SUBSCRIPTION             |
      | THREEDQUERY AUTH SUBSCRIPTION                      |
      | RISKDEC THREEDQUERY AUTH SUBSCRIPTION              |
      | ACCOUNTCHECK SUBSCRIPTION                          |
      | ACCOUNTCHECK AUTH SUBSCRIPTION                     |
      | RISKDEC AUTH SUBSCRIPTION                          |
      | THREEDQUERY ACCOUNTCHECK SUBSCRIPTION              |
      | AUTH SUBSCRIPTION                                  |
      | ACCOUNTCHECK THREEDQUERY AUTH SUBSCRIPTION         |
      | RISKDEC ACCOUNTCHECK THREEDQUERY AUTH SUBSCRIPTION |
      | RISKDEC THREEDQUERY ACCOUNTCHECK SUBSCRIPTION      |

  Scenario Outline: successful payment with request types <request_types> and bypass set to used card - non-frictionless
    Given JS library configured by inline params REQUEST_TYPE_ACC_TDQ_AUTH_RISK_CONFIG and jwt BASE_JWT with additional attributes
      | key                      | value               |
      | requesttypedescriptions  | <request_types>     |
      | threedbypasspaymenttypes | VISA MASTERCARD     |
    And User opens example page
    When User fills payment form with defined card VISA_NON_FRICTIONLESS
    And User clicks Pay button
    Then User will see payment status information: "Payment has been successfully processed"

    Examples:
      | request_types                         |
      | AUTH                                  |
      | RISKDEC                               |
      | ACCOUNTCHECK                          |
      | RISKDEC THREEDQUERY AUTH              |
      | THREEDQUERY AUTH RISKDEC              |
      | ACCOUNTCHECK THREEDQUERY              |
      | ACCOUNTCHECK THREEDQUERY AUTH         |
      | RISKDEC THREEDQUERY ACCOUNTCHECK      |
      | RISKDEC THREEDQUERY                   |
      | RISKDEC ACCOUNTCHECK AUTH             |
      | THREEDQUERY ACCOUNTCHECK              |
      | THREEDQUERY AUTH                      |
      | RISKDEC ACCOUNTCHECK THREEDQUERY AUTH |
      | RISKDEC AUTH                          |
      | RISKDEC ACCOUNTCHECK THREEDQUERY      |
      | ACCOUNTCHECK AUTH                     |
      | RISKDEC ACCOUNTCHECK                  |
      | AUTH RISKDEC                          |

  Scenario Outline: successful payment with request types <request_types> and bypass set to used card - non-frictionless
    Given JS library configured by inline params REQUEST_TYPE_ACC_TDQ_AUTH_RISK_CONFIG and jwt JWT_WITH_SUBSCRIPTION with additional attributes
      | key                      | value               |
      | requesttypedescriptions  | <request_types>     |
      | threedbypasspaymenttypes | VISA MASTERCARD     |
    And User opens example page
    When User fills payment form with defined card VISA_NON_FRICTIONLESS
    And User clicks Pay button
    Then User will see payment status information: "Payment has been successfully processed"

    Examples:
      | request_types                                      |
      | RISKDEC ACCOUNTCHECK AUTH SUBSCRIPTION             |
      | THREEDQUERY AUTH SUBSCRIPTION                      |
      | RISKDEC THREEDQUERY AUTH SUBSCRIPTION              |
      | ACCOUNTCHECK SUBSCRIPTION                          |
      | ACCOUNTCHECK AUTH SUBSCRIPTION                     |
      | RISKDEC AUTH SUBSCRIPTION                          |
      | THREEDQUERY ACCOUNTCHECK SUBSCRIPTION              |
      | AUTH SUBSCRIPTION                                  |
      | ACCOUNTCHECK THREEDQUERY AUTH SUBSCRIPTION         |
      | RISKDEC ACCOUNTCHECK THREEDQUERY AUTH SUBSCRIPTION |
      | RISKDEC THREEDQUERY ACCOUNTCHECK SUBSCRIPTION      |


    Scenario Outline: unsuccessful payment with THREEDQUERY as only request type and bypass set to used card
    Given JS library configured by inline params REQUEST_TYPE_ACC_TDQ_AUTH_RISK_CONFIG and jwt BASE_JWT with additional attributes
      | key                      | value               |
      | requesttypedescriptions  | THREEDQUERY         |
      | threedbypasspaymenttypes | VISA MASTERCARD     |
    And User opens example page
    When User fills payment form with defined card <card_type>
    And User clicks Pay button
    Then User will see payment status information: "Bypass"

      Examples:
      |card_type            |
      |MASTERCARD_CARD      |
      |VISA_NON_FRICTIONLESS|
