@APM
@ALIPAY
@STJS-2694
Feature: E2E Alipay Payments
  As a user
  I want to use Alipay payment
  If I use alternative payment method


  Scenario: Successful trigger of payment with accepted values for billingcountryiso2a and currencyiso3a
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | AUTH               |
      | orderreference          | order-01           |
      | baseamount              | 70                 |
      | billingfirstname        | FirstName          |
      | billingemail            | FirstName@email.pl |
      | billingcountryiso2a     | GB                 |
      | currencyiso3a           | GBP                |
    And User opens example page WITH_APM
    And User focuses on APM payment methods section
    When User chooses ALIPAY from APM list
    Then User will be sent to page with url "excashier.alipaydev.com" having params
      | key           | value              |
      | auth_order_id | should not be none |


  Scenario Outline: Successful trigger of payment with only one of billing name field
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value               |
      | requesttypedescriptions | AUTH                |
      | currencyiso3a           | USD                 |
      | orderreference          | order-01            |
      | billingcountryiso2a     | UY                  |
      | baseamount              | 123                 |
      | billingemail            | FirstName@email.pl  |
      | billingdob              | 1980-02-01          |
      | billingfirstname        | <billingfirstname>  |
      | billinglastname         | <billinglastname>   |
      | billingprefixname       | <billingprefixname> |
      | billingmiddlename       | <billingmiddlename> |
      | billingsuffixname       | <billingsuffixname> |
    And User opens example page WITH_APM
    And User focuses on APM payment methods section
    When User chooses ALIPAY from APM list
    Then User will be sent to page with url "excashier.alipaydev.com" having params
      | key           | value              |
      | auth_order_id | should not be none |

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
      | baseamount              | 70                    |
      | orderreference          | order-01              |
      | billingfirstname        | FirstName             |
      | billingemail            | FirstName@email.pl    |
      | billingdob              | 1980-02-01            |
      | billingcountryiso2a     | <billingcountryiso2a> |
      | currencyiso3a           | <currencyiso3a>       |
    When User opens example page WITH_APM
    And User waits for Pay button to be active
    And User focuses on APM payment methods section
    Then ALIPAY is not available on APM list

    Examples:
      | billingcountryiso2a | currencyiso3a |
      | UY                  | PLN           |
      | PL                  | CZK           |
      | GB                  |               |


  Scenario: Unsuccessful init - missing orderreference field in jwt
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
      | currencyiso3a           | USD   |
      | billingcountryiso2a     | UY    |
      | baseamount              | 123   |
    When User opens example page WITH_APM
    And User waits for Pay button to be active
    And User focuses on APM payment methods section
    Then ALIPAY is not available on APM list


  Scenario: Successful trigger of payment with updated jwt
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | AUTH               |
      | orderreference          | order-01           |
      | baseamount              | 70                 |
      | billingfirstname        | FirstName          |
      | billingemail            | FirstName@email.pl |
      | billingdob              | 1980-02-01         |
      | billingcountryiso2a     | UY                 |
      | currencyiso3a           | USD                |
    And User opens page WITH_APM and WITH_UPDATE_JWT - jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | AUTH               |
      | orderreference          | order-02           |
      | baseamount              | 707                |
      | billinglastname         | LastNameUpdated    |
      | billingemail            | FirstName@email.pl |
      | billingdob              | 1980-02-01         |
      | billingcountryiso2a     | UY                 |
      | currencyiso3a           | USD                |
    And User calls updateJWT function by filling amount field
    When User chooses ALIPAY from APM list
    Then User will be sent to page with url "excashier.alipaydev.com" having params
      | key           | value              |
      | auth_order_id | should not be none |


  Scenario: Unsuccessful init - update jwt with not supported values for billingcountryiso2a and currencyiso3a
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | AUTH               |
      | baseamount              | 70                 |
      | billingfirstname        | FirstName          |
      | billingemail            | FirstName@email.pl |
      | billingdob              | 1980-02-01         |
      | billingcountryiso2a     | UY                 |
      | currencyiso3a           | USD                |
    And User opens page WITH_APM and WITH_UPDATE_JWT - jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | AUTH               |
      | baseamount              | 707                |
      | billingfirstname        | FirstNameUpdated   |
      | billingemail            | FirstName@email.pl |
      | billingdob              | 1980-02-01         |
      | billingcountryiso2a     | CZ                 |
      | currencyiso3a           | USD                |
    And User calls updateJWT function by filling amount field
    And User waits for Pay button to be active
    And User focuses on APM payment methods section
    Then ALIPAY is not available on APM list


  Scenario: Unsuccessful init - update jwt with missing required fields
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | AUTH               |
      | orderreference          | order-01           |
      | baseamount              | 70                 |
      | billinglastname         | LastName           |
      | billingemail            | FirstName@email.pl |
      | billingdob              | 1980-02-01         |
      | billingcountryiso2a     | UY                 |
      | currencyiso3a           | USD                |
    And User opens page WITH_APM and WITH_UPDATE_JWT - jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
      | baseamount              | 707   |
      | billingcountryiso2a     | UY    |
      | currencyiso3a           | USD   |
    And User calls updateJWT function by filling amount field
    And User waits for Pay button to be active
    And User focuses on APM payment methods section
    Then ALIPAY is not available on APM list


  Scenario: Unsuccessful trigger of payment without AUTH in requesttypesdescriptions
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value               |
      | requesttypedescriptions | THREEDQUERY RISKDEC |
      | orderreference          | order-01            |
      | baseamount              | 70                  |
      | billingfirstname        | FirstName           |
      | billingemail            | FirstName@email.pl  |
      | billingdob              | 1980-02-01          |
      | billingcountryiso2a     | UY                  |
      | currencyiso3a           | USD                 |
    And User opens example page WITH_APM
    And User focuses on APM payment methods section
    When User chooses ALIPAY from APM list
    Then User will see notification frame text: "Invalid field"
