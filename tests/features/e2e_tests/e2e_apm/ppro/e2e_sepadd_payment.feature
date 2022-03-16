@APM
@SEPADD
@STJS-2620
Feature: E2E SEPADD Payments
  As a user
  I want to use SEPADD payment
  If I use alternative payment method


  Scenario Outline: Successful trigger of payment with accepted values for billingcountryiso2a and currencyiso3a
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                                                    |
      | requesttypedescriptions | AUTH                                                     |
      | baseamount              | 70                                                       |
      | billingfirstname        | FirstName                                                |
      | billingemail            | FirstName@email.pl                                       |
      | iban                    | MT00000000000000000000000000                             |
      | billingcountryiso2a     | <billingcountryiso2a>                                    |
      | currencyiso3a           | <currencyiso3a>                                          |
      | successredirecturl      | "https://this_is_not_existing_page_success_redirect.com" |
      | errorredirecturl        | "https://this_is_not_existing_page_error_redirect.com"   |
      | cancelredirecturl       | "https://this_is_not_existing_page_cancel_redirect.com"  |
    And User opens example page WITH_APM
    And User focuses on APM payment methods section
    When User chooses SEPADD from APM list
    Then User will be sent to apm page - simulator

    Examples:
      | billingcountryiso2a | currencyiso3a |
      | AT                  | EUR           |
      | BE                  | EUR           |
      | CY                  | EUR           |
      | DE                  | EUR           |
      | EE                  | EUR           |
      | ES                  | EUR           |
      | FI                  | EUR           |
      | FR                  | EUR           |
      | GR                  | EUR           |
      | IE                  | EUR           |
      | IT                  | EUR           |
      | LT                  | EUR           |
      | LU                  | EUR           |
      | LV                  | EUR           |
      | MC                  | EUR           |
      | MT                  | EUR           |
      | NL                  | EUR           |
      | PT                  | EUR           |
      | SI                  | EUR           |
      | SK                  | EUR           |


  Scenario Outline: Successful trigger of payment with only one of billing name field
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                                                    |
      | requesttypedescriptions | AUTH                                                     |
      | currencyiso3a           | EUR                                                      |
      | billingcountryiso2a     | AT                                                       |
      | baseamount              | 123                                                      |
      | billingemail            | FirstName@email.pl                                       |
      | iban                    | MT00000000000000000000000000                             |
      | billingfirstname        | <billingfirstname>                                       |
      | billinglastname         | <billinglastname>                                        |
      | billingprefixname       | <billingprefixname>                                      |
      | billingmiddlename       | <billingmiddlename>                                      |
      | billingsuffixname       | <billingsuffixname>                                      |
      | successredirecturl      | "https://this_is_not_existing_page_success_redirect.com" |
      | errorredirecturl        | "https://this_is_not_existing_page_error_redirect.com"   |
      | cancelredirecturl       | "https://this_is_not_existing_page_cancel_redirect.com"  |
    And User opens example page WITH_APM
    And User focuses on APM payment methods section
    When User chooses SEPADD from APM list
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
      | key                     | value                                                    |
      | requesttypedescriptions | AUTH                                                     |
      | baseamount              | 70                                                       |
      | billingfirstname        | FirstName                                                |
      | billingemail            | FirstName@email.pl                                       |
      | iban                    | MT00000000000000000000000000                             |
      | billingcountryiso2a     | <billingcountryiso2a>                                    |
      | currencyiso3a           | <currencyiso3a>                                          |
      | successredirecturl      | "https://this_is_not_existing_page_success_redirect.com" |
      | errorredirecturl        | "https://this_is_not_existing_page_error_redirect.com"   |
      | cancelredirecturl       | "https://this_is_not_existing_page_cancel_redirect.com"  |
    When User opens example page WITH_APM
    And User waits for Pay button to be active
    And User focuses on APM payment methods section
    Then SEPADD is not available on APM list

    Examples:
      | billingcountryiso2a | currencyiso3a |
      | AT                  | PLN           |
      | US                  | EUR           |
      |                     | EUR           |


  Scenario Outline: Unsuccessful init - missing at least one of the billing name fields or billingemail or iban
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                                                    |
      | requesttypedescriptions | AUTH                                                     |
      | currencyiso3a           | EUR                                                      |
      | billingcountryiso2a     | AT                                                       |
      | baseamount              | 123                                                      |
      | billingfirstname        | <billingfirstname>                                       |
      | billingemail            | <billingemail>                                           |
      | iban                    | <iban>                                                   |
      | successredirecturl      | "https://this_is_not_existing_page_success_redirect.com" |
      | errorredirecturl        | "https://this_is_not_existing_page_error_redirect.com"   |
      | cancelredirecturl       | "https://this_is_not_existing_page_cancel_redirect.com"  |
    And User opens example page WITH_APM
    And User waits for Pay button to be active
    And User focuses on APM payment methods section
    Then SEPADD is not available on APM list

    Examples:
      | billingfirstname | billingemail | iban                         |
      | billingfirstname |              | MT00000000000000000000000000 |
#      | billingfirstname | billingemail@billingemail.pl |                              |


  Scenario: Successful trigger of payment with updated jwt
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                                                    |
      | requesttypedescriptions | AUTH                                                     |
      | baseamount              | 70                                                       |
      | billingfirstname        | FirstName                                                |
      | billingemail            | FirstName@email.pl                                       |
      | iban                    | MT00000000000000000000000000                             |
      | billingcountryiso2a     | AT                                                       |
      | currencyiso3a           | EUR                                                      |
      | successredirecturl      | "https://this_is_not_existing_page_success_redirect.com" |
      | errorredirecturl        | "https://this_is_not_existing_page_error_redirect.com"   |
      | cancelredirecturl       | "https://this_is_not_existing_page_cancel_redirect.com"  |
    And User opens page WITH_APM and WITH_UPDATE_JWT - jwt BASE_JWT with additional attributes
      | key                     | value                                                    |
      | requesttypedescriptions | AUTH                                                     |
      | baseamount              | 707                                                      |
      | billinglastname         | LastNameUpdated                                          |
      | billingemail            | FirstName@email.pl                                       |
      | iban                    | MT00000000000000000000000000                             |
      | billingcountryiso2a     | FR                                                       |
      | currencyiso3a           | EUR                                                      |
      | successredirecturl      | "https://this_is_not_existing_page_success_redirect.com" |
      | errorredirecturl        | "https://this_is_not_existing_page_error_redirect.com"   |
      | cancelredirecturl       | "https://this_is_not_existing_page_cancel_redirect.com"  |
    And User waits for Pay button to be active
    And User calls updateJWT function by filling amount field
    When User chooses SEPADD from APM list
    Then User will be sent to apm page - simulator


  Scenario: Unsuccessful init - update jwt with not supported values for billingcountryiso2a and currencyiso3a
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                                                    |
      | requesttypedescriptions | AUTH                                                     |
      | baseamount              | 70                                                       |
      | billingfirstname        | FirstName                                                |
      | billingemail            | FirstName@email.pl                                       |
      | iban                    | MT00000000000000000000000000                             |
      | billingcountryiso2a     | AT                                                       |
      | currencyiso3a           | EUR                                                      |
      | successredirecturl      | "https://this_is_not_existing_page_success_redirect.com" |
      | errorredirecturl        | "https://this_is_not_existing_page_error_redirect.com"   |
      | cancelredirecturl       | "https://this_is_not_existing_page_cancel_redirect.com"  |
    And User opens page WITH_APM and WITH_UPDATE_JWT - jwt BASE_JWT with additional attributes
      | key                     | value                                                    |
      | requesttypedescriptions | AUTH                                                     |
      | baseamount              | 707                                                      |
      | billingfirstname        | FirstName                                                |
      | billingemail            | FirstName@email.pl                                       |
      | iban                    | MT00000000000000000000000000                             |
      | billingcountryiso2a     | US                                                       |
      | currencyiso3a           | EUR                                                      |
      | successredirecturl      | "https://this_is_not_existing_page_success_redirect.com" |
      | errorredirecturl        | "https://this_is_not_existing_page_error_redirect.com"   |
      | cancelredirecturl       | "https://this_is_not_existing_page_cancel_redirect.com"  |
    And User waits for Pay button to be active
    When User calls updateJWT function by filling amount field
    And User focuses on APM payment methods section
    Then SEPADD is not available on APM list


  Scenario: Unsuccessful init - update jwt with missing required fields
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                                                    |
      | requesttypedescriptions | AUTH                                                     |
      | baseamount              | 70                                                       |
      | billingfirstname        | FirstName                                                |
      | billingemail            | FirstName@email.pl                                       |
      | iban                    | MT00000000000000000000000000                             |
      | billingcountryiso2a     | AT                                                       |
      | currencyiso3a           | EUR                                                      |
      | successredirecturl      | "https://this_is_not_existing_page_success_redirect.com" |
      | errorredirecturl        | "https://this_is_not_existing_page_error_redirect.com"   |
      | cancelredirecturl       | "https://this_is_not_existing_page_cancel_redirect.com"  |
    And User opens page WITH_APM and WITH_UPDATE_JWT - jwt BASE_JWT with additional attributes
      | key                     | value                                                    |
      | requesttypedescriptions | AUTH                                                     |
      | baseamount              | 707                                                      |
      | billingcountryiso2a     | AT                                                       |
      | currencyiso3a           | EUR                                                      |
      | successredirecturl      | "https://this_is_not_existing_page_success_redirect.com" |
      | errorredirecturl        | "https://this_is_not_existing_page_error_redirect.com"   |
      | cancelredirecturl       | "https://this_is_not_existing_page_cancel_redirect.com"  |
    And User waits for Pay button to be active
    When User calls updateJWT function by filling amount field
    And User focuses on APM payment methods section
    Then SEPADD is not available on APM list


  Scenario: Unsuccessful trigger of payment without AUTH in requesttypesdescriptions
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                                                    |
      | requesttypedescriptions | THREEDQUERY RISKDEC                                      |
      | baseamount              | 70                                                       |
      | billingfirstname        | FirstName                                                |
      | billingemail            | FirstName@email.pl                                       |
      | iban                    | MT00000000000000000000000000                             |
      | billingcountryiso2a     | AT                                                       |
      | currencyiso3a           | EUR                                                      |
      | successredirecturl      | "https://this_is_not_existing_page_success_redirect.com" |
      | errorredirecturl        | "https://this_is_not_existing_page_error_redirect.com"   |
      | cancelredirecturl       | "https://this_is_not_existing_page_cancel_redirect.com"  |
    And User opens example page WITH_APM
    And User focuses on APM payment methods section
    When User chooses SEPADD from APM list
    Then User will see notification frame text: "Invalid field"


#  Functionality not available on gateway yet
#  Scenario Outline: Bypass requesttypesdescriptions other than AUTH
#    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs BASIC_CONFIG_APM
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value                     |
#      | requesttypedescriptions | <requesttypedescriptions> |
#      | currencyiso3a           | EUR                       |
#      | billingcountryiso2a     | AT                        |
#      | baseamount              | 70                        |
#        | billingfirstname        | FirstName                    |
#      | billingemail            | FirstName@email.pl           |
#      | iban                    | MT00000000000000000000000000 |
#    And User opens example page WITH_APM
#    And User waits for whole form to be displayed
#    And User waits for Pay button to be active
#    When User chooses SEPADD from APM list
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
#      | RISKDEC ACCOUNTCHECK JSINAT AUTH SUBSCRIPTION       |
#      | JSINAT AUTH                                         |
#      | RISKDEC2 ACCOUNTCHECK THREEDQUERY AUTH              |
#      | RISKDEC ACCOUNTCHECK AUTH SUBSCRIPTION              |
#      | THREEDQUERY AUTH SUBSCRIPTION                       |
#      | RISKDEC THREEDQUERY AUTH SUBSCRIPTION               |
#      | RISKDEC ACCOUNTCHECK JSINAT AUTH                    |
#      | RISKDEC ACCOUNTCHECK AUTH                           |
#      | FRAUDSCORE THREEDQUERY AUTH                         |
#      | ACCOUNTCHECK AUTH SUBSCRIPTION                      |
#      | RISKDEC2 THREEDQUERY AUTH SUBSCRIPTION              |
#      | RISKDEC2 AUTH SUBSCRIPTION                          |
#      | JSINAT AUTH FRAUDSCREENING                          |
#      | FRAUDSCORE JSINAT AUTH                              |
#      | ACCOUNTCHECK JSINAT AUTH                            |
#      | RISKDEC AUTH SUBSCRIPTION                           |
#      | ACCOUNTCHECK JSINAT AUTH SUBSCRIPTION               |
#      | RISKDEC2 ACCOUNTCHECK AUTH                          |
#      | THREEDQUERY AUTH FRAUDSCREENING                     |
#      | ORDERDETAILS AUTH                                   |
#      | JSINAT AUTH SUBSCRIPTION                            |
#      | AUTH SUBSCRIPTION                                   |
#      | RISKDEC ACCOUNTCHECK THREEDQUERY AUTH               |
#      | RISKDEC JSINAT AUTH                                 |
#      | RISKDEC2 ACCOUNTCHECK THREEDQUERY AUTH SUBSCRIPTION |
#      | RISKDEC JSINAT AUTH SUBSCRIPTION                    |
#      | RISKDEC2 ACCOUNTCHECK AUTH SUBSCRIPTION             |
#      | RISKDEC AUTH                                        |
#      | RISKDEC2 AUTH                                       |
#      | ACCOUNTCHECK AUTH                                   |
#      | AUTH FRAUDSCREENING                                 |
#      | ACCOUNTCHECK THREEDQUERY AUTH SUBSCRIPTION          |
#      | RISKDEC ACCOUNTCHECK THREEDQUERY AUTH SUBSCRIPTION  |
#      | RISKDEC2 THREEDQUERY AUTH                           |
#      | JSINAT AUTH RISKDEC                                 |
#      | AUTH RISKDEC                                        |
#      | THREEDQUERY AUTH RISKDEC2                           |


  Scenario: successredirecturl and parameters verification
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                                                    |
      | requesttypedescriptions | AUTH                                                     |
      | baseamount              | 70                                                       |
      | billingfirstname        | FirstName                                                |
      | billingemail            | FirstName@email.pl                                       |
      | iban                    | MT00000000000000000000000000                             |
      | billingcountryiso2a     | AT                                                       |
      | currencyiso3a           | EUR                                                      |
      | orderreference          | 123456                                                   |
      | successredirecturl      | "https://this_is_not_existing_page_success_redirect.com" |
      | errorredirecturl        | "https://this_is_not_existing_page_error_redirect.com"   |
      | cancelredirecturl       | "https://this_is_not_existing_page_cancel_redirect.com"  |
    And User opens example page WITH_APM
    And User focuses on APM payment methods section
    And User chooses SEPADD from APM list
    And User will be sent to apm page - simulator
    When User will select Succeeded response and submit
    Then User will be sent to page with url "this_is_not_existing_page_success_redirect.com" having params
      | key                    | value  |
      | paymenttypedescription | SEPADD |
      | errorcode              | 0      |
      | settlestatus           | 100    |
#      | orderreference         | 123456 | commented on purpose


  Scenario: errorredirecturl and parameters verification
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                                                    |
      | requesttypedescriptions | AUTH                                                     |
      | baseamount              | 70                                                       |
      | billingfirstname        | FirstName                                                |
      | billingemail            | FirstName@email.pl                                       |
      | iban                    | MT00000000000000000000000000                             |
      | billingcountryiso2a     | AT                                                       |
      | currencyiso3a           | EUR                                                      |
      | orderreference          | 123456                                                   |
      | successredirecturl      | "https://this_is_not_existing_page_success_redirect.com" |
      | errorredirecturl        | "https://this_is_not_existing_page_error_redirect.com"   |
      | cancelredirecturl       | "https://this_is_not_existing_page_cancel_redirect.com"  |
    And User opens example page WITH_APM
    And User focuses on APM payment methods section
    And User chooses SEPADD from APM list
    And User will be sent to apm page - simulator
    When User will select Failed Unknown response and submit
    Then User will be sent to page with url "this_is_not_existing_page_error_redirect.com" having params
      | key                    | value  |
      | paymenttypedescription | SEPADD |
      | errorcode              | 70000  |
      | settlestatus           | 3      |
#      | orderreference         | 123456 |  commented on purpose


  Scenario: default configuration override
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs SEPADD_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                                                    |
      | requesttypedescriptions | AUTH                                                     |
      | baseamount              | 70                                                       |
      | billingfirstname        | FirstName                                                |
      | billingemail            | FirstName@email.pl                                       |
      | iban                    | MT00000000000000000000000000                             |
      | billingcountryiso2a     | AT                                                       |
      | currencyiso3a           | EUR                                                      |
      | orderreference          | 123456                                                   |
      | successredirecturl      | "https://this_is_not_existing_page_success_redirect.com" |
      | errorredirecturl        | "https://this_is_not_existing_page_error_redirect.com"   |
      | cancelredirecturl       | "https://this_is_not_existing_page_cancel_redirect.com"  |
    And User opens example page WITH_APM
    And User focuses on APM payment methods section
    And User chooses SEPADD from APM list - override placement
    And User will be sent to apm page - simulator
    When User will select Failed Unknown response and submit
    Then User will be sent to page with url "this_is_not_existing_page_return_redirect.com" having params
      | key                    | value  |
      | paymenttypedescription | SEPADD |
      | errorcode              | 70000  |
      | settlestatus           | 3      |
#      | orderreference         | 123456 | commented on purpose
