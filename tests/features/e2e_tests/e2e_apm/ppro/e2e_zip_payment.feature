Feature: E2E ZIP Payments
  As a user
  I want to use ZIP payment
  If I use alternative payment method


  Scenario: Successful trigger of payment with accepted values for billingcountryiso2a and currencyiso3a
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                                                 |
      | requesttypedescriptions | AUTH                                                  |
      | billingfirstname        | FirstName                                             |
      | billinglastname         | LastName                                              |
      | billingemail            | email@email.com                                       |
      | billingpremise          | Premise                                               |
      | billingtown             | test                                                  |
      | billingcounty           | test                                                  |
      | billingstreet           | test                                                  |
      | billingpostcode         | PO1 3AX                                               |
      | billingcountryiso2a     | GB                                                    |
      | orderreference          | 123445                                                |
      | currencyiso3a           | GBP                                                   |
      | baseamount              | 1000                                                  |
      | returnurl               | https://this_is_not_existing_page_return_redirect.com |
    And User opens example page WITH_APM
    And User focuses on APM payment methods section
    When User chooses ZIP from APM list
    And User will be sent to apm page - zip
# Steps moved to smoke_test scope
    And User fills ZIP phone number field
    And User fills ZIP one time password
    Then User will be sent to ZIP order summary page
    And User will be sent to page with url "this_is_not_existing_page_return_redirect.com" having params
      | key                  | value              |
      | orderreference       | 123445             |
      | transactionreference | should not be none |


  Scenario Outline: Unsuccessful init - not supported values for billingcountryiso2a and currencyiso3a
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                                                 |
      | requesttypedescriptions | AUTH                                                  |
      | billingfirstname        | FirstName                                             |
      | billinglastname         | LastName                                              |
      | billingemail            | email@email.com                                       |
      | billingpremise          | Premise                                               |
      | billingtown             | test                                                  |
      | billingcounty           | test                                                  |
      | billingstreet           | test                                                  |
      | billingpostcode         | PO1 3AX                                               |
      | billingcountryiso2a     | <billingcountryiso2a>                                 |
      | customerfirstname       | FirstName                                             |
      | customerlastname        | LastName                                              |
      | customeremail           | email@email.com                                       |
      | customerpremise         | Premise                                               |
      | customertown            | test                                                  |
      | customercounty          | test                                                  |
      | customerstreet          | test                                                  |
      | customerpostcode        | PO1 3AX                                               |
      | customercountryiso2a    | GB                                                    |
      | orderreference          | 123445                                                |
      | currencyiso3a           | <currencyiso3a>                                       |
      | baseamount              | 1000                                                  |
      | returnurl               | https://this_is_not_existing_page_return_redirect.com |
    And User opens example page WITH_APM
    And User waits for Pay button to be active
    And User focuses on APM payment methods section
    Then ZIP is not available on APM list

    Examples:
      | billingcountryiso2a | currencyiso3a |
      | UY                  | PLN           |
      | PL                  | USD           |
      |                     | USD           |


  Scenario: Unsuccessful init - missing at least one of the billing name
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                                                 |
      | requesttypedescriptions | AUTH                                                  |
      | billingfirstname        | FirstName                                             |
      | billinglastname         | LastName                                              |
      | billingtown             | test                                                  |
      | billingcounty           | test                                                  |
      | billingstreet           | test                                                  |
      | billingpostcode         | PO1 3AX                                               |
      | billingcountryiso2a     | GB                                                    |
      | customerfirstname       | FirstName                                             |
      | customerlastname        | LastName                                              |
      | customeremail           | email@email.com                                       |
      | customerpremise         | Premise                                               |
      | customertown            | test                                                  |
      | customercounty          | test                                                  |
      | customerstreet          | test                                                  |
      | customerpostcode        | PO1 3AX                                               |
      | customercountryiso2a    | GB                                                    |
      | orderreference          | 123445                                                |
      | currencyiso3a           | GBP                                                   |
      | baseamount              | 1000                                                  |
      | returnurl               | https://this_is_not_existing_page_return_redirect.com |
    When User opens example page WITH_APM
    And User waits for Pay button to be active
    And User focuses on APM payment methods section
    Then ZIP is not available on APM list


  Scenario Outline: Unsuccessful init - baseamount value from jwt payload exceeds min and max values from config
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs ZIP_MIN_MAX_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                                                 |
      | requesttypedescriptions | AUTH                                                  |
      | billingfirstname        | FirstName                                             |
      | billinglastname         | LastName                                              |
      | billingtown             | test                                                  |
      | billingcounty           | test                                                  |
      | billingstreet           | test                                                  |
      | billingpostcode         | PO1 3AX                                               |
      | billingcountryiso2a     | GB                                                    |
      | customerfirstname       | FirstName                                             |
      | customerlastname        | LastName                                              |
      | customeremail           | email@email.com                                       |
      | customerpremise         | Premise                                               |
      | customertown            | test                                                  |
      | customercounty          | test                                                  |
      | customerstreet          | test                                                  |
      | customerpostcode        | PO1 3AX                                               |
      | customercountryiso2a    | GB                                                    |
      | orderreference          | 123445                                                |
      | currencyiso3a           | GBP                                                   |
      | baseamount              | <baseamount>                                          |
      | returnurl               | https://this_is_not_existing_page_return_redirect.com |
    When User opens example page WITH_APM
    And User waits for Pay button to be active
    And User focuses on APM payment methods section
    Then ZIP is not available on APM list

    Examples:
      | baseamount |
      | 999        |
      | 3001       |


  Scenario: Successful trigger of payment with updated jwt
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                                                 |
      | requesttypedescriptions | AUTH                                                  |
      | billingfirstname        | FirstName                                             |
      | billinglastname         | LastName                                              |
      | billingemail            | email@email.com                                       |
      | billingpremise          | Premise                                               |
      | billingtown             | test                                                  |
      | billingcounty           | test                                                  |
      | billingstreet           | test                                                  |
      | billingpostcode         | PO1 3AX                                               |
      | billingcountryiso2a     | GB                                                    |
      | customerfirstname       | FirstName                                             |
      | customerlastname        | LastName                                              |
      | customeremail           | email@email.com                                       |
      | customerpremise         | Premise                                               |
      | customertown            | test                                                  |
      | customercounty          | test                                                  |
      | customerstreet          | test                                                  |
      | customerpostcode        | PO1 3AX                                               |
      | customercountryiso2a    | GB                                                    |
      | orderreference          | 123445                                                |
      | currencyiso3a           | GBP                                                   |
      | baseamount              | 1000                                                  |
      | returnurl               | https://this_is_not_existing_page_return_redirect.com |
    And User opens page WITH_APM and WITH_UPDATE_JWT - jwt BASE_JWT with additional attributes
      | key                     | value                                                 |
      | requesttypedescriptions | AUTH                                                  |
      | billingfirstname        | FirstNameUpdate                                       |
      | billinglastname         | LastName                                              |
      | billingemail            | email@email.com                                       |
      | billingpremise          | Premise                                               |
      | billingtown             | test                                                  |
      | billingcounty           | test                                                  |
      | billingstreet           | test                                                  |
      | billingpostcode         | PO1 3AX                                               |
      | billingcountryiso2a     | GB                                                    |
      | customerfirstname       | FirstName                                             |
      | customerlastname        | LastName                                              |
      | customeremail           | email@email.com                                       |
      | customerpremise         | Premise                                               |
      | customertown            | test                                                  |
      | customercounty          | test                                                  |
      | customerstreet          | test                                                  |
      | customerpostcode        | PO1 3AX                                               |
      | customercountryiso2a    | GB                                                    |
      | orderreference          | 123446                                                |
      | currencyiso3a           | GBP                                                   |
      | baseamount              | 1500                                                  |
      | returnurl               | https://this_is_not_existing_page_return_redirect.com |
    And User calls updateJWT function by filling amount field
    When User chooses ZIP from APM list
    Then User will be sent to apm page - zip


  Scenario: Unsuccessful init - update jwt with not supported values for billingcountryiso2a and currencyiso3a
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                                                 |
      | requesttypedescriptions | AUTH                                                  |
      | billingfirstname        | FirstName                                             |
      | billinglastname         | LastName                                              |
      | billingemail            | email@email.com                                       |
      | billingpremise          | Premise                                               |
      | billingtown             | test                                                  |
      | billingcounty           | test                                                  |
      | billingstreet           | test                                                  |
      | billingpostcode         | PO1 3AX                                               |
      | billingcountryiso2a     | GB                                                    |
      | customerfirstname       | FirstName                                             |
      | customerlastname        | LastName                                              |
      | customeremail           | email@email.com                                       |
      | customerpremise         | Premise                                               |
      | customertown            | test                                                  |
      | customercounty          | test                                                  |
      | customerstreet          | test                                                  |
      | customerpostcode        | PO1 3AX                                               |
      | customercountryiso2a    | GB                                                    |
      | orderreference          | 123445                                                |
      | currencyiso3a           | GBP                                                   |
      | baseamount              | 1000                                                  |
      | returnurl               | https://this_is_not_existing_page_return_redirect.com |
    And User opens page WITH_APM and WITH_UPDATE_JWT - jwt BASE_JWT with additional attributes
      | key                     | value                                                 |
      | requesttypedescriptions | AUTH                                                  |
      | billingfirstname        | FirstName                                             |
      | billinglastname         | LastName                                              |
      | billingemail            | email@email.com                                       |
      | billingpremise          | Premise                                               |
      | billingtown             | test                                                  |
      | billingcounty           | test                                                  |
      | billingstreet           | test                                                  |
      | billingpostcode         | PO1 3AX                                               |
      | billingcountryiso2a     | PL                                                    |
      | customerfirstname       | FirstName                                             |
      | customerlastname        | LastName                                              |
      | customeremail           | email@email.com                                       |
      | customerpremise         | Premise                                               |
      | customertown            | test                                                  |
      | customercounty          | test                                                  |
      | customerstreet          | test                                                  |
      | customerpostcode        | PO1 3AX                                               |
      | customercountryiso2a    | GB                                                    |
      | orderreference          | 123445                                                |
      | currencyiso3a           | PLN                                                   |
      | baseamount              | 1000                                                  |
      | returnurl               | https://this_is_not_existing_page_return_redirect.com |
    When User calls updateJWT function by filling amount field
    And User waits for Pay button to be active
    And User focuses on APM payment methods section
    Then ZIP is not available on APM list


  Scenario: Unsuccessful init - update jwt with missing required fields
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                                                  |
      | requesttypedescriptions | AUTH                                                   |
      | billingfirstname        | FirstName                                              |
      | billinglastname         | LastName                                               |
      | billingemail            | email@email.com                                        |
      | billingpremise          | Premise                                                |
      | billingtown             | test                                                   |
      | billingcounty           | test                                                   |
      | billingstreet           | test                                                   |
      | billingpostcode         | PO1 3AX                                                |
      | billingcountryiso2a     | GB                                                     |
      | customerfirstname       | FirstName                                              |
      | customerlastname        | LastName                                               |
      | customeremail           | email@email.com                                        |
      | customerpremise         | Premise                                                |
      | customertown            | test                                                   |
      | customercounty          | test                                                   |
      | customerstreet          | test                                                   |
      | customerpostcode        | PO1 3AX                                                |
      | customercountryiso2a    | GB                                                     |
      | orderreference          | 123445                                                 |
      | currencyiso3a           | GBP                                                    |
      | baseamount              | 1000                                                   |
      | successfulurlredirect   | https://this_is_not_existing_page_success_redirect.com |
      | errorurlredirect        | https://this_is_not_existing_page_error_redirect.com   |
      | cancelurlredirect       | https://this_is_not_existing_page_cancel_redirect.com  |
      | returnurl               | https://this_is_not_existing_page_return_redirect.com  |
    And User opens page WITH_APM and WITH_UPDATE_JWT - jwt BASE_JWT with additional attributes
      | key                     | value                                                  |
      | requesttypedescriptions | AUTH                                                   |
      | billingemail            | email@email.com                                        |
      | billingpremise          | Premise                                                |
      | billingtown             | test                                                   |
      | billingcounty           | test                                                   |
      | billingstreet           | test                                                   |
      | billingpostcode         | PO1 3AX                                                |
      | billingcountryiso2a     | GB                                                     |
      | customerfirstname       | FirstName                                              |
      | customerlastname        | LastName                                               |
      | customeremail           | email@email.com                                        |
      | customerpremise         | Premise                                                |
      | customertown            | test                                                   |
      | customercounty          | test                                                   |
      | customerstreet          | test                                                   |
      | customerpostcode        | PO1 3AX                                                |
      | customercountryiso2a    | GB                                                     |
      | orderreference          | 123445                                                 |
      | currencyiso3a           | GBP                                                    |
      | baseamount              | 1000                                                   |
      | successfulurlredirect   | https://this_is_not_existing_page_success_redirect.com |
      | errorurlredirect        | https://this_is_not_existing_page_error_redirect.com   |
      | cancelurlredirect       | https://this_is_not_existing_page_cancel_redirect.com  |
      | returnurl               | https://this_is_not_existing_page_return_redirect.com  |
    When User calls updateJWT function by filling amount field
    And User waits for Pay button to be active
    And User focuses on APM payment methods section
    Then ZIP is not available on APM list


  Scenario: Unsuccessful trigger of payment without AUTH in requesttypesdescriptions
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                                                 |
      | requesttypedescriptions | THREEDQUERY RISKDEC                                   |
      | billingfirstname        | FirstName                                             |
      | billinglastname         | LastName                                              |
      | billingemail            | email@email.com                                       |
      | billingpremise          | Premise                                               |
      | billingtown             | test                                                  |
      | billingcounty           | test                                                  |
      | billingstreet           | test                                                  |
      | billingpostcode         | PO1 3AX                                               |
      | billingcountryiso2a     | GB                                                    |
      | customerfirstname       | FirstName                                             |
      | customerlastname        | LastName                                              |
      | customeremail           | email@email.com                                       |
      | customerpremise         | Premise                                               |
      | customertown            | test                                                  |
      | customercounty          | test                                                  |
      | customerstreet          | test                                                  |
      | customerpostcode        | PO1 3AX                                               |
      | customercountryiso2a    | GB                                                    |
      | orderreference          | 123445                                                |
      | currencyiso3a           | GBP                                                   |
      | baseamount              | 1000                                                  |
      | returnurl               | https://this_is_not_existing_page_return_redirect.com |
    And User opens example page WITH_APM
    And User focuses on APM payment methods section
    When User chooses ZIP from APM list
    Then User will see notification frame text: "Invalid field"


#  Functionality not available on gateway yet
  Scenario Outline: Bypass requesttypesdescriptions other than AUTH
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                                                 |
      | requesttypedescriptions | <requesttypedescriptions>                             |
      | billingfirstname        | FirstName                                             |
      | billinglastname         | LastName                                              |
      | billingemail            | email@email.com                                       |
      | billingpremise          | Premise                                               |
      | billingtown             | test                                                  |
      | billingcounty           | test                                                  |
      | billingstreet           | test                                                  |
      | billingpostcode         | PO1 3AX                                               |
      | billingcountryiso2a     | GB                                                    |
      | customerfirstname       | FirstName                                             |
      | customerlastname        | LastName                                              |
      | customeremail           | email@email.com                                       |
      | customerpremise         | Premise                                               |
      | customertown            | test                                                  |
      | customercounty          | test                                                  |
      | customerstreet          | test                                                  |
      | customerpostcode        | PO1 3AX                                               |
      | customercountryiso2a    | GB                                                    |
      | orderreference          | 123445                                                |
      | currencyiso3a           | GBP                                                   |
      | baseamount              | 1000                                                  |
      | returnurl               | https://this_is_not_existing_page_return_redirect.com |
    And User opens example page WITH_APM
    And User waits for whole form to be displayed
    And User waits for Pay button to be active
    When User chooses ZIP from APM list
    Then User will be sent to apm page - zip

    Examples:
      | requesttypedescriptions |
      | THREEDQUERY AUTH        |
#  Functionality not available on gateway yet
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

  Scenario: RedirectUrl for cancel and parameters verification
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                                                 |
      | requesttypedescriptions | AUTH                                                  |
      | billingfirstname        | FirstName                                             |
      | billinglastname         | LastName                                              |
      | billingemail            | email@email.com                                       |
      | billingpremise          | Premise                                               |
      | billingtown             | test                                                  |
      | billingcounty           | test                                                  |
      | billingstreet           | test                                                  |
      | billingpostcode         | PO1 3AX                                               |
      | billingcountryiso2a     | GB                                                    |
      | customerfirstname       | FirstName                                             |
      | customerlastname        | LastName                                              |
      | customeremail           | email@email.com                                       |
      | customerpremise         | Premise                                               |
      | customertown            | test                                                  |
      | customercounty          | test                                                  |
      | customerstreet          | test                                                  |
      | customerpostcode        | PO1 3AX                                               |
      | customercountryiso2a    | GB                                                    |
      | orderreference          | 123445                                                |
      | currencyiso3a           | GBP                                                   |
      | baseamount              | 1000                                                  |
      | returnurl               | https://this_is_not_existing_page_return_redirect.com |
    And User opens example page WITH_APM
    And User focuses on APM payment methods section
    And User chooses ZIP from APM list
    And User will be sent to apm page - zip
    When User will click on cancel button on ZIP example page
    Then User will be sent to page with url "this_is_not_existing_page_return_redirect.com" having params
      | key                  | value              |
      | transactionreference | should not be none |
      | settle_status        | 3                  |

# Test moved to smoke_test scope
#  Scenario: RedirectUrl for success and parameters verification
#    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs BASIC_CONFIG_APM
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value           |
#      | requesttypedescriptions | AUTH            |
#      | billingfirstname        | FirstName       |
#      | billinglastname         | LastName        |
#      | billingemail            | email@email.com |
#      | billingpremise          | Premise         |
#      | billingtown             | test            |
#      | billingcounty           | test            |
#      | billingstreet           | test            |
#      | billingpostcode         | PO1 3AX         |
#      | billingcountryiso2a     | GB              |
#      | orderreference          | 123445          |
#      | currencyiso3a           | GBP             |
#      | baseamount              | 1000            |
#    And User opens example page WITH_APM
#    And User focuses on APM payment methods section
#    And User chooses ZIP from APM list
#    And User will be sent to apm page - zip
#    When User will click on allow button on ZIP example page
#    Then User will be sent to page with url "this_is_not_existing_page_return_redirect.com" having params
#      | key                  | value              |
#      | transactionreference | should not be none |
#      | settle_status        | 0                  |
#
#
#  Scenario: RedirectUrl for error and parameters verification
#    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs BASIC_CONFIG_APM
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value           |
#      | requesttypedescriptions | AUTH            |
#      | billingfirstname        | FirstName       |
#      | billinglastname         | LastName        |
#      | billingemail            | email@email.com |
#      | billingpremise          | Premise         |
#      | billingtown             | test            |
#      | billingcounty           | test            |
#      | billingstreet           | test            |
#      | billingpostcode         | PO1 3AX         |
#      | billingcountryiso2a     | GB              |
#      | orderreference          | 123445          |
#      | currencyiso3a           | GBP             |
#      | baseamount              | 1000            |
#    And User opens example page WITH_APM
#    And User focuses on APM payment methods section
#    And User chooses ZIP from APM list
#    And User will be sent to apm page - zip
#    When User will click on Decline button on ZIP example page
#    Then User will be sent to page with url "this_is_not_existing_page_return_redirect.com" having params
#      | key                  | value              |
#      | transactionreference | should not be none |
#      | settle_status        | 3                  |


  Scenario: default configuration override
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs ZIP_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                                                 |
      | requesttypedescriptions | AUTH                                                  |
      | billingfirstname        | FirstName                                             |
      | billinglastname         | LastName                                              |
      | billingemail            | email@email.com                                       |
      | billingpremise          | Premise                                               |
      | billingtown             | test                                                  |
      | billingcounty           | test                                                  |
      | billingstreet           | test                                                  |
      | billingpostcode         | PO1 3AX                                               |
      | billingcountryiso2a     | GB                                                    |
      | customerfirstname       | FirstName                                             |
      | customerlastname        | LastName                                              |
      | customeremail           | email@email.com                                       |
      | customerpremise         | Premise                                               |
      | customertown            | test                                                  |
      | customercounty          | test                                                  |
      | customerstreet          | test                                                  |
      | customerpostcode        | PO1 3AX                                               |
      | customercountryiso2a    | GB                                                    |
      | orderreference          | 123445                                                |
      | currencyiso3a           | GBP                                                   |
      | baseamount              | 1000                                                  |
      | returnurl               | https://this_is_not_existing_page_return_redirect.com |
    And User opens example page WITH_APM
    And User focuses on APM payment methods section
    And User chooses ZIP from APM list - override placement
    And User will be sent to apm page - zip
