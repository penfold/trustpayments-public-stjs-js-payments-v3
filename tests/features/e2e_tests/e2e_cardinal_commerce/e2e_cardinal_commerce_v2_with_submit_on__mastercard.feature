@cardinal_commerce_v2.0_MASTERCARD
Feature: Cardinal Commerce E2E tests v2 with redirection after payment - MasterCard
  As a user
  I want to use card payments method
  In order to check Cardinal Commerce integration

  @cardinal_commerce_v2.0
  Scenario Outline: TC_1 - Successful Frictionless Authentication with submitOnSuccess - Card: MASTERCARD_SUCCESSFUL_FRICTIONLESS_AUTH
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key             | value |
      | submitOnSuccess | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_SUCCESSFUL_FRICTIONLESS_AUTH
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | <baseamount>                            |
      | currencyiso3a        | <currencyiso3a>                         |
      | errorcode            | 0                                       |
      | status               | Y                                       |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | enrolled             | Y                                       |
      | settlestatus         | 0                                       |
      | eci                  | <eci>                                   |

    Examples:
      | request_types            | baseamount     | currencyiso3a  | eci            |
      | THREEDQUERY AUTH         | 1000           | GBP            | 02             |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | should be none |
      | THREEDQUERY ACCOUNTCHECK | 1000           | GBP            | 02             |


  @cardinal_commerce_v2.0
  Scenario Outline: TC_2 - Failed Frictionless Authentication with submitOnError - Card: MASTERCARD_FAILED_FRICTIONLESS_AUTH
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key        | value |
      | <submitOn> | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_FAILED_FRICTIONLESS_AUTH
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value              |
      | errormessage         | <errormessage>     |
      | errorcode            | <errorcode>        |
      | transactionreference | should not be none |
      | jwt                  | should not be none |
      | enrolled             | <enrolled>         |
      | settlestatus         | <settlestatus>     |
      | status               | <status>           |

    Examples:
      | submitOn        | request_types            | errormessage                            | errorcode | enrolled       | settlestatus   | status         |
      | submitOnError   | THREEDQUERY AUTH         | Unauthenticated                         | 60022     | should be none | should be none | should be none |
      | submitOnSuccess | ACCOUNTCHECK THREEDQUERY | Payment has been successfully processed | 0         | Y              | 0              | N              |
      | submitOnError   | THREEDQUERY ACCOUNTCHECK | Unauthenticated                         | 60022     | should be none | should be none | should be none |


  @cardinal_commerce_v2.0
  Scenario Outline: TC_3 - Attempts Stand-In Frictionless Authenticatio with submitOnSuccess - Card: MASTERCARD_FRICTIONLESS
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key             | value |
      | submitOnSuccess | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_FRICTIONLESS
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | <baseamount>                            |
      | currencyiso3a        | <currencyiso3a>                         |
      | errorcode            | 0                                       |
      | status               | A                                       |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | enrolled             | Y                                       |
      | settlestatus         | 0                                       |
      | eci                  | <eci>                                   |

    Examples:
      | request_types            | baseamount     | currencyiso3a  | eci            |
      | THREEDQUERY AUTH         | 1000           | GBP            | 01             |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | should be none |
      | THREEDQUERY ACCOUNTCHECK | 1000           | GBP            | 01             |


  @cardinal_commerce_v2.0
  Scenario Outline: TC_4 - Unavailable Frictionless Authentication from the Issuer with submitOnSuccess - Card: MASTERCARD_UNAVAILABLE_FRICTIONLESS_AUTH
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key             | value |
      | submitOnSuccess | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_UNAVAILABLE_FRICTIONLESS_AUTH
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | <baseamount>                            |
      | currencyiso3a        | <currencyiso3a>                         |
      | errorcode            | 0                                       |
      | status               | U                                       |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | enrolled             | Y                                       |
      | settlestatus         | 0                                       |
      | eci                  | <eci>                                   |

    Examples:
      | request_types            | baseamount     | currencyiso3a  | eci            |
      | THREEDQUERY AUTH         | 1000           | GBP            | 00             |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | should be none |
      | THREEDQUERY ACCOUNTCHECK | 1000           | GBP            | 00             |


  @cardinal_commerce_v2.0
  Scenario Outline: TC_5 - Rejected Frictionless Authentication by the Issuer with submitOnError - Card: MASTERCARD_REJECTED_FRICTIONLESS_AUTH
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key        | value |
      | <submitOn> | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_REJECTED_FRICTIONLESS_AUTH
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value              |
      | errormessage         | <errormessage>     |
      | errorcode            | <errorcode>        |
      | transactionreference | should not be none |
      | jwt                  | should not be none |
      | enrolled             | <enrolled>         |
      | settlestatus         | <settlestatus>     |
      | status               | <status>           |

    Examples:
      | submitOn        | request_types            | errormessage                            | errorcode | enrolled       | settlestatus   | status         |
      | submitOnError   | THREEDQUERY AUTH         | Unauthenticated                         | 60022     | should be none | should be none | should be none |
      | submitOnSuccess | ACCOUNTCHECK THREEDQUERY | Payment has been successfully processed | 0         | Y              | 0              | R              |
      | submitOnError   | THREEDQUERY ACCOUNTCHECK | Unauthenticated                         | 60022     | should be none | should be none | should be none |


  @cardinal_commerce_v2.0
  Scenario Outline: TC_6 - Authentication Not Available on Lookup with submitOnSuccess - Card: MASTERCARD_AUTH_NOT_AVAILABLE_ON_LOOKUP
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key             | value |
      | submitOnSuccess | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_AUTH_NOT_AVAILABLE_ON_LOOKUP
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
      | THREEDQUERY AUTH         | 1000           | GBP            | should be none | 00             |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | should be none | should be none |
      | THREEDQUERY ACCOUNTCHECK | 1000           | GBP            | should be none | 00             |


  @cardinal_commerce_v2.0
  Scenario Outline: TC_7 - Error on Lookup with submitOn - Card: MASTERCARD_ERROR_ON_LOOKUP
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key             | value |
      | submitOnSuccess | true  |
      | submitOnError   | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_ERROR_ON_LOOKUP
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
      | status               | should be none     |

    Examples:
      | request_types            | errormessage                            | baseamount     | currencyiso3a  | errorcode | settlestatus |
      | THREEDQUERY AUTH         | Payment has been successfully processed | 1000           | GBP            | 0         | 0            |
      #TODO - uncomment when cardinal issue will be resolved
      #      | ACCOUNTCHECK THREEDQUERY | Bank System Error                       | should be none | should be none | 60010     | 0            |
      | THREEDQUERY ACCOUNTCHECK | Payment has been successfully processed | 1000           | GBP            | 0         | 0            |


  @cardinal_commerce_v2.0
  Scenario Outline: TC_9 -Successful Step Up Authentication with submitOnSuccess - Card: MASTERCARD_NON_FRICTIONLESS
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key             | value |
      | submitOnSuccess | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_NON_FRICTIONLESS
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
      | request_types            | baseamount     | currencyiso3a  | status | eci            | threedresponse     |
      | THREEDQUERY AUTH         | 1000           | GBP            | Y      | 02             | should be none     |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | C      | should be none | should not be none |
      | THREEDQUERY ACCOUNTCHECK | 1000           | GBP            | Y      | 02             | should be none     |


  @cardinal_commerce_v2.0
  Scenario Outline: TC_10 - Failed Step Up Authentication with submitOnError - Card: MASTERCARD_STEP_UP_AUTH_FAILED
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key           | value |
      | submitOnError | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_STEP_UP_AUTH_FAILED
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
      | status               | C                  |

    Examples:
      | request_types            | threedresponse     |
      | THREEDQUERY AUTH         | should not be none |
      | ACCOUNTCHECK THREEDQUERY | should not be none |
      | THREEDQUERY ACCOUNTCHECK | should not be none |


  @cardinal_commerce_v2.0
  Scenario Outline: TC_11 - Step Up Authentication is Unavailable with submitOnSuccess - Card: MASTERCARD_STEP_UP_AUTH_UNAVAILABLE
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key             | value |
      | submitOnSuccess | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_STEP_UP_AUTH_UNAVAILABLE
    And User clicks Pay button
    #TODO - uncomment when cardinal issue will be resolved
#    And User fills V2 authentication modal
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
      | request_types            | baseamount     | currencyiso3a  | status | eci            | threedresponse     |
      | THREEDQUERY AUTH         | 1000           | GBP            | U      | 00             | should be none     |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | C      | should be none | should not be none |
      | THREEDQUERY ACCOUNTCHECK | 1000           | GBP            | U      | 00             | should be none     |


  @cardinal_commerce_v2.0
  Scenario Outline: TC_12 - Error on Authentication with submitOnError - Card: MASTERCARD_ERROR_ON_AUTH
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key           | value |
      | submitOnError | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_ERROR_ON_AUTH
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
      | status               | C                  |

    Examples:
      | request_types            | threedresponse     |
      | THREEDQUERY AUTH         | should not be none |
      | ACCOUNTCHECK THREEDQUERY | should not be none |
      | THREEDQUERY ACCOUNTCHECK | should not be none |


  Scenario Outline: TC_13 - Bypassed Authentication with submitOnSuccess - Card: MASTERCARD_BYPASSED_AUTH
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key             | value |
      | submitOnSuccess | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_BYPASSED_AUTH
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | errorcode            | 0                                       |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | enrolled             | B                                       |
      | settlestatus         | 0                                       |
      | status               | should be none                          |

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |
      | THREEDQUERY ACCOUNTCHECK |


  @cardinal_commerce_v2.0
  Scenario Outline: Prompt for Whitelist with submitOnSuccess
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key             | value |
      | submitOnSuccess | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_PROMPT_FOR_WHITELIST
    And User clicks Pay button
    #TODO - uncomment when cardinal issue will be resolved
#    And User fills V2 authentication modal
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
      | request_types            | baseamount     | currencyiso3a  | status | eci            | threedresponse     |
      | THREEDQUERY AUTH         | 1000           | GBP            | Y      | 02             | should be none     |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | C      | should be none | should not be none |
      | THREEDQUERY ACCOUNTCHECK | 1000           | GBP            | Y      | 02             | should be none     |


# ToDo - This test case is no longer supported by Cardinal - to clarify
#
#  Scenario: Pre-Whitelisted - Visabase_config
#    When User fills payment form with defined card VISA_PRE_WHITELISTED_VISABASE_CONFIG
#    And User clicks Pay button
#    And User fills V2 authentication modal
#    Then User will see notification frame text: "Payment has been successfully processed"
#    And User will see that notification frame has "green" color

#TODO - uncomment when cardinal issue will be resolved
#  @cardinal_commerce_v2.0
#  Scenario Outline: Support TransStatus I with submitOnSuccess
#    Given JS library configured with BASIC_CONFIG and additional attributes
#      | key             | value |
#      | submitOnSuccess | true  |
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value           |
#      | requesttypedescriptions | <request_types> |
#    And User opens example page
#    When User fills payment form with defined card MASTERCARD_SUPPORT_TRANS_STATUS_I
#    And User clicks Pay button
#    Then User will be sent to page with url "www.example.com" having params
#      | key                  | value                                   |
#      | errormessage         | Payment has been successfully processed |
#      | baseamount           | <baseamount>                            |
#      | currencyiso3a        | <currencyiso3a>                         |
#      | errorcode            | 0                                       |
#      | status               | U                                       |
#      | transactionreference | should not be none                      |
#      | jwt                  | should not be none                      |
#      | enrolled             | Y                                       |
#      | settlestatus         | 0                                       |
#      | eci                  | <eci>                                   |
#
#    Examples:
#      | request_types            | baseamount     | currencyiso3a  | eci            |
#      | THREEDQUERY AUTH         | 1000           | GBP            | 00             |
#      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | should be none |
#      | THREEDQUERY ACCOUNTCHECK | 1000           | GBP            | 00             |


  @base_config @e2e_cardinal_commerce_v2.0
  Scenario Outline: retry payment after failed transaction
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key             | value |
      | submitOnSuccess | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_ERROR_ON_AUTH
    And User clicks Pay button
    And User fills V2 authentication modal
    Then User will see notification frame text: "An error occurred"
    And User waits for notification frame to disappear
    And User clears form
    When User fills payment form with defined card MASTERCARD_BYPASSED_AUTH
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
      | THREEDQUERY ACCOUNTCHECK |
