@APM
@UNIONPAY
@STJS-2525
Feature: E2E UNIONPAY Payments
  As a user
  I want to use UNIONPAY payment
  If I use alternative payment method


  Scenario Outline: Successful trigger of payment with accepted values for billingcountryiso2a and currencyiso3a
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                                                  |
      | requesttypedescriptions | AUTH                                                   |
      | accounttypedescription  | ECOM                                                   |
      | baseamount              | 70                                                     |
      | billingfirstname        | FirstName                                              |
      | billingcountryiso2a     | CN                                                     |
      | currencyiso3a           | <currencyiso3a>                                        |
      | successredirecturl      | https://this_is_not_existing_page_success_redirect.com |
      | errorredirecturl        | https://this_is_not_existing_page_error_redirect.com   |
      | cancelredirecturl       | https://this_is_not_existing_page_cancel_redirect.com  |
    And User opens example page WITH_APM
    And User focuses on APM payment methods section
    When User chooses UNIONPAY from APM list
    Then User will be sent to apm page - simulator

    Examples:
      | currencyiso3a |
      | CNY           |
      | EUR           |


  Scenario Outline: Successful trigger of payment with only one of billing name field and billingemail
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                                                  |
      | requesttypedescriptions | AUTH                                                   |
      | accounttypedescription  | ECOM                                                   |
      | currencyiso3a           | CNY                                                    |
      | billingcountryiso2a     | CN                                                     |
      | baseamount              | 123                                                    |
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
    When User chooses UNIONPAY from APM list
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
      | accounttypedescription  | ECOM                                                   |
      | baseamount              | 70                                                     |
      | billingfirstname        | FirstName                                              |
      | billingcountryiso2a     | <billingcountryiso2a>                                  |
      | currencyiso3a           | <currencyiso3a>                                        |
      | successredirecturl      | https://this_is_not_existing_page_success_redirect.com |
      | errorredirecturl        | https://this_is_not_existing_page_error_redirect.com   |
      | cancelredirecturl       | https://this_is_not_existing_page_cancel_redirect.com  |
    When User opens example page WITH_APM
    And User waits for Pay button to be active
    And User focuses on APM payment methods section
    Then UNIONPAY is not available on APM list

    Examples:
      | billingcountryiso2a | currencyiso3a |
      | CN                  | PLN           |
      | PL                  | BYN           |
      | GB                  |               |


  Scenario: Unsuccessful init - missing billingfirstname and billinglastname
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                                                  |
      | requesttypedescriptions | AUTH                                                   |
      | accounttypedescription  | ECOM                                                   |
      | currencyiso3a           | CNY                                                    |
      | billingcountryiso2a     | CN                                                     |
      | baseamount              | 123                                                    |
      | billingfirstname        |                                                        |
      | billinglastname         |                                                        |
      | successredirecturl      | https://this_is_not_existing_page_success_redirect.com |
      | errorredirecturl        | https://this_is_not_existing_page_error_redirect.com   |
      | cancelredirecturl       | https://this_is_not_existing_page_cancel_redirect.com  |
    And User opens example page WITH_APM
    And User waits for Pay button to be active
    And User focuses on APM payment methods section
    # to be used with STJS-2443 & STJS-2444
    #    Then UNIONPAY is not available on APM list
    When User chooses UNIONPAY from APM list
    Then User will see notification frame text: "Invalid field"


  Scenario: Successful trigger of payment with updated jwt
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                                                  |
      | requesttypedescriptions | AUTH                                                   |
      | baseamount              | 70                                                     |
      | billingfirstname        | FirstName                                              |
      | currencyiso3a           | CNY                                                    |
      | billingcountryiso2a     | CN                                                     |
      | successredirecturl      | https://this_is_not_existing_page_success_redirect.com |
      | errorredirecturl        | https://this_is_not_existing_page_error_redirect.com   |
      | cancelredirecturl       | https://this_is_not_existing_page_cancel_redirect.com  |
    And User opens page WITH_APM and WITH_UPDATE_JWT - jwt BASE_JWT with additional attributes
      | key                     | value                                                  |
      | requesttypedescriptions | AUTH                                                   |
      | baseamount              | 707                                                    |
      | billinglastname         | LastNameUpdated                                        |
      | billingcountryiso2a     | CN                                                     |
      | currencyiso3a           | EUR                                                    |
      | successredirecturl      | https://this_is_not_existing_page_success_redirect.com |
      | errorredirecturl        | https://this_is_not_existing_page_error_redirect.com   |
      | cancelredirecturl       | https://this_is_not_existing_page_cancel_redirect.com  |
    And User waits for Pay button to be active
    And User calls updateJWT function by filling amount field
    When User chooses UNIONPAY from APM list
    Then User will be sent to apm page - simulator


  Scenario: Unsuccessful init - update jwt with not supported values for billingcountryiso2a and currencyiso3a
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                                                  |
      | requesttypedescriptions | AUTH                                                   |
      | baseamount              | 70                                                     |
      | billingfirstname        | FirstName                                              |
      | billingcountryiso2a     | CN                                                     |
      | currencyiso3a           | CNY                                                    |
      | successredirecturl      | https://this_is_not_existing_page_success_redirect.com |
      | errorredirecturl        | https://this_is_not_existing_page_error_redirect.com   |
      | cancelredirecturl       | https://this_is_not_existing_page_cancel_redirect.com  |
    And User opens page WITH_APM and WITH_UPDATE_JWT - jwt BASE_JWT with additional attributes
      | key                     | value                                                  |
      | requesttypedescriptions | AUTH                                                   |
      | baseamount              | 707                                                    |
      | billingfirstname        | FirstNameUpdated                                       |
      | billingcountryiso2a     | CZ                                                     |
      | currencyiso3a           | EUR                                                    |
      | successredirecturl      | https://this_is_not_existing_page_success_redirect.com |
      | errorredirecturl        | https://this_is_not_existing_page_error_redirect.com   |
      | cancelredirecturl       | https://this_is_not_existing_page_cancel_redirect.com  |
    And User waits for Pay button to be active
    When User calls updateJWT function by filling amount field
    And User focuses on APM payment methods section
    Then UNION is not available on APM list


  Scenario: Unsuccessful init - update jwt with missing required fields
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                                                  |
      | requesttypedescriptions | AUTH                                                   |
      | baseamount              | 70                                                     |
      | billinglastname         | LastName                                               |
      | billingcountryiso2a     | CN                                                     |
      | successredirecturl      | https://this_is_not_existing_page_success_redirect.com |
      | errorredirecturl        | https://this_is_not_existing_page_error_redirect.com   |
      | cancelredirecturl       | https://this_is_not_existing_page_cancel_redirect.com  |
    And User opens page WITH_APM and WITH_UPDATE_JWT - jwt BASE_JWT with additional attributes
      | key                     | value                                                  |
      | requesttypedescriptions | AUTH                                                   |
      | baseamount              | 707                                                    |
      | billinglastname         | LastNameX                                              |
      | successredirecturl      | https://this_is_not_existing_page_success_redirect.com |
      | errorredirecturl        | https://this_is_not_existing_page_error_redirect.com   |
      | cancelredirecturl       | https://this_is_not_existing_page_cancel_redirect.com  |
    And User waits for Pay button to be active
    When User calls updateJWT function by filling amount field
    And User focuses on APM payment methods section
    Then UNIONPAY is not available on APM list


  Scenario: Unsuccessful trigger of payment without AUTH in requesttypesdescriptions
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                                                  |
      | requesttypedescriptions | THREEDQUERY RISKDEC                                    |
      | baseamount              | 70                                                     |
      | billingfirstname        | FirstName                                              |
      | billingcountryiso2a     | CN                                                     |
      | currencyiso3a           | CNY                                                    |
      | successredirecturl      | https://this_is_not_existing_page_success_redirect.com |
      | errorredirecturl        | https://this_is_not_existing_page_error_redirect.com   |
      | cancelredirecturl       | https://this_is_not_existing_page_cancel_redirect.com  |
    And User opens example page WITH_APM
    And User focuses on APM payment methods section
    When User chooses UNIONPAY from APM list
    Then User will see notification frame text: "Invalid field"


#  Functionality not available on gateway yet
#  Scenario Outline: Bypass requesttypesdescriptions other than AUTH
#    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs BASIC_CONFIG_APM
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value                     |
#      | requesttypedescriptions | <requesttypedescriptions> |
#      | currencyiso3a           | EUR                       |
#      | billingcountryiso2a     | PL                        |
#      | baseamount              | 70                        |
#      | billingfirstname        | FirstName                 |
#    And User opens example page WITH_APM
#    And User waits for whole form to be displayed
#    And User waits for Pay button to be active
#    When User chooses UNIONPAY from APM list
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
#      | RISKDEC ACCOUNTCHECK JSINPL AUTH SUBSCRIPTION       |
#      | JSINPL AUTH                                         |
#      | RISKDEC2 ACCOUNTCHECK THREEDQUERY AUTH              |
#      | RISKDEC ACCOUNTCHECK AUTH SUBSCRIPTION              |
#      | THREEDQUERY AUTH SUBSCRIPTION                       |
#      | RISKDEC THREEDQUERY AUTH SUBSCRIPTION               |
#      | RISKDEC ACCOUNTCHECK JSINPL AUTH                    |
#      | RISKDEC ACCOUNTCHECK AUTH                           |
#      | FRAUDSCORE THREEDQUERY AUTH                         |
#      | ACCOUNTCHECK AUTH SUBSCRIPTION                      |
#      | RISKDEC2 THREEDQUERY AUTH SUBSCRIPTION              |
#      | RISKDEC2 AUTH SUBSCRIPTION                          |
#      | JSINPL AUTH FRAUDSCREENING                          |
#      | FRAUDSCORE JSINPL AUTH                              |
#      | ACCOUNTCHECK JSINPL AUTH                            |
#      | RISKDEC AUTH SUBSCRIPTION                           |
#      | ACCOUNTCHECK JSINPL AUTH SUBSCRIPTION               |
#      | RISKDEC2 ACCOUNTCHECK AUTH                          |
#      | THREEDQUERY AUTH FRAUDSCREENING                     |
#      | ORDERDETAILS AUTH                                   |
#      | JSINPL AUTH SUBSCRIPTION                            |
#      | AUTH SUBSCRIPTION                                   |
#      | RISKDEC ACCOUNTCHECK THREEDQUERY AUTH               |
#      | RISKDEC JSINPL AUTH                                 |
#      | RISKDEC2 ACCOUNTCHECK THREEDQUERY AUTH SUBSCRIPTION |
#      | RISKDEC JSINPL AUTH SUBSCRIPTION                    |
#      | RISKDEC2 ACCOUNTCHECK AUTH SUBSCRIPTION             |
#      | RISKDEC AUTH                                        |
#      | RISKDEC2 AUTH                                       |
#      | ACCOUNTCHECK AUTH                                   |
#      | AUTH FRAUDSCREENING                                 |
#      | ACCOUNTCHECK THREEDQUERY AUTH SUBSCRIPTION          |
#      | RISKDEC ACCOUNTCHECK THREEDQUERY AUTH SUBSCRIPTION  |
#      | RISKDEC2 THREEDQUERY AUTH                           |
#      | JSINPL AUTH RISKDEC                                 |
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
      | billingcountryiso2a     | CN                                                     |
      | currencyiso3a           | CNY                                                    |
      | orderreference          | 123456                                                 |
      | successredirecturl      | https://this_is_not_existing_page_success_redirect.com |
      | errorredirecturl        | https://this_is_not_existing_page_error_redirect.com   |
      | cancelredirecturl       | https://this_is_not_existing_page_cancel_redirect.com  |
    And User opens example page WITH_APM
    And User focuses on APM payment methods section
    And User chooses UNIONPAY from APM list
    And User will be sent to apm page - simulator
    When User will select Succeeded response and submit
    Then User will be sent to page with url "this_is_not_existing_page_success_redirect.com" having params
      | key                    | value    |
      | paymenttypedescription | UNIONPAY |
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
      | billingcountryiso2a     | CN                                                     |
      | currencyiso3a           | CNY                                                    |
      | orderreference          | 123456                                                 |
      | successredirecturl      | https://this_is_not_existing_page_success_redirect.com |
      | errorredirecturl        | https://this_is_not_existing_page_error_redirect.com   |
      | cancelredirecturl       | https://this_is_not_existing_page_cancel_redirect.com  |
    And User opens example page WITH_APM
    And User focuses on APM payment methods section
    And User chooses UNIONPAY from APM list
    And User will be sent to apm page - simulator
    When User will select Failed Unknown response and submit
    Then User will be sent to page with url "this_is_not_existing_page_error_redirect.com" having params
      | key                    | value    |
      | paymenttypedescription | UNIONPAY |
      | errorcode              | 70000    |
      | settlestatus           | 3        |
#      | orderreference         | 123456 |  commented on purpose


  Scenario: default configuration override
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs UNIONPAY_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                                                  |
      | requesttypedescriptions | AUTH                                                   |
      | baseamount              | 70                                                     |
      | billingfirstname        | FirstName                                              |
      | billingcountryiso2a     | CN                                                     |
      | currencyiso3a           | CNY                                                    |
      | orderreference          | 123456                                                 |
      | successredirecturl      | https://this_is_not_existing_page_success_redirect.com |
      | errorredirecturl        | https://this_is_not_existing_page_error_redirect.com   |
      | cancelredirecturl       | https://this_is_not_existing_page_cancel_redirect.com  |
    And User opens example page WITH_APM
    And User focuses on APM payment methods section
    And User chooses UNIONPAY from APM list - override placement
    And User will be sent to apm page - simulator
    When User will select Failed Unknown response and submit
    Then User will be sent to page with url "this_is_not_existing_page_return_redirect.com" having params
      | key                    | value    |
      | paymenttypedescription | UNIONPAY |
      | errorcode              | 70000    |
      | settlestatus           | 3        |
#      | orderreference         | 123456 | commented on purpose
