Feature: Visa Click To Pay for unregistered user
  As a new user
  I want to use Visa Click To Pay payment method
  In order to check full payment functionality


  Scenario: Successful payment - Unregistered VISA CTP user with registration
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_VISA_CTP
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | AUTH               |
      | orderreference          | order-01           |
      | baseamount              | 1000               |
      | billingfirstname        | FirstName          |
      | billingemail            | FirstName@email.pl |
      | billingcountryiso2a     | GB                 |
      | currencyiso3a           | GBP                |
    And User opens example page VISA_CTP
    When User fills VISA_CTP card details with defined card VISA_V21_FRICTIONLESS
    And User chooses to register his card on VISA_CTP popup
    And User fills VISA_CTP billing address
    And User reviews VISA_CTP checkout page and continues payment
    #to be explained
    Then User will see that VISA_CTP payment was successful

  Scenario Outline: Rejected payment - Unregistered VISA CTP user and new device
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_VISA_CTP
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | orderreference          | order-01           |
      | baseamount              | 1000               |
      | billingfirstname        | FirstName          |
      | billingemail            | FirstName@email.pl |
      | billingcountryiso2a     | GB                 |
      | currencyiso3a           | GBP                |
    And User opens example page VISA_CTP
    When User fills VISA_CTP card details with defined card VISA_V21_REJECTED_FRICTIONLESS_AUTH
    And User chooses to register his card on VISA_CTP popup
    And User fills VISA_CTP billing address
    And User reviews VISA_CTP checkout page with remembering my choice option
    #to be explained
    And User fills VISA_CTP one time password
    Then User will see that VISA_CTP payment was successful

    Examples:
      | request_types                         |
      | THREEDQUERY AUTH                      |
      | ACCOUNTCHECK THREEDQUERY              |
      | RISKDEC THREEDQUERY AUTH              |
      | RISKDEC ACCOUNTCHECK THREEDQUERY AUTH |

  Scenario: Successful payment - Unregistered VISA CTP user on new device and 3DS authentication
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_VISA_CTP
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | THREEDQUERY AUTH   |
      | orderreference          | order-01           |
      | baseamount              | 1000               |
      | billingfirstname        | FirstName          |
      | billingemail            | FirstName@email.pl |
      | billingcountryiso2a     | GB                 |
      | currencyiso3a           | GBP                |
    And User opens example page VISA_CTP
    When User fills VISA_CTP card details with defined card VISA_V21_NON_FRICTIONLESS
    And User chooses to register his card on VISA_CTP popup
    And User fills VISA_CTP billing address
    And User reviews VISA_CTP checkout page with remembering my choice option
    #to be explained
    And User fills VISA_CTP one time password
    And User fills 3ds SDK challenge with <string> and submit
    Then User will see that VISA_CTP payment was successful


  Scenario: Successful payment - Unregistered VISA CTP user without saving credit card details
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_VISA_CTP
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | AUTH               |
      | orderreference          | order-01           |
      | baseamount              | 1000               |
      | billingfirstname        | FirstName          |
      | billingemail            | FirstName@email.pl |
      | billingcountryiso2a     | GB                 |
      | currencyiso3a           | GBP                |
    And User opens example page VISA_CTP
    When User fills VISA_CTP card details with defined card VISA_V21_NON_FRICTIONLESS
    And User chooses to register his card on VISA_CTP popup
    And User fills VISA_CTP billing address
    And User reviews VISA_CTP checkout page and continues payment
    #to be explained
    And User fills VISA_CTP one time password
    Then User will see that VISA_CTP payment was successful


  Scenario: Re-enter card payment - Unregistered VISA CTP user edits card details
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_VISA_CTP
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | orderreference          | order-01           |
      | baseamount              | 70000              |
      | billingfirstname        | FirstName          |
      | billingemail            | FirstName@email.pl |
      | billingcountryiso2a     | GB                 |
      | currencyiso3a           | GBP                |
    And User opens example page VISA_CTP
    When User fills VISA_CTP card details with defined card VISA_V21_SUCCESSFUL_FRICTIONLESS_AUTH
    And User chooses to edit card details on VISA_CTP popup
    And User fills VISA_CTP card details with defined card VISA_V22_SUCCESSFUL_FRICTIONLESS_AUTH
    And User fills VISA_CTP billing address
    And User reviews VISA_CTP checkout page with remembering my choice option
    #to be explained
    And User fills VISA_CTP one time password
    Then User will see that VISA_CTP payment was successful




