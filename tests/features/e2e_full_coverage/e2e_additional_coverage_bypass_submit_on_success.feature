Feature: request type with submit on success and bypass card - full test coverage

  Scenario Outline: successful payment with request types <request_types>, bypass and submit on success - frictionless
    Given JS library configured by inline params SUBMIT_ON_SUCCESS_ONLY_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value               |
      | requesttypedescriptions | <request_types>     |
      | threedbypasspaymenttypes| VISA MASTERCARD     |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_CARD
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key          | value                                   |
      | errormessage | Payment has been successfully processed |
      | errorcode    | 0                                       |

   Examples:
    | request_types                                      |
    | AUTH                                               |
    | RISKDEC                                            |
    | ACCOUNTCHECK                                       |
    | RISKDEC THREEDQUERY AUTH                           |
    | THREEDQUERY AUTH RISKDEC                           |
    | ACCOUNTCHECK THREEDQUERY                           |
    | ACCOUNTCHECK THREEDQUERY AUTH                      |
    | RISKDEC THREEDQUERY ACCOUNTCHECK                   |
    | RISKDEC THREEDQUERY                                |
    | RISKDEC ACCOUNTCHECK AUTH                          |
    | THREEDQUERY ACCOUNTCHECK                           |
    | THREEDQUERY AUTH                                   |
    | RISKDEC ACCOUNTCHECK THREEDQUERY AUTH              |
    | RISKDEC AUTH                                       |
    | RISKDEC ACCOUNTCHECK THREEDQUERY                   |
    | ACCOUNTCHECK AUTH                                  |
    | RISKDEC ACCOUNTCHECK                               |
    | AUTH RISKDEC                                       |

  Scenario Outline: successful payment with  request types <request_types>, bypass and submit on success - frictionless
    Given JS library configured by inline params SUBMIT_ON_SUCCESS_ONLY_CONFIG and jwt JWT_WITH_SUBSCRIPTION with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
      | threedbypasspaymenttypes| VISA MASTERCARD |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_CARD
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key          | value                                   |
      | errormessage | Payment has been successfully processed |
      | errorcode    | 0                                       |

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

   Scenario Outline: successful payment with  request types <request_types>, bypass and submit on success and failed Subscription request - frictionless
    Given JS library configured by inline params SUBMIT_ON_SUCCESS_ONLY_CONFIG and jwt JWT_WITH_SUBSCRIPTION with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
      | threedbypasspaymenttypes| VISA MASTERCARD |
      | currencyiso3a           | JPY             |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_CARD
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key          | value                                   |
      | errormessage | Payment has been successfully processed |
      | errorcode    | 0                                       |

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

  Scenario Outline: successful payment with request types <request_types>, bypass and submit on success - non-frictionless
    Given JS library configured by inline params SUBMIT_ON_SUCCESS_ONLY_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
      | threedbypasspaymenttypes| VISA MASTERCARD |
    And User opens example page
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key          | value                                   |
      | errormessage | Payment has been successfully processed |
      | errorcode    | 0                                       |

    Examples:
    | request_types                                      |
    | AUTH                                               |
    | RISKDEC                                            |
    | ACCOUNTCHECK                                       |
    | RISKDEC AUTH                                       |
    | ACCOUNTCHECK AUTH                                  |
    | RISKDEC ACCOUNTCHECK                               |
    | AUTH RISKDEC                                       |
    | RISKDEC ACCOUNTCHECK AUTH                          |
    | RISKDEC THREEDQUERY AUTH                           |
    | THREEDQUERY AUTH RISKDEC                           |
    | ACCOUNTCHECK THREEDQUERY                           |
    | ACCOUNTCHECK THREEDQUERY AUTH                      |
    | RISKDEC THREEDQUERY ACCOUNTCHECK                   |
    | RISKDEC THREEDQUERY                                |
    | THREEDQUERY ACCOUNTCHECK                           |
    | THREEDQUERY AUTH                                   |
    | RISKDEC ACCOUNTCHECK THREEDQUERY AUTH              |
    | RISKDEC ACCOUNTCHECK THREEDQUERY                   |

  Scenario Outline: successful payment with request types <request_types>, bypass and submit on success - non-frictionless
    Given JS library configured by inline params SUBMIT_ON_SUCCESS_ONLY_CONFIG and jwt JWT_WITH_SUBSCRIPTION with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
      | threedbypasspaymenttypes| VISA MASTERCARD |
    And User opens example page
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key          | value                                   |
      | errormessage | Payment has been successfully processed |
      | errorcode    | 0                                       |

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

  Scenario Outline: successful payment with request types <request_types>, bypass and submit on success and failure on subscription - non-frictionless
    Given JS library configured by inline params SUBMIT_ON_SUCCESS_ONLY_CONFIG and jwt JWT_WITH_SUBSCRIPTION with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
      | threedbypasspaymenttypes| VISA MASTERCARD |
      | currencyiso3a           | JPY             |
    And User opens example page
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key          | value                                   |
      | errormessage | Payment has been successfully processed |
      | errorcode    | 0                                       |

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
