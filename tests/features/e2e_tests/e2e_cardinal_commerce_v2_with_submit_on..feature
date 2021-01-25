Feature: Cardinal Commerce E2E tests
  As a user
  I want to use card payments method
  In order to check Cardinal Commerce integration

  @reactJS
    @angular
    @vueJS
    @react_native
    @cardinal_commerce_v2.0
  Scenario Outline: TC_1 - Successful Frictionless Authentication with submitOnSuccess and request type: <request_types>
    Given JS library configured by inline params SUBMIT_ON_SUCCESS_CONFIG and jwt BASE_JWT with additional attributes
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
      | status               | <status>                                |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | enrolled             | Y                                       |
      | settlestatus         | 0                                       |
      | eci                  | <eci>                                   |

    Examples:
      | request_types            | baseamount     | currencyiso3a  | status         | eci            |
      | THREEDQUERY AUTH         | 1000           | GBP            | Y              | 02             |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | should be none | should be none |


  @cardinal_commerce_v2.0
  Scenario Outline: TC_2 - Failed Frictionless Authentication with submitOnError and request type: <request_types>
    Given JS library configured by inline params SUBMIT_ON_ERROR_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_FAILED_FRICTIONLESS_AUTH
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
  Scenario Outline: TC_3 - Attempts Stand-In Frictionless Authenticatio with submitOnSuccess and request type: <request_types>
    Given JS library configured by inline params SUBMIT_ON_SUCCESS_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_FRICTIONLESS
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
  Scenario Outline: TC_4 - Unavailable Frictionless Authentication from the Issuer with submitOnSuccess and request type: <request_types>
    Given JS library configured by inline params SUBMIT_ON_SUCCESS_CONFIG and jwt BASE_JWT with additional attributes
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
      | status               | <status>                                |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | enrolled             | Y                                       |
      | settlestatus         | 0                                       |
      | eci                  | <eci>                                   |

    Examples:
      | request_types            | baseamount     | currencyiso3a  | status         | eci            |
      | THREEDQUERY AUTH         | 1000           | GBP            | U              | 00             |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | should be none | should be none |


  @cardinal_commerce_v2.0
  Scenario Outline: TC_5 - Rejected Frictionless Authentication by the Issuer with submitOnError and request type: <request_types>
    Given JS library configured by inline params SUBMIT_ON_ERROR_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_REJECTED_FRICTIONLESS_AUTH
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
  Scenario Outline: TC_6 - Authentication Not Available on Lookup with submitOnSuccess and request type: <request_types>
    Given JS library configured by inline params SUBMIT_ON_SUCCESS_CONFIG and jwt BASE_JWT with additional attributes
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


  @cardinal_commerce_v2.0
  Scenario Outline: TC_7 - Error on Lookup with submitOn and request type: <request_types>
    Given JS library configured by inline params SUBMIT_ON_SUCCESS_ERROR_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_ERROR_ON_LOOKUP
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
  Scenario Outline: TC_8 - Timeout on cmpi_lookup Transaction with submitOn and request type: <request_types>
    Given JS library configured by inline params SUBMIT_ON_SUCCESS_ERROR_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_TIMEOUT_ON_CMPI_LOOKUP_TRANSACTION
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


  @reactJS
    @angular
    @vueJS
    @react_native
    @cardinal_commerce_v2.0
  Scenario Outline: TC_9 -Successful Step Up Authentication with submitOnSuccess and request type: <request_types>
    Given JS library configured by inline params SUBMIT_ON_SUCCESS_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_NON_FRICTIONLESS
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
  Scenario Outline: TC_10 - Failed Step Up Authentication with submitOnError and request type: <request_types>
    Given JS library configured by inline params SUBMIT_ON_ERROR_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_FAILED_STEP_UP_AUTH
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
  Scenario Outline: TC_11 - Step Up Authentication is Unavailable with submitOnSuccess and request type: <request_types>
    Given JS library configured by inline params SUBMIT_ON_SUCCESS_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_STEP_UP_AUTH_IS_UNAVAILABLE
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
  Scenario Outline: TC_12 - Error on Authentication with submitOnError and request type: <request_types>
    Given JS library configured by inline params SUBMIT_ON_ERROR_CONFIG and jwt BASE_JWT with additional attributes
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

    Examples:
      | request_types            | threedresponse     |
      | THREEDQUERY AUTH         | should not be none |
      | ACCOUNTCHECK THREEDQUERY | should not be none |


  @base_config @cardinal_commerce_v2.0
  Scenario Outline: TC_13 - Bypassed Authentication with submitOnSuccess and request type: <request_types>
    Given JS library configured by inline params SUBMIT_ON_SUCCESS_CONFIG and jwt BASE_JWT with additional attributes
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

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |


  @cardinal_commerce_v2.0
  Scenario Outline: Prompt for Whitelist with submitOnSuccess and request type: <request_types>
    Given JS library configured by inline params SUBMIT_ON_SUCCESS_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_PROMPT_FOR_WHITELIST
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
      | THREEDQUERY AUTH         | 1000           | GBP            | Y              | 02             | should be none     |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | should be none | should be none | should not be none |


# ToDo - This test case is no longer supported by Cardinal - to clarify
#  @base_config @cardinal_commerce_v2.0
#  Scenario: Pre-Whitelisted - Visabase_config
#    When User fills payment form with defined card VISA_PRE_WHITELISTED_VISABASE_CONFIG
#    And User clicks Pay button
#    And User fills V2 authentication modal
#    Then User will see payment status information: "Payment has been successfully processed"
#    And User will see that notification frame has "green" color


  @cardinal_commerce_v2.0
  Scenario Outline: Support TransStatus I with submitOnSuccess and request type: <request_types>
    Given JS library configured by inline params SUBMIT_ON_SUCCESS_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_SUPPORT_TRANS_STATUS_I
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
      | THREEDQUERY AUTH         | 1000           | GBP            | U              | 00             |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | should be none | should be none |


  @base_config @e2e_cardinal_commerce_v2.0
  Scenario Outline: retry payment after failed transaction, request type: <request_types>
    Given JS library configured by inline params SUBMIT_ON_SUCCESS_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_ERROR_ON_AUTH
    And User clicks Pay button
    And User fills V2 authentication modal
    Then User will see payment status information: "An error occurred"
    And User will see that notification frame has "red" color
    And User waits for payment status to disappear
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