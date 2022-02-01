@APM
@A2A
@STJS-2273
Feature: E2E A2A Payments
  As a user
  I want to use A2A payment
  If I use alternative payment method

#
#  Scenario Outline: Successful trigger of payment with accepted values for billingcountryiso2a and currencyiso3a
#    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs BASIC_CONFIG_APM
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value                 |
#      | requesttypedescriptions | AUTH                  |
#      | baseamount              | 70                    |
#      | billingfirstname        | FirstName             |
#      | billingcountryiso2a     | <billingcountryiso2a> |
#      | currencyiso3a           | GBP                   |
#    And User opens example page WITH_APM
#    And User focuses on APM payment methods section
#    When User chooses ATA from APM list
#    Then User will be sent to apm page - ATA
#
#    Examples:
#      | billingcountryiso2a |
#      | PL                  |
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
#      | currencyiso3a           | GBP                 |
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
##TODO Still waiting for list of supported countries and currencies for a2a
##    Then ATA is not available on APM list
#    When User chooses ATA from APM list
#    Then User will see notification frame text: "Invalid field"
#
#    Examples:
#      | billingcountryiso2a | currencyiso3a |
#      | PL                  | CHF           |
#      | GB                  | BYN           |
#      | DE                  | EUR           |
#
#
#  Scenario: Unsuccessful init - missing at least one of the billing name fields
#    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs BASIC_CONFIG_APM
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value |
#      | requesttypedescriptions | AUTH  |
#      | currencyiso3a           | GBP   |
#      | billingcountryiso2a     | GB    |
#      | baseamount              | 123   |
#    And User opens example page WITH_APM
#    And User waits for Pay button to be active
#    And User focuses on APM payment methods section
#    # to be used with STJS-2443 & STJS-2444
#    #    Then ATA is not available on APM list
#    When User chooses ATA from APM list
#    Then User will see notification frame text: "Invalid field"
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
#      | billingcountryiso2a     | GB              |
#      | currencyiso3a           | GBP             |
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
#    #this should work
#    When User chooses ATA from APM list
#    Then User will see notification frame text: "Invalid field"
#
#
#  Scenario: Unsuccessful init - update jwt with missing required fields
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
#      | key                     | value |
#      | requesttypedescriptions | AUTH  |
#      | baseamount              | 707   |
#      | currencyiso3a           | GBP   |
#    And User waits for Pay button to be active
#    When User calls updateJWT function by filling amount field
#    And User focuses on APM payment methods section
#    #TODO Still waiting for list of supported countries and currencies for a2a
##    Then ATA is not available on APM list
#    When User chooses ATA from APM list
#    Then User will see notification frame text: "Invalid field"
#
#
#  Scenario: Unsuccessful trigger of payment without AUTH in requesttypesdescriptions
#    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs BASIC_CONFIG_APM
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value               |
#      | requesttypedescriptions | THREEDQUERY RISKDEC |
#      | baseamount              | 70                  |
#      | billingfirstname        | FirstName           |
#      | billingcountryiso2a     | GB                  |
#      | currencyiso3a           | GBP                 |
#    And User opens example page WITH_APM
#    And User focuses on APM payment methods section
#    When User chooses ATA from APM list
#    Then User will see notification frame text: "Invalid field"
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
#    When User will select Succeeded response and submit
#    Then User will be sent to page with url "this_is_not_existing_page_success_redirect.com" having params
#      | key                    | value |
#      | paymenttypedescription | ATA   |
#      | errorcode              | 0     |
#      | settlestatus           | 100   |
##      | orderreference         | 123456 | commented on purpose
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
##TODO    When Add steps for a2a payment flow
#    Then User will be sent to page with url "this_is_not_existing_page_error_redirect.com" having params
#      | key                    | value |
#      | paymenttypedescription | ATA   |
#      | errorcode              | 70000 |
#      | settlestatus           | 3     |
##      | orderreference         | 123456 |  commented on purpose
#
#
#  Scenario: default configuration override
#    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs ATA_CONFIG_APM
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value     |
#      | requesttypedescriptions | AUTH      |
#      | baseamount              | 70000     |
#      | billingfirstname        | FirstName |
#      | billingcountryiso2a     | GB        |
#      | currencyiso3a           | GBP       |
#      | orderreference          | 123456    |
#    And User opens example page WITH_APM
#    And User focuses on APM payment methods section
#    And User chooses ATA from APM list - override placement
#    And User will be sent to apm page - ATA
##TODO    When Add steps for a2a payment flow
#    Then User will be sent to page with url "this_is_not_existing_page_error_redirect_override.com" having params
#      | key                    | value |
#      | paymenttypedescription | ATA   |
#      | errorcode              | 70000 |
#      | settlestatus           | 3     |
##      | orderreference         | 123456 | commented on purpose
