@APM
@POSTFINANCE
@STJS-2497
Feature: E2E POSTFINANCE Payments
  As a user
  I want to use POSTFINANCE payment
  If I use alternative payment method


  Scenario Outline: Successful trigger of payment with accepted values for billingcountryiso2a and currencyiso3a
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                                                  |
      | requesttypedescriptions | AUTH                                                   |
      | baseamount              | 70                                                     |
      | billingfirstname        | FirstName                                              |
      | billingcountryiso2a     | <billingcountryiso2a>                                  |
      | currencyiso3a           | <currencyiso3a>                                        |
      | successRedirectUrl      | https://this_is_not_existing_page_success_redirect.com |
      | errorRedirectUrl        | https://this_is_not_existing_page_error_redirect.com   |
      | cancelRedirectUrl       | https://this_is_not_existing_page_cancel_redirect.com  |
    And User opens example page WITH_APM
    And User focuses on APM payment methods section
    When User chooses POSTFINANCE from APM list
    Then User will be sent to apm page - simulator

    Examples:
      | billingcountryiso2a | currencyiso3a |
      | CH                  | CHF           |
      | CH                  | EUR           |


  Scenario Outline: Successful trigger of payment with only one of billing name field
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                                                  |
      | requesttypedescriptions | AUTH                                                   |
      | currencyiso3a           | EUR                                                    |
      | billingcountryiso2a     | CH                                                     |
      | baseamount              | 123                                                    |
      | billingfirstname        | <billingfirstname>                                     |
      | billinglastname         | <billinglastname>                                      |
      | billingprefixname       | <billingprefixname>                                    |
      | billingmiddlename       | <billingmiddlename>                                    |
      | billingsuffixname       | <billingsuffixname>                                    |
      | successRedirectUrl      | https://this_is_not_existing_page_success_redirect.com |
      | errorRedirectUrl        | https://this_is_not_existing_page_error_redirect.com   |
      | cancelRedirectUrl       | https://this_is_not_existing_page_cancel_redirect.com  |
    And User opens example page WITH_APM
    And User focuses on APM payment methods section
    When User chooses POSTFINANCE from APM list
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
      | billinglastname         | LastName                                               |
      | billingcountryiso2a     | <billingcountryiso2a>                                  |
      | currencyiso3a           | <currencyiso3a>                                        |
      | successRedirectUrl      | https://this_is_not_existing_page_success_redirect.com |
      | errorRedirectUrl        | https://this_is_not_existing_page_error_redirect.com   |
      | cancelRedirectUrl       | https://this_is_not_existing_page_cancel_redirect.com  |
    When User opens example page WITH_APM
    And User waits for Pay button to be active
    And User focuses on APM payment methods section
    Then POSTFINANCE is not available on APM list

    Examples:
      | billingcountryiso2a | currencyiso3a |
      | CH                  | PLN           |
      |                     | PLN           |
      | PL                  | EUR           |
      |                     | CHF           |
      |                     | EUR           |


  Scenario: Unsuccessful init - missing at least one of the billing name fields
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                                                  |
      | requesttypedescriptions | AUTH                                                   |
      | currencyiso3a           | EUR                                                    |
      | billingcountryiso2a     | CH                                                     |
      | baseamount              | 123                                                    |
      | successRedirectUrl      | https://this_is_not_existing_page_success_redirect.com |
      | errorRedirectUrl        | https://this_is_not_existing_page_error_redirect.com   |
      | cancelRedirectUrl       | https://this_is_not_existing_page_cancel_redirect.com  |
    And User opens example page WITH_APM
    And User waits for Pay button to be active
    And User focuses on APM payment methods section
    # to be used with STJS-2443 & STJS-2444
    #    Then POSTFINANCE is not available on APM list
    When User chooses POSTFINANCE from APM list
    Then User will see notification frame text: "Invalid field"


  Scenario: Successful trigger of payment with updated jwt
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                                                  |
      | requesttypedescriptions | AUTH                                                   |
      | baseamount              | 70                                                     |
      | billingfirstname        | FirstName                                              |
      | billingcountryiso2a     | CH                                                     |
      | currencyiso3a           | EUR                                                    |
      | successRedirectUrl      | https://this_is_not_existing_page_success_redirect.com |
      | errorRedirectUrl        | https://this_is_not_existing_page_error_redirect.com   |
      | cancelRedirectUrl       | https://this_is_not_existing_page_cancel_redirect.com  |
    And User opens page WITH_APM and WITH_UPDATE_JWT - jwt BASE_JWT with additional attributes
      | key                     | value                                                  |
      | requesttypedescriptions | AUTH                                                   |
      | baseamount              | 707                                                    |
      | billinglastname         | LastNameUpdated                                        |
      | billingcountryiso2a     | CH                                                     |
      | currencyiso3a           | CHF                                                    |
      | successRedirectUrl      | https://this_is_not_existing_page_success_redirect.com |
      | errorRedirectUrl        | https://this_is_not_existing_page_error_redirect.com   |
      | cancelRedirectUrl       | https://this_is_not_existing_page_cancel_redirect.com  |
    And User waits for Pay button to be active
    And User calls updateJWT function by filling amount field
    When User chooses POSTFINANCE from APM list
    Then User will be sent to apm page - simulator


  Scenario: Unsuccessful init - update jwt with not supported values for billingcountryiso2a and currencyiso3a
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                                                  |
      | requesttypedescriptions | AUTH                                                   |
      | baseamount              | 70                                                     |
      | billingfirstname        | FirstName                                              |
      | billinglastname         | LastName                                               |
      | billingcountryiso2a     | CH                                                     |
      | currencyiso3a           | EUR                                                    |
      | successRedirectUrl      | https://this_is_not_existing_page_success_redirect.com |
      | errorRedirectUrl        | https://this_is_not_existing_page_error_redirect.com   |
      | cancelRedirectUrl       | https://this_is_not_existing_page_cancel_redirect.com  |
    And User opens page WITH_APM and WITH_UPDATE_JWT - jwt BASE_JWT with additional attributes
      | key                     | value                                                  |
      | requesttypedescriptions | AUTH                                                   |
      | baseamount              | 707                                                    |
      | billingfirstname        | FirstNameUpdated                                       |
      | billinglastname         | LastNameUpdated                                        |
      | billingcountryiso2a     | PL                                                     |
      | currencyiso3a           | EUR                                                    |
      | successRedirectUrl      | https://this_is_not_existing_page_success_redirect.com |
      | errorRedirectUrl        | https://this_is_not_existing_page_error_redirect.com   |
      | cancelRedirectUrl       | https://this_is_not_existing_page_cancel_redirect.com  |
    And User waits for Pay button to be active
    When User calls updateJWT function by filling amount field
    And User focuses on APM payment methods section
    Then POSTFINANCE is not available on APM list


  Scenario: Unsuccessful init - update jwt with missing required fields
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                                                  |
      | requesttypedescriptions | AUTH                                                   |
      | baseamount              | 70                                                     |
      | billinglastname         | LastName                                               |
      | billingcountryiso2a     | CH                                                     |
      | currencyiso3a           | EUR                                                    |
      | successRedirectUrl      | https://this_is_not_existing_page_success_redirect.com |
      | errorRedirectUrl        | https://this_is_not_existing_page_error_redirect.com   |
      | cancelRedirectUrl       | https://this_is_not_existing_page_cancel_redirect.com  |
    And User opens page WITH_APM and WITH_UPDATE_JWT - jwt BASE_JWT with additional attributes
      | key                     | value                                                  |
      | requesttypedescriptions | AUTH                                                   |
      | baseamount              | 707                                                    |
      | currencyiso3a           | EUR                                                    |
      | successRedirectUrl      | https://this_is_not_existing_page_success_redirect.com |
      | errorRedirectUrl        | https://this_is_not_existing_page_error_redirect.com   |
      | cancelRedirectUrl       | https://this_is_not_existing_page_cancel_redirect.com  |
    And User waits for Pay button to be active
    When User calls updateJWT function by filling amount field
    And User focuses on APM payment methods section
    Then POSTFINANCE is not available on APM list


  Scenario: Unsuccessful trigger of payment without AUTH in requesttypesdescriptions
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                                                  |
      | requesttypedescriptions | THREEDQUERY RISKDEC                                    |
      | baseamount              | 70                                                     |
      | billingfirstname        | FirstName                                              |
      | billinglastname         | LastName                                               |
      | billingcountryiso2a     | CH                                                     |
      | currencyiso3a           | EUR                                                    |
      | successRedirectUrl      | https://this_is_not_existing_page_success_redirect.com |
      | errorRedirectUrl        | https://this_is_not_existing_page_error_redirect.com   |
      | cancelRedirectUrl       | https://this_is_not_existing_page_cancel_redirect.com  |
    And User opens example page WITH_APM
    And User focuses on APM payment methods section
    When User chooses POSTFINANCE from APM list
    Then User will see notification frame text: "Invalid field"


#  Functionality not available on gateway yet
#  Scenario Outline: Bypass requesttypesdescriptions other than AUTH
#    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs BASIC_CONFIG_APM
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value                     |
#      | requesttypedescriptions | <requesttypedescriptions> |
#      | currencyiso3a           | EUR                       |
#      | billingcountryiso2a     | CH                        |
#      | baseamount              | 70                        |
#      | billingfirstname        | FirstName                 |
#      | billinglastname         | LastName                  |
#    And User opens example page WITH_APM
#    And User waits for whole form to be displayed
#    And User waits for Pay button to be active
#    When User chooses POSTFINANCE from APM list
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
#      | RISKDEC ACCOUNTCHECK JSINCH AUTH SUBSCRIPTION       |
#      | JSINCH AUTH                                         |
#      | RISKDEC2 ACCOUNTCHECK THREEDQUERY AUTH              |
#      | RISKDEC ACCOUNTCHECK AUTH SUBSCRIPTION              |
#      | THREEDQUERY AUTH SUBSCRIPTION                       |
#      | RISKDEC THREEDQUERY AUTH SUBSCRIPTION               |
#      | RISKDEC ACCOUNTCHECK JSINCH AUTH                    |
#      | RISKDEC ACCOUNTCHECK AUTH                           |
#      | FRAUDSCORE THREEDQUERY AUTH                         |
#      | ACCOUNTCHECK AUTH SUBSCRIPTION                      |
#      | RISKDEC2 THREEDQUERY AUTH SUBSCRIPTION              |
#      | RISKDEC2 AUTH SUBSCRIPTION                          |
#      | JSINCH AUTH FRAUDSCREENING                          |
#      | FRAUDSCORE JSINCH AUTH                              |
#      | ACCOUNTCHECK JSINCH AUTH                            |
#      | RISKDEC AUTH SUBSCRIPTION                           |
#      | ACCOUNTCHECK JSINCH AUTH SUBSCRIPTION               |
#      | RISKDEC2 ACCOUNTCHECK AUTH                          |
#      | THREEDQUERY AUTH FRAUDSCREENING                     |
#      | ORDERDETAILS AUTH                                   |
#      | JSINCH AUTH SUBSCRIPTION                            |
#      | AUTH SUBSCRIPTION                                   |
#      | RISKDEC ACCOUNTCHECK THREEDQUERY AUTH               |
#      | RISKDEC JSINCH AUTH                                 |
#      | RISKDEC2 ACCOUNTCHECK THREEDQUERY AUTH SUBSCRIPTION |
#      | RISKDEC JSINCH AUTH SUBSCRIPTION                    |
#      | RISKDEC2 ACCOUNTCHECK AUTH SUBSCRIPTION             |
#      | RISKDEC AUTH                                        |
#      | RISKDEC2 AUTH                                       |
#      | ACCOUNTCHECK AUTH                                   |
#      | AUTH FRAUDSCREENING                                 |
#      | ACCOUNTCHECK THREEDQUERY AUTH SUBSCRIPTION          |
#      | RISKDEC ACCOUNTCHECK THREEDQUERY AUTH SUBSCRIPTION  |
#      | RISKDEC2 THREEDQUERY AUTH                           |
#      | JSINCH AUTH RISKDEC                                 |
#      | AUTH RISKDEC                                        |
#      | THREEDQUERY AUTH RISKDEC2                           |


  Scenario: successRedirectUrl and parameters verification
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                                                  |
      | requesttypedescriptions | AUTH                                                   |
      | baseamount              | 70                                                     |
      | billingfirstname        | FirstName                                              |
      | billinglastname         | LastName                                               |
      | billingcountryiso2a     | CH                                                     |
      | currencyiso3a           | EUR                                                    |
      | orderreference          | 123456                                                 |
      | successRedirectUrl      | https://this_is_not_existing_page_success_redirect.com |
      | errorRedirectUrl        | https://this_is_not_existing_page_error_redirect.com   |
      | cancelRedirectUrl       | https://this_is_not_existing_page_cancel_redirect.com  |
    And User opens example page WITH_APM
    And User focuses on APM payment methods section
    And User chooses POSTFINANCE from APM list
    And User will be sent to apm page - simulator
    When User will select Succeeded response and submit
    Then User will be sent to page with url "this_is_not_existing_page_success_redirect.com" having params
      | key                    | value       |
      | paymenttypedescription | POSTFINANCE |
      | errorcode              | 0           |
      | settlestatus           | 100         |
#      | orderreference         | 123456 | commented on purpose


  Scenario: errorRedirectUrl and parameters verification
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                                                  |
      | requesttypedescriptions | AUTH                                                   |
      | baseamount              | 70                                                     |
      | billingfirstname        | FirstName                                              |
      | billinglastname         | LastName                                               |
      | billingcountryiso2a     | CH                                                     |
      | currencyiso3a           | EUR                                                    |
      | orderreference          | 123456                                                 |
      | successRedirectUrl      | https://this_is_not_existing_page_success_redirect.com |
      | errorRedirectUrl        | https://this_is_not_existing_page_error_redirect.com   |
      | cancelRedirectUrl       | https://this_is_not_existing_page_cancel_redirect.com  |
    And User opens example page WITH_APM
    And User focuses on APM payment methods section
    And User chooses POSTFINANCE from APM list
    And User will be sent to apm page - simulator
    When User will select Failed Unknown response and submit
    Then User will be sent to page with url "this_is_not_existing_page_error_redirect.com" having params
      | key                    | value       |
      | paymenttypedescription | POSTFINANCE |
      | errorcode              | 70000       |
      | settlestatus           | 3           |
#      | orderreference         | 123456 |  commented on purpose


  Scenario: default configuration override
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs POSTFINANCE_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                                                  |
      | requesttypedescriptions | AUTH                                                   |
      | baseamount              | 70                                                     |
      | billingfirstname        | FirstName                                              |
      | billinglastname         | LastName                                               |
      | billingcountryiso2a     | CH                                                     |
      | currencyiso3a           | EUR                                                    |
      | orderreference          | 123456                                                 |
      | successRedirectUrl      | https://this_is_not_existing_page_success_redirect.com |
      | errorRedirectUrl        | https://this_is_not_existing_page_error_redirect.com   |
      | cancelRedirectUrl       | https://this_is_not_existing_page_cancel_redirect.com  |
    And User opens example page WITH_APM
    And User focuses on APM payment methods section
    And User chooses POSTFINANCE from APM list - override placement
    And User will be sent to apm page - simulator
    When User will select Failed Unknown response and submit
    Then User will be sent to page with url "payments.securetrading.net" having params
      | key                    | value       |
      | paymenttypedescription | POSTFINANCE |
      | errorcode              | 70000       |
      | settlestatus           | 3           |
#      | orderreference         | 123456 | commented on purpose
