@APM
@A2A
@STJS-2273
Feature: E2E A2A Payments
  As a user
  I want to use A2A payment
  If I use alternative payment method

#TODO Currently A2A tests can run against BB6.
# Uncomment these tests when site ref dedicated for prod env will be prepared
  
#  Scenario Outline: Successful trigger of payment with accepted values for billingcountryiso2a and currencyiso3a
#    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs BASIC_CONFIG_APM
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value                 |
#      | requesttypedescriptions | AUTH                  |
#      | baseamount              | 70                    |
#      | billingcountryiso2a     | <billingcountryiso2a> |
#      | currencyiso3a           | GBP                   |
#    And User opens example page WITH_APM
#    And User focuses on APM payment methods section
#    When User chooses ATA from APM list
#    Then User will be sent to apm page - ATA
#
#    Examples:
#      | billingcountryiso2a |
#      | GB                  |
#      | DE                  |
#      | FR                  |
#
#
#  Scenario Outline: Successful trigger of payment with only one of billing name field
#    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs BASIC_CONFIG_APM
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value               |
#      | requesttypedescriptions | AUTH                |
#      | currencyiso3a           | EUR                 |
#      | billingcountryiso2a     | GB                  |
#      | baseamount              | 123                 |
#      | billingfirstname        | <billingfirstname>  |
#      | billinglastname         | <billinglastname>   |
#      | billingprefixname       | <billingprefixname> |
#      | billingmiddlename       | <billingmiddlename> |
#      | billingsuffixname       | <billingsuffixname> |
#    And User opens example page WITH_APM
#    And User focuses on APM payment methods section
#    When User chooses ATA from APM list
#    Then User will be sent to apm page - ATA
#
#    Examples:
#      | billingprefixname | billingfirstname | billingmiddlename | billinglastname | billingsuffixname |
#      | Miss              |                  |                   |                 |                   |
#      |                   | FirstName        |                   |                 |                   |
#      |                   |                  | MiddleName        |                 |                   |
#      |                   |                  |                   | LastName        |                   |
#      |                   |                  |                   |                 | Bsc               |
#
#
#  Scenario Outline: Unsuccessful init - not supported values for billingcountryiso2a and currencyiso3a
#    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs BASIC_CONFIG_APM
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value                 |
#      | requesttypedescriptions | AUTH                  |
#      | baseamount              | 70                    |
#      | billingfirstname        | FirstName             |
#      | billingemail            | FirstName@email.pl    |
#      | billingcountryiso2a     | <billingcountryiso2a> |
#      | currencyiso3a           | <currencyiso3a>       |
#    When User opens example page WITH_APM
#    And User waits for Pay button to be active
#    And User focuses on APM payment methods section
#    Then ATA is not available on APM list
#
#    Examples:
#      | billingcountryiso2a | currencyiso3a |
#      | PL                  | CHF           |
#      | GB                  | BYN           |
#      | DE                  | PLN           |
#
#
#  Scenario: Successful trigger of payment with updated jwt
#    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs BASIC_CONFIG_APM
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value     |
#      | requesttypedescriptions | AUTH      |
#      | baseamount              | 70        |
#      | billingfirstname        | FirstName |
#      | billingcountryiso2a     | GB        |
#      | currencyiso3a           | GBP       |
#    And User opens page WITH_APM and WITH_UPDATE_JWT - jwt BASE_JWT with additional attributes
#      | key                     | value           |
#      | requesttypedescriptions | AUTH            |
#      | baseamount              | 707             |
#      | billinglastname         | LastNameUpdated |
#      | billingcountryiso2a     | PL              |
#      | currencyiso3a           | EUR             |
#    And User waits for Pay button to be active
#    And User calls updateJWT function by filling amount field
#    When User chooses ATA from APM list
#    Then User will be sent to apm page - ATA
#
#
#  Scenario: Unsuccessful init - update jwt with not supported values for billingcountryiso2a and currencyiso3a
#    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs BASIC_CONFIG_APM
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value     |
#      | requesttypedescriptions | AUTH      |
#      | baseamount              | 70        |
#      | billingfirstname        | FirstName |
#      | billingcountryiso2a     | GB        |
#      | currencyiso3a           | GBP       |
#    And User opens page WITH_APM and WITH_UPDATE_JWT - jwt BASE_JWT with additional attributes
#      | key                     | value            |
#      | requesttypedescriptions | AUTH             |
#      | baseamount              | 707              |
#      | billingfirstname        | FirstNameUpdated |
#      | billingcountryiso2a     | DE               |
#      | currencyiso3a           | PLN              |
#    And User waits for Pay button to be active
#    When User calls updateJWT function by filling amount field
#    And User focuses on APM payment methods section
#    Then ATA is not available on APM list
#
#
#  Scenario: Unsuccessful init - update jwt with not supported requesttype
#    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs BASIC_CONFIG_APM
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value    |
#      | requesttypedescriptions | AUTH     |
#      | baseamount              | 70       |
#      | billinglastname         | LastName |
#      | billingcountryiso2a     | GB       |
#      | currencyiso3a           | GBP      |
#    And User opens page WITH_APM and WITH_UPDATE_JWT - jwt BASE_JWT with additional attributes
#      | key                     | value       |
#      | requesttypedescriptions | THREEDQUERY |
#      | baseamount              | 707         |
#      | billingcountryiso2a     | GB          |
#      | currencyiso3a           | GBP         |
#    And User waits for Pay button to be active
#    When User calls updateJWT function by filling amount field
#    And User focuses on APM payment methods section
#    When User chooses ATA from APM list
#    Then User will see notification frame text: "Invalid acquirer for 3-D Secure"
#
#
#  Scenario: Unsuccessful trigger of payment without AUTH in requesttypesdescriptions
#    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs BASIC_CONFIG_APM
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value        |
#      | requesttypedescriptions | ACCOUNTCHECK |
#      | baseamount              | 70           |
#      | billingfirstname        | FirstName    |
#      | billingcountryiso2a     | GB           |
#      | currencyiso3a           | GBP          |
#    And User opens example page WITH_APM
#    And User focuses on APM payment methods section
#    When User chooses ATA from APM list
#    Then User will see notification frame text: "Invalid requesttype"
#
#
#  Scenario: successRedirectUrl and parameters verification
#    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs BASIC_CONFIG_APM
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value     |
#      | requesttypedescriptions | AUTH      |
#      | baseamount              | 70        |
#      | billingfirstname        | FirstName |
#      | billingcountryiso2a     | GB        |
#      | currencyiso3a           | GBP       |
#      | orderreference          | 123456    |
#    And User opens example page WITH_APM
#    And User focuses on APM payment methods section
#    And User chooses ATA from APM list
#    And User will be sent to apm page - ATA
#    When User chooses country and bank on Token page
#    And User login to bank account with valid credentials
#    And User confirm payment
#    Then User will be sent to page with url "this_is_not_existing_page_return_redirect.com" having params
#      | key                  | value              |
#      | transactionreference | should not be none |
#      | settlestatus         | 100                |
#      | orderreference       | 123456             |
#
#
#  Scenario: errorRedirectUrl and parameters verification
#    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs BASIC_CONFIG_APM
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value     |
#      | requesttypedescriptions | AUTH      |
#      | baseamount              | 70        |
#      | billingfirstname        | FirstName |
#      | billingcountryiso2a     | GB        |
#      | currencyiso3a           | GBP       |
#      | orderreference          | 123456    |
#    And User opens example page WITH_APM
#    And User focuses on APM payment methods section
#    And User chooses ATA from APM list
#    And User will be sent to apm page - ATA
#    When User chooses country and bank on Token page
#    And User login to bank account with valid credentials
#    And User cancel payment
#    Then User will be sent to page with url "this_is_not_existing_page_return_redirect.com" having params
#      | key                  | value              |
#      | transactionreference | should not be none |
#      | settlestatus         | 10                 |
#      | orderreference       | 123456             |
#
#
#  Scenario: default configuration override
#    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs ATA_CONFIG_APM
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value     |
#      | requesttypedescriptions | AUTH      |
#      | baseamount              | 1000     |
#      | billingfirstname        | FirstName |
#      | billingcountryiso2a     | GB        |
#      | currencyiso3a           | GBP       |
#    And User opens example page WITH_APM
#    And User focuses on APM payment methods section
#    And User chooses ATA from APM list - override placement
#    And User will be sent to apm page - ATA
#    When User chooses country and bank on Token page
#    And User login to bank account with valid credentials
#    And User confirm payment
#    Then User will be sent to page with url "this_is_not_existing_page_return_redirect.com" having params
#      | key                  | value              |
#      | transactionreference | should not be none |
#      | settlestatus         | 100                |
