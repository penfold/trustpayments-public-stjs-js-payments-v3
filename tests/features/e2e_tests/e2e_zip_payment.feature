#Feature: E2E ZIP Payments
#  As a user
#  I want to use ZIP payment
#  If I use alternative payment method
#
#  Scenario Outline: Successful payment with ZIP
#    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
#      | key                     | value           |
#      | requesttypedescriptions | <request_types> |
#    And User opens example page
#    And User waits for whole form to be displayed
#    When User chooses ZIP from APM's list
#    Then User will not see notification frame
#    And User will be sent to page with url "www.example.com" having params
#      | key                  | value                                   |
#      | errormessage         | Payment has been successfully processed |
#      | baseamount           | <baseamount>                            |
#      | currencyiso3a        | <currencyiso3a>                         |
#      | errorcode            | 0                                       |
#      | threedresponse       | <threedresponse>                        |
#      | enrolled             | U                                       |
#      | settlestatus         | 0                                       |
#      | transactionreference | should not be none                      |
#      | jwt                  | should not be none                      |
#
#    Examples:
#      | request_types                                      | threedresponse     | baseamount         | currencyiso3a      |
#      | RISKDEC ACCOUNTCHECK AUTH SUBSCRIPTION             | should not be none | should not be none | should not be none |
#      | THREEDQUERY AUTH SUBSCRIPTION                      | should not be none | should not be none | should not be none |
#      | RISKDEC THREEDQUERY AUTH SUBSCRIPTION              | should not be none | should not be none | should not be none |
#      | ACCOUNTCHECK SUBSCRIPTION                          | should not be none | should not be none | should not be none |
#      | ACCOUNTCHECK AUTH SUBSCRIPTION                     | should not be none | should not be none | should not be none |
#      | RISKDEC AUTH SUBSCRIPTION                          | should not be none | should not be none | should not be none |
#      | THREEDQUERY ACCOUNTCHECK SUBSCRIPTION              | should not be none | should not be none | should not be none |
#      | AUTH SUBSCRIPTION                                  | should not be none | should not be none | should not be none |
#      | ACCOUNTCHECK THREEDQUERY AUTH SUBSCRIPTION         | should not be none | should not be none | should not be none |
#      | RISKDEC ACCOUNTCHECK THREEDQUERY AUTH SUBSCRIPTION | should not be none | should not be none | should not be none |
#      | RISKDEC THREEDQUERY ACCOUNTCHECK SUBSCRIPTION      | should not be none | should not be none | should not be none |
#
#  Scenario: Successful ZIP payment with updated jwt
#    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
#      | key                     | value            |
#      | requesttypedescriptions | THREEDQUERY AUTH |
#    And User opens page WITH_UPDATE_JWT and jwt BASE_UPDATED_JWT with additional attributes
#      | key                     | value            |
#      | requesttypedescriptions | THREEDQUERY AUTH |
#    And User calls updateJWT function by filling amount field
#    When User chooses ZIP from APM's list
#    Then User will not see notification frame
#    And User will be sent to page with url "www.example.com" having params
#      | key                  | value                                   |
#      | errormessage         | Payment has been successfully processed |
#      | baseamount           | 1000                                    |
#      | currencyiso3a        | GBP                                     |
#      | errorcode            | 0                                       |
#      | threedresponse       | should not be none                      |
#      | enrolled             | U                                       |
#      | settlestatus         | 0                                       |
#      | transactionreference | should not be none                      |
#      | jwt                  | should not be none                      |
#
#
#  Scenario: Unsuccessful payment with ZIP
#    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
#      | key                     | value            |
#      | requesttypedescriptions | THREEDQUERY AUTH |
#      | baseamount              | 70000            |
#    And User opens example page
#    And User waits for whole form to be displayed
#    When User chooses ZIP from APM's list
#    Then User will not see notification frame
#    And User will be sent to page with url "example.org" having params
#      | key                  | value              |
#      | errormessage         | Decline            |
#      | baseamount           | 1000               |
#      | currencyiso3a        | GBP                |
#      | errorcode            | 70000              |
#      | currencyiso3a        | GBP                |
#      | transactionreference | should not be none |
#      | jwt                  | should not be none |
#      | eci                  | 07                 |
#      | settlestatus         | 3                  |
#
#
#  Scenario: Cancel ZIP payment
#    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
#      | key                     | value            |
#      | requesttypedescriptions | THREEDQUERY AUTH |
#    And User opens example page
#    And User waits for whole form to be displayed
#    When User chooses ZIP from APM's list
#    Then User will not see notification frame
#    And User will be sent to page with url "www.example.com" having params
#      | key            | value              |
#      | errormessage   | An error occurred  |
#      | enrolled       | Y                  |
#      | settlestatus   | 0                  |
#      | errorcode      | 50003              |
#      | threedresponse | should not be none |
#      | jwt            | should not be none |
#
#  Scenario: Zip payment with cybertronica fraudconroltranscationid
#    Given JS library configured by inline params CYBERTONICA_CONFIG and jwt BASE_JWT with additional attributes
#      | key                     | value            |
#      | requesttypedescriptions | THREEDQUERY AUTH |
#    And User opens example page
#    And User waits for whole form to be displayed
#    When User chooses ZIP from APM's list
#    Then User will not see notification frame
#    And User will be sent to page with url "www.example.com" having params
#      | key                  | value                                   |
#      | errormessage         | Payment has been successfully processed |
#      | baseamount           | 1000                                    |
#      | currencyiso3a        | GBP                                     |
#      | errorcode            | 0                                       |
#      | threedresponse       | should not be none                      |
#      | enrolled             | U                                       |
#      | settlestatus         | 0                                       |
#      | transactionreference | should not be none                      |
#      | jwt                  | should not be none                      |
#
