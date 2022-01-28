@cardinal_commerce_v1
Feature: Cardinal Commerce E2E tests v1 with redirection after payment
  As a user
  I want to use card payments method
  In order to check Cardinal Commerce integration


  Scenario Outline: TC_1 - Successful Authentication with submitOnSuccess and request type: <request_types>
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key             | value |
      | submitOnSuccess | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_SUCCESSFUL_AUTH_CARD
    And User clicks Pay button
    And User fills V1 authentication modal
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
      | THREEDQUERY ACCOUNTCHECK | 1000           | GBP            | Y              | 02             | should be none     |


  Scenario Outline: TC_2 - Failed Signature with submitOn and request type: <request_types>
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key             | value |
      | submitOnSuccess | true  |
      | submitOnError   | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_FAILED_SIGNATURE_CARD
    And User clicks Pay button
    And User fills V1 authentication modal
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value              |
      | errormessage         | <errormessage>     |
      | errorcode            | <errorcode>        |
      | transactionreference | should not be none |
      | jwt                  | should not be none |
      | enrolled             | Y                  |
      | settlestatus         | 0                  |
      | threedresponse       | <threedresponse>   |
      | status               | should be none     |

    Examples:
      | request_types            | errormessage                            | errorcode | threedresponse     |
      | THREEDQUERY AUTH         | Unauthenticated                         | 60022     | should be none     |
      | ACCOUNTCHECK THREEDQUERY | Payment has been successfully processed | 0         | should not be none |
      | THREEDQUERY ACCOUNTCHECK | Unauthenticated                         | 60022     | should be none     |


  Scenario Outline: TC_3 - Failed Authentication with submitOnError and request type: <request_types>
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key           | value |
      | submitOnError | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card AMEX_FAILED_AUTH_CARD
    And User clicks Pay button
    And User fills V1 authentication modal
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value              |
      | errormessage         | An error occurred  |
      | errorcode            | 50003              |
      | transactionreference | should not be none |
      | jwt                  | should not be none |
      | enrolled             | Y                  |
      | settlestatus         | 0                  |
      | threedresponse       | <threedresponse>   |
      | status               | should be none     |

    Examples:
      | request_types            | threedresponse     |
      | THREEDQUERY AUTH         | should not be none |
      | ACCOUNTCHECK THREEDQUERY | should not be none |
      | THREEDQUERY ACCOUNTCHECK | should not be none |

#TODO Uncomment when additional configuration will be added to new site reference
#  Scenario Outline: TC_4 - Attempts/Non-Participating with submitOnSuccess and request type: <request_types>
#    Given JS library configured with BASIC_CONFIG and additional attributes
#      | key             | value |
#      | submitOnSuccess | true  |
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value           |
#      | requesttypedescriptions | <request_types> |
#    And User opens example page
#    When User fills payment form with defined card DISCOVER_PASSIVE_AUTH_CARD
#    And User clicks Pay button
#    Then User will be sent to page with url "www.example.com" having params
#      | key                  | value                                   |
#      | errormessage         | Payment has been successfully processed |
#      | baseamount           | <baseamount>                            |
#      | currencyiso3a        | <currencyiso3a>                         |
#      | errorcode            | 0                                       |
#      | status               | <status>                                |
#      | transactionreference | should not be none                      |
#      | jwt                  | should not be none                      |
#      | enrolled             | Y                                       |
#      | settlestatus         | 0                                       |
#      | eci                  | <eci>                                   |
#      | threedresponse       | <threedresponse>                        |
#
#    Examples:
#      | request_types            | baseamount     | currencyiso3a  | status         | eci            | threedresponse     |
#      | THREEDQUERY AUTH         | 1000           | GBP            | A              | 06             | should be none     |
#      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | should be none | should be none | should not be none |
#      | THREEDQUERY ACCOUNTCHECK | 1000           | GBP            | A              | 06             | should be none     |


  Scenario Outline: TC_6 - Not Enrolled with submitOnSuccess and request type: <request_types>
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key             | value |
      | submitOnSuccess | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_NOT_ENROLLED_CARD
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | <baseamount>                            |
      | currencyiso3a        | <currencyiso3a>                         |
      | errorcode            | 0                                       |
      | status               | should be none                          |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | enrolled             | N                                       |
      | settlestatus         | 0                                       |
      | eci                  | <eci>                                   |

    Examples:
      | request_types            | baseamount     | currencyiso3a  | eci            |
      | THREEDQUERY AUTH         | 1000           | GBP            | 00             |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | should be none |
      | THREEDQUERY ACCOUNTCHECK | 1000           | GBP            | 00             |


  Scenario Outline: TC_7 - Unavailable with submitOnSuccess and request type: <request_types>
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key             | value |
      | submitOnSuccess | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card <card>
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | <baseamount>                            |
      | currencyiso3a        | <currencyiso3a>                         |
      | errorcode            | 0                                       |
      | status               | should be none                          |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | enrolled             | U                                       |
      | settlestatus         | 0                                       |
      | eci                  | <eci>                                   |

    Examples:
      | request_types            | baseamount     | currencyiso3a  | eci            | card                        |
      | THREEDQUERY AUTH         | 1000           | GBP            | 07             | AMEX_UNAVAILABLE_CARD       |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | should be none | AMEX_UNAVAILABLE_CARD       |
      | THREEDQUERY ACCOUNTCHECK | 1000           | GBP            | 00             | MASTERCARD_UNAVAILABLE_CARD |


  Scenario Outline: TC_8 - Merchant Not Active with submitOn and request type: <request_types>
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key             | value |
      | submitOnSuccess | true  |
      | submitOnError   | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_MERCHANT_NOT_ACTIVE_CARD
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value              |
      | errormessage         | <errormessage>     |
      | errorcode            | <errorcode>        |
      | baseamount           | <baseamount>       |
      | currencyiso3a        | <currencyiso3a>    |
      | transactionreference | should not be none |
      | jwt                  | should not be none |
      | enrolled             | U                  |
      | settlestatus         | 0                  |
      | status               | should be none     |

    Examples:
      | request_types            | errormessage                            | errorcode | baseamount     | currencyiso3a  |
      | THREEDQUERY AUTH         | Payment has been successfully processed | 0         | 1000           | GBP            |
      | ACCOUNTCHECK THREEDQUERY | Bank System Error                       | 60010     | should be none | should be none |
      | THREEDQUERY ACCOUNTCHECK | Payment has been successfully processed | 0         | 1000           | GBP            |


  Scenario Outline: TC_9 - Cmpi lookup error with submitOn and request type: <request_types>
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key             | value |
      | submitOnSuccess | true  |
      | submitOnError   | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_CMPI_LOOKUP_ERROR_CARD
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value              |
      | errormessage         | <errormessage>     |
      | errorcode            | <errorcode>        |
      | baseamount           | <baseamount>       |
      | currencyiso3a        | <currencyiso3a>    |
      | transactionreference | should not be none |
      | jwt                  | should not be none |
      | enrolled             | U                  |
      | settlestatus         | 0                  |
      | status               | should be none     |

    Examples:
      | request_types            | errormessage                            | errorcode | baseamount     | currencyiso3a  |
      | THREEDQUERY AUTH         | Payment has been successfully processed | 0         | 1000           | GBP            |
      | ACCOUNTCHECK THREEDQUERY | Bank System Error                       | 60010     | should be none | should be none |
      | THREEDQUERY ACCOUNTCHECK | Payment has been successfully processed | 0         | 1000           | GBP            |


  Scenario Outline: TC_10 - Cmpi authenticate error with submitOnError and request type: <request_types>
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key           | value |
      | submitOnError | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_CMPI_AUTH_ERROR_CARD
    And User clicks Pay button
    And User fills V1 authentication modal
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value              |
      | errormessage         | An error occurred  |
      | errorcode            | 50003              |
      | transactionreference | should not be none |
      | jwt                  | should not be none |
      | enrolled             | Y                  |
      | settlestatus         | 0                  |
      | threedresponse       | <threedresponse>   |
      | status               | should be none     |

    Examples:
      | request_types            | threedresponse     |
      | THREEDQUERY AUTH         | should not be none |
      | ACCOUNTCHECK THREEDQUERY | should not be none |
      | THREEDQUERY ACCOUNTCHECK | should not be none |


  Scenario Outline: TC_11 - Authentication Unavailable with submitOnSuccess and request type: <request_types>
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key             | value |
      | submitOnSuccess | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_AUTH_UNAVAILABLE_CARD
    And User clicks Pay button
    And User fills V1 authentication modal
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | errorcode            | 0                                       |
      | baseamount           | <baseamount>                            |
      | currencyiso3a        | <currencyiso3a>                         |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | enrolled             | Y                                       |
      | settlestatus         | 0                                       |
      | status               | <status>                                |
      | eci                  | <eci>                                   |
      | threedresponse       | <threedresponse>                        |

    Examples:
      | request_types            | eci            | status         | baseamount     | currencyiso3a  | threedresponse     |
      | THREEDQUERY AUTH         | 00             | U              | 1000           | GBP            | should be none     |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | should be none | should be none | should not be none |
      | THREEDQUERY ACCOUNTCHECK | 00             | U              | 1000           | GBP            | should be none     |


  Scenario Outline: TC_12 - Bypassed Authentication with submitOnSuccess and request type: <request_types>
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key             | value |
      | submitOnSuccess | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card <card>
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
      | request_types            | card                        |
#TODO Uncomment when additional configuration will be added to new site reference
#      | THREEDQUERY AUTH         | DISCOVER_BYPASSED_AUTH_CARD |
#      | ACCOUNTCHECK THREEDQUERY | DISCOVER_BYPASSED_AUTH_CARD |
      | THREEDQUERY ACCOUNTCHECK | MASTERCARD_BYPASSED_AUTH_V1 |


  Scenario Outline: retry payment after failed transaction with submitOnSuccess and request type: <request_types>
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key             | value |
      | submitOnSuccess | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_CMPI_AUTH_ERROR_CARD
    And User clicks Pay button
    And User fills V1 authentication modal
    Then User will see notification frame text: "An error occurred"
    And User will see that notification frame has "red" color
    And User waits for notification frame to disappear
    And User clears form
    When User fills payment form with defined card <card>
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
      | request_types            | card                        |
#TODO Uncomment when additional configuration will be added to new site reference
#      | THREEDQUERY AUTH         | DISCOVER_BYPASSED_AUTH_CARD |
#      | ACCOUNTCHECK THREEDQUERY | DISCOVER_BYPASSED_AUTH_CARD |
      | THREEDQUERY ACCOUNTCHECK | MASTERCARD_BYPASSED_AUTH_V1 |
