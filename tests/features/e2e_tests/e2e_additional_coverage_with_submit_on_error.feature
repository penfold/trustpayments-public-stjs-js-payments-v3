Feature: request type with submit on error - full test coverage

  Scenario Outline: unsuccessful payment with request types <request_types> and submit on error - frictionless
    Given JS library configured by inline params SUBMIT_ON_ERROR_ONLY_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value               |
      | requesttypedescriptions | <request_types>     |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_INVALID_EXP_DATE_CARD
    And User clicks Pay button
    Then User will not see notification frame
    And User will be sent to page with url "www.example.com" having params
      | key           | value         |
      | errormessage  | Invalid field |
      | errorcode     | 30000         |

   Examples:
    | request_types                                      |
    | AUTH                                               |
    | RISKDEC                                            |
    | THREEDQUERY                                        |
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

  Scenario Outline: unsuccessful payment with request types <request_types> and submit on error - frictionless
    Given JS library configured by inline params SUBMIT_ON_ERROR_ONLY_CONFIG and jwt JWT_WITH_SUBSCRIPTION with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_INVALID_EXP_DATE_CARD
    And User clicks Pay button
    Then User will not see notification frame
    And User will be sent to page with url "www.example.com" having params
      | key           | value         |
      | errormessage  | Invalid field |
      | errorcode     | 30000         |

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

   Scenario Outline: unsuccessful payment with request types <request_types> and submit on error - non-frictionless
    Given JS library configured by inline params SUBMIT_ON_ERROR_ONLY_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value               |
      | requesttypedescriptions | <request_types>     |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_FAILED_STEP_UP_AUTH
    And User clicks Pay button
    And User fills V2 authentication modal
    Then User will be sent to page with url "www.example.com" having params
      | key           | value            |
      | errormessage  | An error occurred |
      | errorcode     | 50003            |

    Examples:
    | request_types                                      |
    | THREEDQUERY                                        |
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

  Scenario Outline: unsuccessful payment with request types <request_types> and submit on error - non-frictionless
    Given JS library configured by inline params SUBMIT_ON_ERROR_ONLY_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value               |
      | requesttypedescriptions | <request_types>     |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_INVALID_EXP_DATE_CARD
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key           | value         |
      | errormessage  | Invalid field |
      | errorcode     | 30000         |

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

  Scenario Outline: successful payment with request types <request_types> and submit on error - non-frictionless
    Given JS library configured by inline params SUBMIT_ON_ERROR_ONLY_CONFIG and jwt JWT_WITH_SUBSCRIPTION with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_FAILED_STEP_UP_AUTH
    And User clicks Pay button
    And User fills V2 authentication modal
    Then User will be sent to page with url "www.example.com" having params
      | key           | value            |
      | errormessage  | An error occurred |
      | errorcode     | 50003            |

    Examples:
    | request_types                                      |
    | THREEDQUERY AUTH SUBSCRIPTION                      |
    | RISKDEC THREEDQUERY AUTH SUBSCRIPTION              |
    | THREEDQUERY ACCOUNTCHECK SUBSCRIPTION              |
    | ACCOUNTCHECK THREEDQUERY AUTH SUBSCRIPTION         |
    | RISKDEC ACCOUNTCHECK THREEDQUERY AUTH SUBSCRIPTION |
    | RISKDEC THREEDQUERY ACCOUNTCHECK SUBSCRIPTION      |

  Scenario Outline: unsuccessful payment with request types <request_types> and submit on error - non-frictionless
    Given JS library configured by inline params SUBMIT_ON_ERROR_ONLY_CONFIG and jwt JWT_WITH_SUBSCRIPTION with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_INVALID_EXP_DATE_CARD
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key           | value         |
      | errormessage  | Invalid field |
      | errorcode     | 30000         |

    Examples:
    | request_types                                      |
    | RISKDEC ACCOUNTCHECK AUTH SUBSCRIPTION             |
    | ACCOUNTCHECK SUBSCRIPTION                          |
    | ACCOUNTCHECK AUTH SUBSCRIPTION                     |
    | RISKDEC AUTH SUBSCRIPTION                          |
    | AUTH SUBSCRIPTION                                  |
