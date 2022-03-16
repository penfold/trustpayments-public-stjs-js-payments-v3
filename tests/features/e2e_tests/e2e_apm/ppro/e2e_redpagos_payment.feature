@APM
@REDPAGOS
@STJS-2607
Feature: E2E REDPAGOS Payments
  As a user
  I want to use REDPAGOS payment
  If I use alternative payment method


  Scenario: Successful trigger of payment with accepted values for billingcountryiso2a and currencyiso3a
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                                                  |
      | requesttypedescriptions | AUTH                                                   |
      | baseamount              | 70                                                     |
      | billingfirstname        | FirstName                                              |
      | billingemail            | FirstName@email.pl                                     |
      | billingdob              | 1980-02-01                                             |
      | billingcountryiso2a     | UY                                                     |
      | currencyiso3a           | USD                                                    |
      | successredirecturl      | https://this_is_not_existing_page_success_redirect.com |
      | errorredirecturl        | https://this_is_not_existing_page_error_redirect.com   |
      | cancelredirecturl       | https://this_is_not_existing_page_cancel_redirect.com  |
    And User opens example page WITH_APM
    And User focuses on APM payment methods section
    When User chooses REDPAGOS from APM list
    Then User will be sent to apm page - simulator


  Scenario Outline: Successful trigger of payment with only one of billing name field
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                                                  |
      | requesttypedescriptions | AUTH                                                   |
      | currencyiso3a           | USD                                                    |
      | billingcountryiso2a     | UY                                                     |
      | baseamount              | 123                                                    |
      | billingemail            | FirstName@email.pl                                     |
      | billingdob              | 1980-02-01                                             |
      | billingfirstname        | <billingfirstname>                                     |
      | billinglastname         | <billinglastname>                                      |
      | billingprefixname       | <billingprefixname>                                    |
      | billingmiddlename       | <billingmiddlename>                                    |
      | billingsuffixname       | <billingsuffixname>                                    |
      | successredirecturl      | https://this_is_not_existing_page_success_redirect.com |
      | errorredirecturl        | https://this_is_not_existing_page_error_redirect.com   |
      | cancelredirecturl       | https://this_is_not_existing_page_cancel_redirect.com  |
    And User opens example page WITH_APM
    And User focuses on APM payment methods section
    When User chooses REDPAGOS from APM list
    Then User will be sent to apm page - simulator

    Examples:
      | billingprefixname | billingfirstname | billingmiddlename | billinglastname | billingsuffixname |
      | Miss              |                  |                   |                 |                   |
      |                   | FirstName        |                   |                 |                   |
      |                   |                  | MiddleName        |                 |                   |
      |                   |                  |                   | LastName        |                   |
      |                   |                  |                   |                 | Bsc               |


  Scenario Outline: Unsuccessful init - not supported values for billingcountryiso2a and currencyiso3a
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                                                  |
      | requesttypedescriptions | AUTH                                                   |
      | baseamount              | 70                                                     |
      | billingfirstname        | FirstName                                              |
      | billingemail            | FirstName@email.pl                                     |
      | billingdob              | 1980-02-01                                             |
      | billingcountryiso2a     | <billingcountryiso2a>                                  |
      | currencyiso3a           | <currencyiso3a>                                        |
      | successredirecturl      | https://this_is_not_existing_page_success_redirect.com |
      | errorredirecturl        | https://this_is_not_existing_page_error_redirect.com   |
      | cancelredirecturl       | https://this_is_not_existing_page_cancel_redirect.com  |
    When User opens example page WITH_APM
    And User waits for Pay button to be active
    And User focuses on APM payment methods section
    Then REDPAGOS is not available on APM list

    Examples:
      | billingcountryiso2a | currencyiso3a |
      | UY                  | PLN           |
      | PL                  | USD           |
      |                     | USD           |


  Scenario: Unsuccessful init - missing at least one of the billing name fields and billingdob
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                                                  |
      | requesttypedescriptions | AUTH                                                   |
      | currencyiso3a           | USD                                                    |
      | billingcountryiso2a     | UY                                                     |
      | billingdob              | 1980-02-01                                             |
      | baseamount              | 123                                                    |
      | successredirecturl      | https://this_is_not_existing_page_success_redirect.com |
      | errorredirecturl        | https://this_is_not_existing_page_error_redirect.com   |
      | cancelredirecturl       | https://this_is_not_existing_page_cancel_redirect.com  |
    And User opens example page WITH_APM
    And User waits for Pay button to be active
    And User focuses on APM payment methods section
    Then REDPAGOS is not available on APM list


  Scenario: Successful trigger of payment with updated jwt
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                                                  |
      | requesttypedescriptions | AUTH                                                   |
      | baseamount              | 70                                                     |
      | billingfirstname        | FirstName                                              |
      | billingemail            | FirstName@email.pl                                     |
      | billingdob              | 1980-02-01                                             |
      | billingcountryiso2a     | UY                                                     |
      | currencyiso3a           | USD                                                    |
      | successredirecturl      | https://this_is_not_existing_page_success_redirect.com |
      | errorredirecturl        | https://this_is_not_existing_page_error_redirect.com   |
      | cancelredirecturl       | https://this_is_not_existing_page_cancel_redirect.com  |
    And User opens page WITH_APM and WITH_UPDATE_JWT - jwt BASE_JWT with additional attributes
      | key                     | value                                                  |
      | requesttypedescriptions | AUTH                                                   |
      | baseamount              | 707                                                    |
      | billinglastname         | LastNameUpdated                                        |
      | billingemail            | FirstName@email.pl                                     |
      | billingdob              | 1980-02-01                                             |
      | billingcountryiso2a     | UY                                                     |
      | currencyiso3a           | USD                                                    |
      | successredirecturl      | https://this_is_not_existing_page_success_redirect.com |
      | errorredirecturl        | https://this_is_not_existing_page_error_redirect.com   |
      | cancelredirecturl       | https://this_is_not_existing_page_cancel_redirect.com  |
    And User waits for Pay button to be active
    And User calls updateJWT function by filling amount field
    When User chooses REDPAGOS from APM list
    Then User will be sent to apm page - simulator


  Scenario: Unsuccessful init - update jwt with not supported values for billingcountryiso2a and currencyiso3a
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                                                  |
      | requesttypedescriptions | AUTH                                                   |
      | baseamount              | 70                                                     |
      | billingfirstname        | FirstName                                              |
      | billingemail            | FirstName@email.pl                                     |
      | billingdob              | 1980-02-01                                             |
      | billingcountryiso2a     | UY                                                     |
      | currencyiso3a           | USD                                                    |
      | successredirecturl      | https://this_is_not_existing_page_success_redirect.com |
      | errorredirecturl        | https://this_is_not_existing_page_error_redirect.com   |
      | cancelredirecturl       | https://this_is_not_existing_page_cancel_redirect.com  |
    And User opens page WITH_APM and WITH_UPDATE_JWT - jwt BASE_JWT with additional attributes
      | key                     | value                                                  |
      | requesttypedescriptions | AUTH                                                   |
      | baseamount              | 707                                                    |
      | billingfirstname        | FirstNameUpdated                                       |
      | billingemail            | FirstName@email.pl                                     |
      | billingdob              | 1980-02-01                                             |
      | billingcountryiso2a     | CZ                                                     |
      | currencyiso3a           | USD                                                    |
      | successredirecturl      | https://this_is_not_existing_page_success_redirect.com |
      | errorredirecturl        | https://this_is_not_existing_page_error_redirect.com   |
      | cancelredirecturl       | https://this_is_not_existing_page_cancel_redirect.com  |
    And User waits for Pay button to be active
    When User calls updateJWT function by filling amount field
    And User focuses on APM payment methods section
    Then REDPAGOS is not available on APM list


  Scenario: Unsuccessful init - update jwt with missing required fields
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                                                  |
      | requesttypedescriptions | AUTH                                                   |
      | baseamount              | 70                                                     |
      | billinglastname         | LastName                                               |
      | billingemail            | FirstName@email.pl                                     |
      | billingdob              | 1980-02-01                                             |
      | billingcountryiso2a     | UY                                                     |
      | currencyiso3a           | USD                                                    |
      | successredirecturl      | https://this_is_not_existing_page_success_redirect.com |
      | errorredirecturl        | https://this_is_not_existing_page_error_redirect.com   |
      | cancelredirecturl       | https://this_is_not_existing_page_cancel_redirect.com  |
    And User opens page WITH_APM and WITH_UPDATE_JWT - jwt BASE_JWT with additional attributes
      | key                     | value                                                  |
      | requesttypedescriptions | AUTH                                                   |
      | baseamount              | 707                                                    |
      | billingcountryiso2a     | UY                                                     |
      | currencyiso3a           | USD                                                    |
      | successredirecturl      | https://this_is_not_existing_page_success_redirect.com |
      | errorredirecturl        | https://this_is_not_existing_page_error_redirect.com   |
      | cancelredirecturl       | https://this_is_not_existing_page_cancel_redirect.com  |
    And User waits for Pay button to be active
    When User calls updateJWT function by filling amount field
    And User focuses on APM payment methods section
    Then REDPAGOS is not available on APM list


  Scenario: Unsuccessful trigger of payment without AUTH in requesttypesdescriptions
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                                                  |
      | requesttypedescriptions | THREEDQUERY RISKDEC                                    |
      | baseamount              | 70                                                     |
      | billingfirstname        | FirstName                                              |
      | billingemail            | FirstName@email.pl                                     |
      | billingdob              | 1980-02-01                                             |
      | billingcountryiso2a     | UY                                                     |
      | currencyiso3a           | USD                                                    |
      | successredirecturl      | https://this_is_not_existing_page_success_redirect.com |
      | errorredirecturl        | https://this_is_not_existing_page_error_redirect.com   |
      | cancelredirecturl       | https://this_is_not_existing_page_cancel_redirect.com  |
    And User opens example page WITH_APM
    And User focuses on APM payment methods section
    When User chooses REDPAGOS from APM list
    Then User will see notification frame text: "Invalid field"


#  Functionality not available on gateway yet
#  Scenario Outline: Bypass requesttypesdescriptions other than AUTH
#    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs BASIC_CONFIG_APM
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value                     |
#      | requesttypedescriptions | <requesttypedescriptions> |
#      | currencyiso3a           | USD                       |
#      | billingcountryiso2a     | UY                        |
#      | baseamount              | 70                        |
#      | billingfirstname        | FirstName                 |
#           | billingdob              | 1980-02-01 |
 #      | billingemail            | FirstName@email.pl  |
#    And User opens example page WITH_APM
#    And User waits for whole form to be displayed
#    And User waits for Pay button to be active
#    When User chooses REDPAGOS from APM list
#    Then User will be sent to apm page - simulator
#
#    Examples:
#      | requesttypedescriptions                             |
#      | THREEDQUERY AUTH                                    |
#      | FRAUDSCORE AUTH                                     |
#      | RISKDEC THREEDQUERY AUTH                            |
#      | THREEDQUERY AUTH RISKDEC                            |
#      | AUTH RISKDEC2                                       |
#      | ACCOUNTCHECK THREEDQUERY AUTH                       |
#      | RISKDEC ACCOUNTCHECK JSINUY AUTH SUBSCRIPTION       |
#      | JSINUY AUTH                                         |
#      | RISKDEC2 ACCOUNTCHECK THREEDQUERY AUTH              |
#      | RISKDEC ACCOUNTCHECK AUTH SUBSCRIPTION              |
#      | THREEDQUERY AUTH SUBSCRIPTION                       |
#      | RISKDEC THREEDQUERY AUTH SUBSCRIPTION               |
#      | RISKDEC ACCOUNTCHECK JSINUY AUTH                    |
#      | RISKDEC ACCOUNTCHECK AUTH                           |
#      | FRAUDSCORE THREEDQUERY AUTH                         |
#      | ACCOUNTCHECK AUTH SUBSCRIPTION                      |
#      | RISKDEC2 THREEDQUERY AUTH SUBSCRIPTION              |
#      | RISKDEC2 AUTH SUBSCRIPTION                          |
#      | JSINUY AUTH FRAUDSCREENING                          |
#      | FRAUDSCORE JSINUY AUTH                              |
#      | ACCOUNTCHECK JSINUY AUTH                            |
#      | RISKDEC AUTH SUBSCRIPTION                           |
#      | ACCOUNTCHECK JSINUY AUTH SUBSCRIPTION               |
#      | RISKDEC2 ACCOUNTCHECK AUTH                          |
#      | THREEDQUERY AUTH FRAUDSCREENING                     |
#      | ORDERDETAILS AUTH                                   |
#      | JSINUY AUTH SUBSCRIPTION                            |
#      | AUTH SUBSCRIPTION                                   |
#      | RISKDEC ACCOUNTCHECK THREEDQUERY AUTH               |
#      | RISKDEC JSINUY AUTH                                 |
#      | RISKDEC2 ACCOUNTCHECK THREEDQUERY AUTH SUBSCRIPTION |
#      | RISKDEC JSINUY AUTH SUBSCRIPTION                    |
#      | RISKDEC2 ACCOUNTCHECK AUTH SUBSCRIPTION             |
#      | RISKDEC AUTH                                        |
#      | RISKDEC2 AUTH                                       |
#      | ACCOUNTCHECK AUTH                                   |
#      | AUTH FRAUDSCREENING                                 |
#      | ACCOUNTCHECK THREEDQUERY AUTH SUBSCRIPTION          |
#      | RISKDEC ACCOUNTCHECK THREEDQUERY AUTH SUBSCRIPTION  |
#      | RISKDEC2 THREEDQUERY AUTH                           |
#      | JSINUY AUTH RISKDEC                                 |
#      | AUTH RISKDEC                                        |
#      | THREEDQUERY AUTH RISKDEC2                           |


  Scenario: successredirecturl and parameters verification
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                                                  |
      | requesttypedescriptions | AUTH                                                   |
      | baseamount              | 70                                                     |
      | billingfirstname        | FirstName                                              |
      | billingemail            | FirstName@email.pl                                     |
      | billingdob              | 1980-02-01                                             |
      | billingcountryiso2a     | UY                                                     |
      | currencyiso3a           | USD                                                    |
      | orderreference          | 123456                                                 |
      | successredirecturl      | https://this_is_not_existing_page_success_redirect.com |
      | errorredirecturl        | https://this_is_not_existing_page_error_redirect.com   |
      | cancelredirecturl       | https://this_is_not_existing_page_cancel_redirect.com  |
    And User opens example page WITH_APM
    And User focuses on APM payment methods section
    And User chooses REDPAGOS from APM list
    And User will be sent to apm page - simulator
    When User will select Succeeded response and submit
    Then User will be sent to page with url "this_is_not_existing_page_success_redirect.com" having params
      | key                    | value    |
      | paymenttypedescription | REDPAGOS |
      | errorcode              | 0        |
      | settlestatus           | 100      |
#      | orderreference         | 123456 | commented on purpose


  Scenario: errorredirecturl and parameters verification
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                                                  |
      | requesttypedescriptions | AUTH                                                   |
      | baseamount              | 70                                                     |
      | billingfirstname        | FirstName                                              |
      | billingemail            | FirstName@email.pl                                     |
      | billingdob              | 1980-02-01                                             |
      | billingcountryiso2a     | UY                                                     |
      | currencyiso3a           | USD                                                    |
      | orderreference          | 123456                                                 |
      | successredirecturl      | https://this_is_not_existing_page_success_redirect.com |
      | errorredirecturl        | https://this_is_not_existing_page_error_redirect.com   |
      | cancelredirecturl       | https://this_is_not_existing_page_cancel_redirect.com  |
    And User opens example page WITH_APM
    And User focuses on APM payment methods section
    And User chooses REDPAGOS from APM list
    And User will be sent to apm page - simulator
    When User will select Failed Unknown response and submit
    Then User will be sent to page with url "this_is_not_existing_page_error_redirect.com" having params
      | key                    | value    |
      | paymenttypedescription | REDPAGOS |
      | errorcode              | 70000    |
      | settlestatus           | 3        |
#      | orderreference         | 123456 |  commented on purpose


  Scenario: default configuration override
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs REDPAGOS_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                                                  |
      | requesttypedescriptions | AUTH                                                   |
      | baseamount              | 70                                                     |
      | billingfirstname        | FirstName                                              |
      | billingemail            | FirstName@email.pl                                     |
      | billingdob              | 1980-02-01                                             |
      | billingcountryiso2a     | UY                                                     |
      | currencyiso3a           | USD                                                    |
      | orderreference          | 123456                                                 |
      | successredirecturl      | https://this_is_not_existing_page_success_redirect.com |
      | errorredirecturl        | https://this_is_not_existing_page_error_redirect.com   |
      | cancelredirecturl       | https://this_is_not_existing_page_cancel_redirect.com  |
    And User opens example page WITH_APM
    And User focuses on APM payment methods section
    And User chooses REDPAGOS from APM list - override placement
    And User will be sent to apm page - simulator
    When User will select Failed Unknown response and submit
    Then User will be sent to page with url "this_is_not_existing_page_return_redirect.com" having params
      | key                    | value    |
      | paymenttypedescription | REDPAGOS |
      | errorcode              | 70000    |
      | settlestatus           | 3        |
#      | orderreference         | 123456 | commented on purpose
