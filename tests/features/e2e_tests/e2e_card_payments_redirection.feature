Feature: E2E Card Payments - redirection
  As a user
  I want to be redirected to page matching my payment status
  So that my payment is handled appropriately

  Scenario Outline: Successful frictionless payment with submitOnSuccess enabled
    Given JS library configured by inline params SUBMIT_ON_SUCCESS_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_CARD
    And User clicks Pay button
    Then User will not see notification frame
    And User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | <baseamount>                            |
      | currencyiso3a        | <currencyiso3a>                         |
      | errorcode            | 0                                       |
      | threedresponse       | <threedresponse>                        |
      | enrolled             | U                                       |
      | settlestatus         | 0                                       |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |

    Examples:
      | request_types            | threedresponse | baseamount     | currencyiso3a  |
      | THREEDQUERY AUTH         | should be none | 1000           | GBP            |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | should be none |


  Scenario Outline: Successful payment with submitOnSuccess enabled for non-frictionless card
    Given JS library configured by inline params SUBMIT_ON_SUCCESS_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    And User fills V2 authentication modal
    Then User will not see notification frame
    And User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | <baseamount>                            |
      | currencyiso3a        | <currencyiso3a>                         |
      | errorcode            | 0                                       |
      | threedresponse       | <threedresponse>                        |
      | enrolled             | Y                                       |
      | settlestatus         | 0                                       |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |

    Examples:
      | request_types            | threedresponse     | baseamount     | currencyiso3a  |
      | THREEDQUERY AUTH         | should be none     | 1000           | GBP            |
      | ACCOUNTCHECK THREEDQUERY | should not be none | should be none | should be none |


  @bypass_property
  Scenario: Successful payment with requestTypes set and default submitOnSuccess
    Given JS library configured by inline params REQUEST_TYPES_CONFIG and jwt BASE_JWT with additional attributes
      | key                      | value                                 |
      | requesttypedescriptions  | RISKDEC ACCOUNTCHECK THREEDQUERY AUTH |
      | threedbypasspaymenttypes | MASTERCARD                            |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_CARD
    And User clicks Pay button
    Then User will not see notification frame
    And User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | 1000                                    |
      | currencyiso3a        | GBP                                     |
      | errorcode            | 0                                       |
      | settlestatus         | 0                                       |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |


  @bypass_property
  Scenario: Unsuccessful payment with submitOnError enabled
    Given JS library configured by inline params SUBMIT_ON_ERROR_CONFIG and jwt BASE_JWT with additional attributes
      | key                      | value            |
      | requesttypedescriptions  | THREEDQUERY AUTH |
      | threedbypasspaymenttypes | MASTERCARD       |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_DECLINED_CARD
    And User clicks Pay button
    Then User will not see notification frame
    And User will be sent to page with url "www.example.com" having params
      | key                  | value              |
      | errormessage         | Decline            |
      | baseamount           | 1000               |
      | currencyiso3a        | GBP                |
      | errorcode            | 70000              |
      | settlestatus         | 3                  |
      | transactionreference | should not be none |
      | jwt                  | should not be none |

  Scenario: Unsuccessful payment with submitOnError disabled
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User fills payment form with defined card VISA_DECLINED_CARD
    And User clicks Pay button
    Then User will see notification frame text: "Decline"
    And User will see that notification frame has "red" color
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | error         |


  Scenario: Unsuccessful payment with submitOnError enabled - invalid jwt
    Given JS library configured by inline params SUBMIT_ON_ERROR_CONFIG and jwt INVALID_JWT with additional attributes
      | key                      | value            |
      | requesttypedescriptions  | THREEDQUERY AUTH |
      | threedbypasspaymenttypes | MASTERCARD       |
    And User opens example page
    Then User will not see notification frame
    And User will be sent to page with url "www.example.com" having params
      | key          | value         |
      | errormessage | Invalid field |
      | errorcode    | 30000         |
      | errordata    | locale        |


  @bypass_property
  Scenario: Successful payment with submitOnSuccess enabled with field to submit securitycode
    Given JS library configured by inline params SUBMIT_ON_SUCCESS_SECURITY_CODE_CONFIG and jwt JWT_WITH_PARENT_TRANSACTION with additional attributes
      | key                      | value            |
      | requesttypedescriptions  | THREEDQUERY AUTH |
      | threedbypasspaymenttypes | MASTERCARD       |
    And User opens example page
    When User fills "SECURITY_CODE" field "123"
    And User clicks Pay button
    And User fills V2 authentication modal
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | 1000                                    |
      | currencyiso3a        | GBP                                     |
      | errorcode            | 0                                       |
      | status               | Y                                       |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | enrolled             | Y                                       |
      | eci                  | 05                                      |


#  Scenario: Unsuccessful payment with submitOnCancel enabled and cancel callback set
#  Given JS library configured by inline params SUBMIT_ON_CANCEL_CONFIG_CANCEL_CALLBACK and jwt BASE_JWT with additional attributes
#      | key                     | value                    |
#      | requesttypedescriptions | ACCOUNTCHECK THREEDQUERY |
#    When User opens example page CANCEL_CALLBACK
#    And User clicks on Visa Checkout button
#    And User closes the visa checkout popup
#    Then User will not see notification frame
#    And User will be sent to page with url "example.org" having params
#      | key          | value                      |
#      | errormessage | Payment has been cancelled |
#      | errorcode    | cancelled                  |


  Scenario: Cancel Cardinal popup with enabled submitOnSuccess and request type: ACCOUNTCHECK, TDQ
    Given JS library configured by inline params SUBMIT_ON_SUCCESS_ERROR_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value                    |
      | requesttypedescriptions | ACCOUNTCHECK THREEDQUERY |
    And User opens example page
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    And User clicks Cancel button on authentication modal
    Then User will be sent to page with url "www.example.com" having params
      | key            | value              |
      | errormessage   | An error occurred  |
      | enrolled       | Y                  |
      | settlestatus   | 0                  |
      | errorcode      | 50003              |
      | threedresponse | should not be none |
      | jwt            | should not be none |


  Scenario Outline: Cancel Cardinal popup with enabled submitOnError and request type: <request_types>
    Given JS library configured by inline params SUBMIT_ON_ERROR_REQUEST_TYPES_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    And User clicks Cancel button on authentication modal
    Then User will be sent to page with url "www.example.com" having params
      | key            | value              |
      | errormessage   | An error occurred  |
      | enrolled       | Y                  |
      | settlestatus   | 0                  |
      | errorcode      | 50003              |
      | threedresponse | <threedresponse>   |
      | jwt            | should not be none |

    Examples:
      | request_types            | threedresponse     |
      | THREEDQUERY AUTH         | should not be none |
      | ACCOUNTCHECK THREEDQUERY | should not be none |