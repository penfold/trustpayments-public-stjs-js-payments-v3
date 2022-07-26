Feature: request type with callbacks - full test coverage

  Scenario Outline: successful payment with only request types <request_types>  - frictionless
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_CARD
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: False

    Examples:
      | request_types                         |
      | AUTH                                  |
      | RISKDEC                               |
      | THREEDQUERY                           |
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

  Scenario Outline: successful payment with only request types <request_types> - frictionless
    Given JS library configured by inline params BASIC_CONFIG and jwt JWT_WITH_SUBSCRIPTION with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_CARD
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: False

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

  Scenario Outline: successful payment with only request types <request_types> - non-frictionless
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    And User fills V2 authentication modal
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: <threedresponse_defined>

    Examples:
      | request_types                         | threedresponse_defined |
      | THREEDQUERY                           | True                   |
      | RISKDEC THREEDQUERY AUTH              | False                  |
      | THREEDQUERY AUTH RISKDEC              | False                  |
      | ACCOUNTCHECK THREEDQUERY              | True                   |
      | ACCOUNTCHECK THREEDQUERY AUTH         | False                  |
      | RISKDEC THREEDQUERY ACCOUNTCHECK      | False                  |
      | RISKDEC THREEDQUERY                   | True                   |
      | THREEDQUERY ACCOUNTCHECK              | False                  |
      | THREEDQUERY AUTH                      | False                  |
      | RISKDEC ACCOUNTCHECK THREEDQUERY AUTH | False                  |
      | RISKDEC ACCOUNTCHECK THREEDQUERY      | True                   |

  Scenario Outline: successful payment with only request types <request_types> - non-frictionless
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: False

    Examples:
      | request_types             |
      | AUTH                      |
      | RISKDEC                   |
      | ACCOUNTCHECK              |
      | RISKDEC AUTH              |
      | ACCOUNTCHECK AUTH         |
      | RISKDEC ACCOUNTCHECK      |
      | AUTH RISKDEC              |
      | RISKDEC ACCOUNTCHECK AUTH |

  Scenario Outline: successful payment with only request types <request_types> - non-frictionless
    Given JS library configured by inline params BASIC_CONFIG and jwt JWT_WITH_SUBSCRIPTION with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    And User fills V2 authentication modal
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: False

    Examples:
      | request_types                                      |
      | THREEDQUERY AUTH SUBSCRIPTION                      |
      | RISKDEC THREEDQUERY AUTH SUBSCRIPTION              |
      | THREEDQUERY ACCOUNTCHECK SUBSCRIPTION              |
      | ACCOUNTCHECK THREEDQUERY AUTH SUBSCRIPTION         |
      | RISKDEC ACCOUNTCHECK THREEDQUERY AUTH SUBSCRIPTION |
      | RISKDEC THREEDQUERY ACCOUNTCHECK SUBSCRIPTION      |

  Scenario Outline: successful payment with only request types <request_types> - non-frictionless
    Given JS library configured by inline params BASIC_CONFIG and jwt JWT_WITH_SUBSCRIPTION with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: False

    Examples:
      | request_types                          |
      | RISKDEC ACCOUNTCHECK AUTH SUBSCRIPTION |
      | ACCOUNTCHECK SUBSCRIPTION              |
      | ACCOUNTCHECK AUTH SUBSCRIPTION         |
      | RISKDEC AUTH SUBSCRIPTION              |
      | AUTH SUBSCRIPTION                      |

  Scenario Outline: unsuccessful payment with only request types <request_types> - non-frictionless
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_STEP_UP_AUTH_FAILED
    And User clicks Pay button
    And User fills V2 authentication modal
    Then User will see notification frame text: "An error occurred"
    And User will see following callback type called only once
      | callback_type |
      | error         |
      | submit        |
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: True

    Examples:
      | request_types                         |
      | THREEDQUERY                           |
      | RISKDEC THREEDQUERY AUTH              |
      | THREEDQUERY AUTH RISKDEC              |
      | ACCOUNTCHECK THREEDQUERY              |
      | ACCOUNTCHECK THREEDQUERY AUTH         |
      | RISKDEC THREEDQUERY ACCOUNTCHECK      |
      | RISKDEC THREEDQUERY                   |
      | THREEDQUERY ACCOUNTCHECK              |
      | THREEDQUERY AUTH                      |
      | RISKDEC ACCOUNTCHECK THREEDQUERY AUTH |
      | RISKDEC ACCOUNTCHECK THREEDQUERY      |

  Scenario Outline: unsuccessful payment with only request types <request_types> - non-frictionless
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_INVALID_EXP_DATE_CARD
    And User clicks Pay button
    Then User will see notification frame text: "Invalid field"
    And User will see following callback type called only once
      | callback_type |
      | error         |
      | submit        |
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: False

    Examples:
      | request_types             |
      | AUTH                      |
      | RISKDEC                   |
      | ACCOUNTCHECK              |
      | RISKDEC AUTH              |
      | ACCOUNTCHECK AUTH         |
      | RISKDEC ACCOUNTCHECK      |
      | AUTH RISKDEC              |
      | RISKDEC ACCOUNTCHECK AUTH |
