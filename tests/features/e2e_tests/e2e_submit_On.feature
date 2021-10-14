Feature: E2E Card Payments - redirection (submitOn)
  As a user
  I want to be redirected to page matching my payment status
  So that my payment is handled appropriately


  Scenario: submitOnSuccess disabled - successful payment
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key             | value |
      | submitOnSuccess | false |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_CARD
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |


  Scenario Outline: submitOnSuccess enabled - successful payment with frictionless card
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key             | value |
      | submitOnSuccess | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
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


  Scenario Outline:  submitOnSuccess enabled - successful payment with non-frictionless card
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key             | value |
      | submitOnSuccess | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
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


  Scenario: submitOnSuccess enabled - successful payment with fieldsToSubmit: securitycode
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key             | value        |
      | submitOnSuccess | true         |
      | fieldsToSubmit  | securitycode |
    And JS library authenticated by jwt JWT_WITH_PARENT_TRANSACTION with additional attributes
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


  Scenario: submitOnError disabled - unsuccessful payment
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


  Scenario: submitOnError enabled - unsuccessful payment
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key           | value |
      | submitOnError | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
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


  Scenario: submitOnError enabled - invalid jwt
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key           | value |
      | submitOnError | true  |
    And JS library authenticated by jwt INVALID_JWT with additional attributes
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


#  Scenario: submitOnCancel disabled - cancelled payment
#    Given JS library configured with BASIC_CONFIG and additional attributes
#      | key            | value |
#      | submitOnCancel | false |
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value             |
#      | requesttypedescriptions | THREEDQUERY AUTH  |
#      | sitereference           | trustthreeds76424 |
#      | customercountryiso2a    | GB                |
#      | billingcountryiso2a     | GB                |
#    And User opens example page
#    When User fills payment form with defined card MASTERCARD_V21_3DS_SDK_NON_FRICTIONLESS
#    And User clicks Pay button
#    And User see 3ds SDK challenge is displayed
#    And User clicks Cancel button on 3ds SDK challenge in POPUP mode
#    Then User will see notification frame text: "Payment has been cancelled"
#    And User will see following callback type called only once
#      | callback_type |
#      | submit        |
#      | cancel        |
#
#
#  Scenario: Cancel payment for Trust Payments provider
#    Given JS library configured with BASIC_CONFIG and additional attributes
#      | key            | value |
#      | submitOnCancel | true  |
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value             |
#      | requesttypedescriptions | THREEDQUERY AUTH  |
#      | sitereference           | trustthreeds76424 |
#      | customercountryiso2a    | GB                |
#      | billingcountryiso2a     | GB                |
#    And User opens example page
#    When User fills payment form with defined card MASTERCARD_V21_3DS_SDK_NON_FRICTIONLESS
#    And User clicks Pay button
#    And User see 3ds SDK challenge is displayed
#    And User clicks Cancel button on 3ds SDK challenge in POPUP mode
#    Then User will not see notification frame
#    And User will be sent to page with url "www.example.com" having params
#      | key          | value                      |
#      | errormessage | Payment has been cancelled |
#      | errorcode    | cancelled                  |


  Scenario: Cancel payment for Cardinal Commerce provider
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key           | value |
      | submitOnError | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
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
