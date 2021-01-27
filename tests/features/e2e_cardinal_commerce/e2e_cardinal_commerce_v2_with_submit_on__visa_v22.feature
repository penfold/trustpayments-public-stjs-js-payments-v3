@cardinal_commerce_v2.0_VISA_V22
Feature: Cardinal Commerce E2E tests with redirection after payment - Visa v2.2
  As a user
  I want to use card payments method
  In order to check Cardinal Commerce integration

  @cardinal_commerce_v2.0
  Scenario Outline: TC_1 - Successful Frictionless Authentication with submitOnSuccess - Card: VISA_V22_SUCCESSFUL_FRICTIONLESS_AUTH
    Given JS library configured by inline params SUBMIT_ON_SUCCESS_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_V22_SUCCESSFUL_FRICTIONLESS_AUTH
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | <baseamount>                            |
      | currencyiso3a        | <currencyiso3a>                         |
      | errorcode            | 0                                       |
      | status               | <status>                                |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | enrolled             | Y                                       |
      | settlestatus         | 0                                       |
      | eci                  | <eci>                                   |

    Examples:
      | request_types            | baseamount     | currencyiso3a  | status         | eci            |
      | THREEDQUERY AUTH         | 1000           | GBP            | Y              | 05             |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | should be none | should be none |


  @cardinal_commerce_v2.0
  Scenario Outline: TC_2 - Failed Frictionless Authentication with submitOnError - Card: VISA_V22_FAILED_FRICTIONLESS_AUTH
    Given JS library configured by inline params SUBMIT_ON_ERROR_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_V22_FAILED_FRICTIONLESS_AUTH
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value              |
      | errormessage         | <errormessage>     |
      | errorcode            | <errorcode>        |
      | transactionreference | should not be none |
      | jwt                  | should not be none |
      | enrolled             | <enrolled>         |
      | settlestatus         | <settlestatus>     |

    Examples:
      | request_types            | errormessage                            | errorcode | enrolled       | settlestatus   |
      | THREEDQUERY AUTH         | Unauthenticated                         | 60022     | should be none | should be none |
      | ACCOUNTCHECK THREEDQUERY | Payment has been successfully processed | 0         | Y              | 0              |


  @cardinal_commerce_v2.0
  Scenario Outline: TC_3 - Attempts Stand-In Frictionless Authenticatio with submitOnSuccess - Card: VISA_V22_FRICTIONLESS
    Given JS library configured by inline params SUBMIT_ON_SUCCESS_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_V22_FRICTIONLESS
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | <baseamount>                            |
      | currencyiso3a        | <currencyiso3a>                         |
      | errorcode            | 0                                       |
      | status               | <status>                                |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | enrolled             | Y                                       |
      | settlestatus         | 0                                       |
      | eci                  | <eci>                                   |

    Examples:
      | request_types            | baseamount     | currencyiso3a  | status         | eci            |
      | THREEDQUERY AUTH         | 1000           | GBP            | A              | 06             |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | should be none | should be none |


  @cardinal_commerce_v2.0
  Scenario Outline: TC_4 - Unavailable Frictionless Authentication from the Issuer with submitOnSuccess - Card: VISA_V22_UNAVAILABLE_FRICTIONLESS_AUTH
    Given JS library configured by inline params SUBMIT_ON_SUCCESS_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_V22_UNAVAILABLE_FRICTIONLESS_AUTH
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | <baseamount>                            |
      | currencyiso3a        | <currencyiso3a>                         |
      | errorcode            | 0                                       |
      | status               | <status>                                |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | enrolled             | Y                                       |
      | settlestatus         | 0                                       |
      | eci                  | <eci>                                   |

    Examples:
      | request_types            | baseamount     | currencyiso3a  | status         | eci            |
      | THREEDQUERY AUTH         | 1000           | GBP            | U              | 07             |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | should be none | should be none |


  @cardinal_commerce_v2.0
  Scenario Outline: TC_5 - Rejected Frictionless Authentication by the Issuer with submitOnError - Card: VISA_V22_REJECTED_FRICTIONLESS_AUTH
    Given JS library configured by inline params SUBMIT_ON_ERROR_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_V22_REJECTED_FRICTIONLESS_AUTH
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value              |
      | errormessage         | <errormessage>     |
      | errorcode            | <errorcode>        |
      | transactionreference | should not be none |
      | jwt                  | should not be none |
      | enrolled             | <enrolled>         |
      | settlestatus         | <settlestatus>     |

    Examples:
      | request_types            | errormessage                            | errorcode | enrolled       | settlestatus   |
      | THREEDQUERY AUTH         | Unauthenticated                         | 60022     | should be none | should be none |
      | ACCOUNTCHECK THREEDQUERY | Payment has been successfully processed | 0         | Y              | 0              |


  @cardinal_commerce_v2.0
  Scenario Outline: TC_6 - Authentication Not Available on Lookup with submitOnSuccess - Card: VISA_V22_AUTH_NOT_AVAILABLE_ON_LOOKUP
    Given JS library configured by inline params SUBMIT_ON_SUCCESS_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_V22_AUTH_NOT_AVAILABLE_ON_LOOKUP
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | <baseamount>                            |
      | currencyiso3a        | <currencyiso3a>                         |
      | errorcode            | 0                                       |
      | status               | <status>                                |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | enrolled             | U                                       |
      | settlestatus         | 0                                       |
      | eci                  | <eci>                                   |

    Examples:
      | request_types            | baseamount     | currencyiso3a  | status         | eci            |
      | THREEDQUERY AUTH         | 1000           | GBP            | should be none | 07             |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | should be none | should be none |


  @cardinal_commerce_v2.0
  Scenario Outline: TC_7 - Error on Lookup with submitOn - Card: VISA_V22_ERROR_ON_LOOKUP
    Given JS library configured by inline params SUBMIT_ON_SUCCESS_ERROR_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_V22_ERROR_ON_LOOKUP
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value              |
      | errormessage         | <errormessage>     |
      | baseamount           | <baseamount>       |
      | currencyiso3a        | <currencyiso3a>    |
      | errorcode            | <errorcode>        |
      | transactionreference | should not be none |
      | jwt                  | should not be none |
      | enrolled             | U                  |
      | settlestatus         | <settlestatus>     |

    Examples:
      | request_types            | errormessage                            | baseamount     | currencyiso3a  | errorcode | settlestatus |
      | THREEDQUERY AUTH         | Payment has been successfully processed | 1000           | GBP            | 0         | 0            |
      | ACCOUNTCHECK THREEDQUERY | Bank System Error                       | should be none | should be none | 60010     | 0            |


  @cardinal_commerce_v2.0
  Scenario Outline: TC_8 - Timeout on cmpi_lookup Transaction with submitOn - Card: VISA_V22_TIMEOUT_ON_CMPI_LOOKUP_TRANSACTION
    Given JS library configured by inline params SUBMIT_ON_SUCCESS_ERROR_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_V22_TIMEOUT_ON_CMPI_LOOKUP_TRANSACTION
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value              |
      | errormessage         | <errormessage>     |
      | baseamount           | <baseamount>       |
      | currencyiso3a        | <currencyiso3a>    |
      | errorcode            | <errorcode>        |
      | transactionreference | should not be none |
      | jwt                  | should not be none |
      | enrolled             | U                  |
      | settlestatus         | <settlestatus>     |

    Examples:
      | request_types            | errormessage                            | baseamount     | currencyiso3a  | errorcode | settlestatus |
      | THREEDQUERY AUTH         | Payment has been successfully processed | 1000           | GBP            | 0         | 0            |
      | ACCOUNTCHECK THREEDQUERY | Bank System Error                       | should be none | should be none | 60010     | 0            |

  @cardinal_commerce_v2.0
  Scenario Outline: TC_9 -Successful Step Up Authentication with submitOnSuccess - Card: VISA_V22_NON_FRICTIONLESS
    Given JS library configured by inline params SUBMIT_ON_SUCCESS_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_V22_NON_FRICTIONLESS
    And User clicks Pay button
    And User fills V2 authentication modal
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | <baseamount>                            |
      | currencyiso3a        | <currencyiso3a>                         |
      | errorcode            | 0                                       |
      | status               | <status>                                |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | enrolled             | Y                                       |
      | settlestatus         | 0                                       |
      | eci                  | <eci>                                   |
      | threedresponse       | <threedresponse>                        |

    Examples:
      | request_types            | baseamount     | currencyiso3a  | status         | eci            | threedresponse     |
      | THREEDQUERY AUTH         | 1000           | GBP            | Y              | 05             | should be none     |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | should be none | should be none | should not be none |


  @cardinal_commerce_v2.0
  Scenario Outline: TC_10 - Failed Step Up Authentication with submitOnError - Card: VISA_V22_STEP_UP_AUTH_FAILED
    Given JS library configured by inline params SUBMIT_ON_ERROR_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_V22_STEP_UP_AUTH_FAILED
    And User clicks Pay button
    And User fills V2 authentication modal
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value              |
      | errormessage         | An error occurred  |
      | errorcode            | 50003              |
      | transactionreference | should not be none |
      | jwt                  | should not be none |
      | threedresponse       | <threedresponse>   |
      | enrolled             | Y                  |
      | settlestatus         | 0                  |

    Examples:
      | request_types            | threedresponse     |
      | THREEDQUERY AUTH         | should not be none |
      | ACCOUNTCHECK THREEDQUERY | should not be none |


  @cardinal_commerce_v2.0
  Scenario Outline: TC_11 - Step Up Authentication is Unavailable with submitOnSuccess - Card: VISA_V22_STEP_UP_AUTH_UNAVAILABLE
    Given JS library configured by inline params SUBMIT_ON_SUCCESS_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_V22_STEP_UP_AUTH_UNAVAILABLE
    And User clicks Pay button
    And User fills V2 authentication modal
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | <baseamount>                            |
      | currencyiso3a        | <currencyiso3a>                         |
      | errorcode            | 0                                       |
      | status               | <status>                                |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | enrolled             | Y                                       |
      | settlestatus         | 0                                       |
      | eci                  | <eci>                                   |
      | threedresponse       | <threedresponse>                        |

    Examples:
      | request_types            | baseamount     | currencyiso3a  | status         | eci            | threedresponse     |
      | THREEDQUERY AUTH         | 1000           | GBP            | U              | 07             | should be none     |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | should be none | should be none | should not be none |


  @cardinal_commerce_v2.0
  Scenario Outline: TC_12 - Error on Authentication with submitOnError - Card: VISA_V22_ERROR_ON_AUTH
    Given JS library configured by inline params SUBMIT_ON_ERROR_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_V22_ERROR_ON_AUTH
    And User clicks Pay button
    And User fills V2 authentication modal
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value              |
      | errormessage         | An error occurred  |
      | errorcode            | 50003              |
      | transactionreference | should not be none |
      | jwt                  | should not be none |
      | threedresponse       | <threedresponse>   |
      | enrolled             | Y                  |
      | settlestatus         | 0                  |

    Examples:
      | request_types            | threedresponse     |
      | THREEDQUERY AUTH         | should not be none |
      | ACCOUNTCHECK THREEDQUERY | should not be none |


  @base_config @cardinal_commerce_v2.0
  Scenario Outline: TC_13 - Bypassed Authentication with submitOnSuccess - Card: VISA_V22_BYPASSED_AUTH
    Given JS library configured by inline params SUBMIT_ON_SUCCESS_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_V22_BYPASSED_AUTH
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | errorcode            | 0                                       |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | enrolled             | B                                       |
      | settlestatus         | 0                                       |

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |
