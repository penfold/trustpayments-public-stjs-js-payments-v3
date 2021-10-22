Feature: request type with error callback and bypasscard- full test coverage

  Scenario Outline: unsuccessful payment with request types <request_types>, bypass and error callback - frictionless
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                      | value           |
      | requesttypedescriptions  | <request_types> |
      | threedbypasspaymenttypes | VISA MASTERCARD |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_INVALID_EXP_DATE_CARD
    And User clicks Pay button
    Then User will see "submit" popup
    And User will see "error" popup
    And User will see following callback type called only once
      | callback_type |
      | error         |
      | submit        |

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

  Scenario Outline: unsuccessful payment with request types <request_types>, bypass and error callback - frictionless
    Given JS library configured by inline params BASIC_CONFIG and jwt JWT_WITH_SUBSCRIPTION with additional attributes
      | key                      | value           |
      | requesttypedescriptions  | <request_types> |
      | threedbypasspaymenttypes | VISA MASTERCARD |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_INVALID_EXP_DATE_CARD
    And User clicks Pay button
    Then User will see "submit" popup
    And User will see "error" popup
    And User will see following callback type called only once
      | callback_type |
      | error         |
      | submit        |

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

  Scenario Outline: unsuccessful payment with request types <request_types>, bypass and error callback - non-frictionless
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                      | value           |
      | requesttypedescriptions  | <request_types> |
      | threedbypasspaymenttypes | VISA MASTERCARD |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_INVALID_EXP_DATE_CARD
    And User clicks Pay button
    Then User will see "submit" popup
    And User will see "error" popup
    And User will see following callback type called only once
      | callback_type |
      | error         |
      | submit        |

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
      | AUTH                                  |
      | RISKDEC                               |
      | ACCOUNTCHECK                          |
      | RISKDEC AUTH                          |
      | ACCOUNTCHECK AUTH                     |
      | RISKDEC ACCOUNTCHECK                  |
      | AUTH RISKDEC                          |
      | RISKDEC ACCOUNTCHECK AUTH             |

  Scenario Outline: successful payment with request types <request_types>, bypass and error callback - non-frictionless
    Given JS library configured by inline params BASIC_CONFIG and jwt JWT_WITH_SUBSCRIPTION with additional attributes
      | key                      | value           |
      | requesttypedescriptions  | <request_types> |
      | threedbypasspaymenttypes | VISA MASTERCARD |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_INVALID_EXP_DATE_CARD
    And User clicks Pay button
    Then User will see "submit" popup
    And User will see "error" popup
    And User will see following callback type called only once
      | callback_type |
      | error         |
      | submit        |

    Examples:
      | request_types                                      |
      | THREEDQUERY AUTH SUBSCRIPTION                      |
      | RISKDEC THREEDQUERY AUTH SUBSCRIPTION              |
      | THREEDQUERY ACCOUNTCHECK SUBSCRIPTION              |
      | ACCOUNTCHECK THREEDQUERY AUTH SUBSCRIPTION         |
      | RISKDEC ACCOUNTCHECK THREEDQUERY AUTH SUBSCRIPTION |
      | RISKDEC THREEDQUERY ACCOUNTCHECK SUBSCRIPTION      |
      | RISKDEC ACCOUNTCHECK AUTH SUBSCRIPTION             |
      | ACCOUNTCHECK SUBSCRIPTION                          |
      | ACCOUNTCHECK AUTH SUBSCRIPTION                     |
      | RISKDEC AUTH SUBSCRIPTION                          |
      | AUTH SUBSCRIPTION                                  |
