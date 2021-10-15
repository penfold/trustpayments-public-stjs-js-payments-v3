
#Will be uncommented when ZIP will be supported by Gateway

##@STJS-2437 - Tests automation task for Zip
#Feature: E2E ZIP Payments
#  As a user
#  I want to use ZIP payment
#  If I use alternative payment method
#
#
#  Scenario Outline: Unsuccessful trigger of payment ZIP with missing required fields
#    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs BASIC_CONFIG_APM
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value                 |
#      | locale                  | en_GB                 |
#      | accounttypedescription  | ECOM                  |
#      | requesttypedescriptions | AUTH                  |
#      | billingfirstname        | <billingfirstname>    |
#      | billinglastname         | <billinglastname>     |
#      | billingemail            | <billingemail>        |
#      | billingpremise          | <billingpremise>      |
#      | billingpostcode         | <billingpostcode>     |
#      | billingcountryiso2a     | <billingcountryiso2a> |
#      | orderreference          | <orderreference>      |
#      | currencyiso3a           | <currencyiso3a>       |
#      | baseamount              | <baseamount>          |
#    And User opens example page WITH_APM
#    And User waits for whole form to be displayed
#    And User waits for Pay button to be active
#    When User chooses ZIP from APM's list
#    Then User will see notification frame text: "No account found"
#
#    Examples:
#      | billingfirstname | billinglastname | billingemail    | billingpremise | billingpostcode | billingcountryiso2a | orderreference | currencyiso3a | baseamount |
#      |                  |                 |                 |                |                 |                     |                |               |            |
#      | FirstName        |                 |                 |                |                 |                     |                |               |            |
#      | FirstName        | LastName        |                 |                |                 |                     |                |               |            |
#      | FirstName        | LastName        | email@email.com |                |                 |                     |                |               |            |
#      | FirstName        | LastName        | email@email.com | Premise        |                 |                     |                |               |            |
#      | FirstName        | LastName        | email@email.com | Premise        | 22344           |                     |                |               |            |
#      | FirstName        | LastName        | email@email.com | Premise        | 22344           | PL                  |                |               |            |
#      | FirstName        | LastName        | email@email.com | Premise        | 22344           | US                  | 123456         |               |            |
#      | FirstName        | LastName        | email@email.com | Premise        | 22344           | US                  | 123456         |               |            |
#      | FirstName        | LastName        | email@email.com | Premise        | 22344           | US                  | 123456         | PLN           |            |
#      | FirstName        | LastName        | email@email.com | Premise        | 22344           | US                  | 123456         | USD           |            |
#
#
#  Scenario: Decline trigger of payment ZIP
#    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs BASIC_CONFIG_APM
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value           |
#      | locale                  | en_GB           |
#      | accounttypedescription  | ECOM            |
#      | requesttypedescriptions | AUTH            |
#      | billingfirstname        | FirstName       |
#      | billinglastname         | LastName        |
#      | billingemail            | email@email.com |
#      | billingpremise          | Premise         |
#      | billingpostcode         | 22444           |
#      | billingcountryiso2a     | GB              |
#      | orderreference          | Reference       |
#      | currencyiso3a           | GBP             |
#      | baseamount              | 70000           |
#    And User opens example page WITH_APM
#    And User waits for whole form to be displayed
#    And User waits for Pay button to be active
#    When User chooses ZIP from APM's list
#    Then User will see notification frame text: "Declined"
#
#
#  Scenario Outline: Successful trigger of payment ZIP with accepted value (<billingcountryiso2a>) of billingcountryiso2a
#    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs BASIC_CONFIG_APM
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value                 |
#      | locale                  | en_GB                 |
#      | accounttypedescription  | ECOM                  |
#      | requesttypedescriptions | AUTH                  |
#      | billingfirstname        | FirstName             |
#      | billinglastname         | LastName              |
#      | billingemail            | email@email.com       |
#      | billingpremise          | Premise               |
#      | billingpostcode         | 22444                 |
#      | billingcountryiso2a     | <billingcountryiso2a> |
#      | orderreference          | Reference             |
#      | currencyiso3a           | GBP                   |
#      | baseamount              | 70                    |
#    And User opens example page WITH_APM
#    And User waits for whole form to be displayed
#    And User waits for Pay button to be active
#    When User chooses ZIP from APM's list
#    Then User will be sent to page with url "XYZ" having params
#
#    Examples:
#      | billingcountryiso2a |
#      | AU                  |
#      | NZ                  |
#      | US                  |
#      | GB                  |
#      | ZA                  |
#
#
#  Scenario Outline: Successful trigger of payment ZIP with accepted value (<currencyiso3a>) of currencyiso3a
#    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs BASIC_CONFIG_APM
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value           |
#      | locale                  | en_GB           |
#      | accounttypedescription  | ECOM            |
#      | requesttypedescriptions | AUTH            |
#      | billingfirstname        | FirstName       |
#      | billinglastname         | LastName        |
#      | billingemail            | email@email.com |
#      | billingpremise          | Premise         |
#      | billingpostcode         | 22444           |
#      | billingcountryiso2a     | GB              |
#      | orderreference          | Reference       |
#      | currencyiso3a           | <currencyiso3a> |
#      | baseamount              | 70              |
#    And User opens example page WITH_APM
#    And User waits for whole form to be displayed
#    And User waits for Pay button to be active
#    When User chooses ZIP from APM's list
#    Then User will be sent to page with url "XYZ" having params
#
#    Examples:
#      | currencyiso3a |
#      | AUD           |
#      | NZD           |
#      | USD           |
#      | GBP           |
#      | ZAR           |
#
#
#  Scenario Outline: Successful trigger of payment ZIP with accepted value (<billingcountryiso2a>) of billingcountryiso2a
#    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs BASIC_CONFIG_APM
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value                     |
#      | locale                  | en_GB                     |
#      | accounttypedescription  | ECOM                      |
#      | requesttypedescriptions | <requesttypedescriptions> |
#      | billingfirstname        | FirstName                 |
#      | billinglastname         | LastName                  |
#      | billingemail            | email@email.com           |
#      | billingpremise          | Premise                   |
#      | billingpostcode         | 22444                     |
#      | billingcountryiso2a     | GB                        |
#      | orderreference          | Reference                 |
#      | currencyiso3a           | GBP                       |
#      | baseamount              | 55                        |
#    And User opens example page WITH_APM
#    And User waits for whole form to be displayed
#    And User waits for Pay button to be active
#    When User chooses ZIP from APM's list
#    Then User will be sent to page with url "XYZ" having params
#
#    Examples:
#      | requesttypedescriptions                            |
#      | RISKDEC ACCOUNTCHECK AUTH SUBSCRIPTION             |
#      | THREEDQUERY AUTH SUBSCRIPTION                      |
#      | RISKDEC THREEDQUERY AUTH SUBSCRIPTION              |
#      | ACCOUNTCHECK SUBSCRIPTION                          |
#      | ACCOUNTCHECK AUTH SUBSCRIPTION                     |
#      | RISKDEC AUTH SUBSCRIPTION                          |
#      | THREEDQUERY ACCOUNTCHECK SUBSCRIPTION              |
#      | AUTH SUBSCRIPTION                                  |
#      | ACCOUNTCHECK THREEDQUERY AUTH SUBSCRIPTION         |
#      | RISKDEC ACCOUNTCHECK THREEDQUERY AUTH SUBSCRIPTION |
#      | RISKDEC THREEDQUERY ACCOUNTCHECK SUBSCRIPTION      |
#
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
