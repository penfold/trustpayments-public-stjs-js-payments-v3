@APM
@SAFETYPAY
@STJS-2659
Feature: E2E SAFETYPAY Payments
  As a user
  I want to use SAFETYPAY payment
  If I use alternative payment method


  Scenario Outline: Successful trigger of payment with accepted values for billingcountryiso2a and currencyiso3a
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                 |
      | requesttypedescriptions | AUTH                  |
      | baseamount              | 706                   |
      | billingfirstname        | FirstName             |
      | billingcountryiso2a     | <billingcountryiso2a> |
      | currencyiso3a           | <currencyiso3a>       |
    And User opens example page WITH_APM
    And User focuses on APM payment methods section
    When User chooses SAFETYPAY from APM list
    Then User will be sent to apm page - simulator

    Examples:
      | billingcountryiso2a | currencyiso3a |
      | AT                  | USD           |
      | AT                  | EUR           |
      | BE                  | USD           |
      | BE                  | EUR           |
      | CL                  | USD           |
      | CL                  | EUR           |
#      | CO                  | USD           |
#      | CO                  | EUR           |
      | CR                  | USD           |
      | CR                  | EUR           |
      | DE                  | USD           |
      | DE                  | EUR           |
      | EC                  | USD           |
      | EC                  | EUR           |
      | ES                  | USD           |
      | ES                  | EUR           |
      | MX                  | USD           |
      | MX                  | EUR           |
      | NL                  | USD           |
      | NL                  | EUR           |
      | PE                  | USD           |
      | PE                  | EUR           |
#      | PR                  | USD           |
#      | PR                  | EUR           |


  Scenario Outline: Successful trigger of payment with only one of billing name field
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value               |
      | requesttypedescriptions | AUTH                |
      | currencyiso3a           | EUR                 |
      | billingcountryiso2a     | AT                  |
      | baseamount              | 123                 |
      | billingfirstname        | <billingfirstname>  |
      | billinglastname         | <billinglastname>   |
      | billingprefixname       | <billingprefixname> |
      | billingmiddlename       | <billingmiddlename> |
      | billingsuffixname       | <billingsuffixname> |
    And User opens example page WITH_APM
    And User focuses on APM payment methods section
    When User chooses SAFETYPAY from APM list
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
      | key                     | value                 |
      | requesttypedescriptions | AUTH                  |
      | baseamount              | 706                   |
      | billingfirstname        | FirstName             |
      | billinglastname         | LastName              |
      | billingcountryiso2a     | <billingcountryiso2a> |
      | currencyiso3a           | <currencyiso3a>       |
    And User opens example page WITH_APM
    And User waits for Pay button to be active
    And User focuses on APM payment methods section
    Then SAFETYPAY is not available on APM list

    Examples:
      | billingcountryiso2a | currencyiso3a |
      | AT                  | PLN           |
      |                     | PLN           |
      | PL                  | EUR           |
      |                     | USD           |
      |                     | EUR           |


  Scenario: Unsuccessful init - missing at least one of the billing name fields
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
      | currencyiso3a           | EUR   |
      | billingcountryiso2a     | AT    |
      | baseamount              | 123   |
    When User opens example page WITH_APM
    And User waits for Pay button to be active
    And User focuses on APM payment methods section
    Then SAFETYPAY is not available on APM list


  Scenario: Successful trigger of payment with updated jwt
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value     |
      | requesttypedescriptions | AUTH      |
      | baseamount              | 706       |
      | billingfirstname        | FirstName |
      | billingcountryiso2a     | AT        |
      | currencyiso3a           | EUR       |
    And User opens page WITH_APM and WITH_UPDATE_JWT - jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | AUTH            |
      | baseamount              | 707             |
      | billinglastname         | LastNameUpdated |
      | billingcountryiso2a     | AT              |
      | currencyiso3a           | USD             |
    And User calls updateJWT function by filling amount field
    When User chooses SAFETYPAY from APM list
    Then User will be sent to apm page - simulator


  Scenario: Unsuccessful init - update jwt with not supported values for billingcountryiso2a and currencyiso3a
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value     |
      | requesttypedescriptions | AUTH      |
      | baseamount              | 706       |
      | billingfirstname        | FirstName |
      | billinglastname         | LastName  |
      | billingcountryiso2a     | AT        |
      | currencyiso3a           | EUR       |
    And User opens page WITH_APM and WITH_UPDATE_JWT - jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | AUTH             |
      | baseamount              | 707              |
      | billingfirstname        | FirstNameUpdated |
      | billinglastname         | LastNameUpdated  |
      | billingcountryiso2a     | PL               |
      | currencyiso3a           | EUR              |
    When User calls updateJWT function by filling amount field
    And User waits for Pay button to be active
    And User focuses on APM payment methods section
    Then SAFETYPAY is not available on APM list


  Scenario: Unsuccessful init - update jwt with missing required fields
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value    |
      | requesttypedescriptions | AUTH     |
      | baseamount              | 706      |
      | billinglastname         | LastName |
      | billingcountryiso2a     | AT       |
      | currencyiso3a           | EUR      |
    And User opens page WITH_APM and WITH_UPDATE_JWT - jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
      | baseamount              | 707   |
      | billingcountryiso2a     | AT    |
      | currencyiso3a           | EUR   |
    When User calls updateJWT function by filling amount field
    And User waits for Pay button to be active
    And User focuses on APM payment methods section
    Then SAFETYPAY is not available on APM list


  Scenario: Unsuccessful trigger of payment without AUTH in requesttypesdescriptions
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                    |
      | requesttypedescriptions | ACCOUNTCHECK THREEDQUERY |
      | baseamount              | 704                      |
      | billingfirstname        | FirstName                |
      | billinglastname         | LastName                 |
      | billingcountryiso2a     | AT                       |
      | currencyiso3a           | EUR                      |
    And User opens example page WITH_APM
    And User focuses on APM payment methods section
    When User chooses SAFETYPAY from APM list
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
#      | billingfirstname        | FirstName                 |
#      | billinglastname         | LastName                  |
#    And User opens example page WITH_APM
#    And User waits for whole form to be displayed
#    And User waits for Pay button to be active
#    When User chooses SAFETYPAY from APM list
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


  Scenario: successRedirectUrl and parameters verification
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value     |
      | requesttypedescriptions | AUTH      |
      | baseamount              | 704       |
      | billingfirstname        | FirstName |
      | billinglastname         | LastName  |
      | billingcountryiso2a     | AT        |
      | currencyiso3a           | EUR       |
      | orderreference          | 123456    |
    And User opens example page WITH_APM
    And User focuses on APM payment methods section
    And User chooses SAFETYPAY from APM list
    And User will be sent to apm page - simulator
    # different simulator page than in case of other apms
#    When User will select Succeeded response and submit
#    Then User will be sent to page with url "this_is_not_existing_page_success_redirect.com" having params
#      | key                    | value     |
#      | paymenttypedescription | SAFETYPAY |
#      | errorcode              | 0         |
#      | settlestatus           | 100       |
#      | orderreference         | 123456 | commented on purpose


  Scenario: errorRedirectUrl and parameters verification
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value     |
      | requesttypedescriptions | AUTH      |
      | baseamount              | 704       |
      | billingfirstname        | FirstName |
      | billinglastname         | LastName  |
      | billingcountryiso2a     | AT        |
      | currencyiso3a           | EUR       |
      | orderreference          | 123456    |
    And User opens example page WITH_APM
    And User focuses on APM payment methods section
    And User chooses SAFETYPAY from APM list
    And User will be sent to apm page - simulator
    # different simulator page than in case of other apms
#    When User will select Failed Unknown response and submit
#    Then User will be sent to page with url "this_is_not_existing_page_error_redirect.com" having params
#      | key                    | value     |
#      | paymenttypedescription | SAFETYPAY |
#      | errorcode              | 70000     |
#      | settlestatus           | 3         |
#      | orderreference         | 123456 |  commented on purpose


  Scenario: default configuration override
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs SAFETYPAY_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value     |
      | requesttypedescriptions | AUTH      |
      | baseamount              | 704       |
      | billingfirstname        | FirstName |
      | billinglastname         | LastName  |
      | billingcountryiso2a     | AT        |
      | currencyiso3a           | EUR       |
      | orderreference          | 123456    |
    And User opens example page WITH_APM
    And User focuses on APM payment methods section
    And User chooses SAFETYPAY from APM list - override placement
    And User will be sent to apm page - simulator
  # different simulator page than in case of other apms
#    When User will select Failed Unknown response and submit
#    Then User will be sent to page with url "this_is_not_existing_page_error_redirect_override.com" having params
#      | key                    | value     |
#      | paymenttypedescription | SAFETYPAY |
#      | errorcode              | 70000     |
#      | settlestatus           | 3         |
#      | orderreference         | 123456 | commented on purpose
