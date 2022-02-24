Feature: Visa Click To Pay
  As a user
  I want to use Visa Click To Pay payment method
  In order to check full payment functionality


  Scenario Outline: Successful payment - Registered VISA CTP user on recognized device with saved credit cards
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
    When User selects Look up my cards
    And User selects string card on VISA_CTP popup
    And User reviews VISA_CTP checkout page and continues payment
    Then User will see that VISA_CTP payment was successful

    Examples:
      | request_types                         |
      | THREEDQUERY AUTH                      |
      | ACCOUNTCHECK THREEDQUERY              |
      | RISKDEC THREEDQUERY AUTH              |
      | RISKDEC ACCOUNTCHECK THREEDQUERY AUTH |

  Scenario Outline: Successful payment - Registered VISA CTP user on recognized device with saved credit cards and 3DS authentication
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
    When User selects Look up my cards
    And User selects <string> card on VISA_CTP popup
    And User reviews VISA_CTP checkout page and continues payment
    And User fills 3ds SDK challenge with <string> and submit
    Then User will see that VISA_CTP payment was successful

    Examples:
      | request_types    |
      | THREEDQUERY AUTH |

  Scenario Outline: Unsuccessful payment - Registered VISA CTP user on recognized device with saved credit cards and 3DS authentication
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
    When User selects Look up my cards
    And User selects <string> card on VISA_CTP popup
    And User reviews VISA_CTP checkout page and continues payment
    And User fills 3ds SDK challenge with <string> and submit
    Then User will see that VISA_CTP payment was unsuccessfull

    Examples:
      | request_types    |
      | THREEDQUERY AUTH |


  Scenario: Decline payment - Registered VISA CTP user on recognized device with saved credit cards
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_VISA_CTP
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | AUTH               |
      | orderreference          | order-01           |
      | baseamount              | 70000              |
      | billingfirstname        | FirstName          |
      | billingemail            | FirstName@email.pl |
      | billingcountryiso2a     | GB                 |
      | currencyiso3a           | GBP                |
    And User opens example page VISA_CTP
    When User selects Look up my cards
    And User selects string card on VISA_CTP popup
    And User reviews VISA_CTP checkout page and continues payment
    Then User will see that VISA_CTP payment was declined


  Scenario: Successful payment - Registered VISA_CTP user on unrecognized device with saved credit cards
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
    When User selects Look up my cards
    And User login to VISA_CTP account with valid e-mail address
    And User fills VISA_CTP one time password
    And User selects string card on VISA_CTP popup
    And User reviews VISA_CTP checkout page and continues payment
    Then User will see that VISA_CTP payment was successfull

  Scenario: Repeat payment - Registered VISA_CTP user on unrecognized device saves his credit card
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
    When User selects Look up my cards
    And User login to VISA_CTP account with valid e-mail address
    And User fills VISA_CTP one time password
    And User selects string card on VISA_CTP popup
    And User chooses to register his card on VISA_CTP popup
    And User reviews VISA_CTP checkout page with remembering my choice option
    Then User will see that VISA_CTP payment was successfull
    When User selects Look up my cards
    And User selects string card on VISA_CTP popup
    And User reviews VISA_CTP checkout page and continues payment
    Then User will see that VISA_CTP payment was successful


  Scenario: Successful payment - Registered VISA_CTP user on unrecognized device with saved credit cards and 3DS authentication
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
    When User selects Look up my cards
    And User login to VISA_CTP account with valid e-mail address
    And User fills VISA_CTP one time password
    And User selects string card on VISA_CTP popup
    And User reviews VISA_CTP checkout page and continues payment
    And User fills 3ds SDK challenge with <string> and submit
    Then User will see that VISA_CTP payment was successfull

  Scenario: Cancel payment - Registered VISA CTP user on recognized device with saved credit cards
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_VISA_CTP
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | ACCOUNTCHECK AUTH  |
      | orderreference          | order-01           |
      | baseamount              | 1000               |
      | billingfirstname        | FirstName          |
      | billingemail            | FirstName@email.pl |
      | billingcountryiso2a     | GB                 |
      | currencyiso3a           | GBP                |
    And User opens example page VISA_CTP
    When User selects Look up my cards
    And User selects <string> card on VISA_CTP popup
    And  User reviews VISA_CTP checkout page and cancels payment
    Then User will see that VISA_CTP payment was cancelled

  Scenario: Successful payment - Registered VISA CTP user adds new card details
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_VISA_CTP
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | ACCOUNTCHECK AUTH  |
      | orderreference          | order-01           |
      | baseamount              | 1000               |
      | billingfirstname        | FirstName          |
      | billingemail            | FirstName@email.pl |
      | billingcountryiso2a     | GB                 |
      | currencyiso3a           | GBP                |
    And User opens example page VISA_CTP
    When User selects Look up my cards
    And User chooses to add new card on VISA_CTP popup
    And User fills VISA_CTP card details with defined card MASTERCARD_FRICTIONLESS
    And User reviews VISA_CTP checkout page and continues payment
    Then User will see that VISA_CTP payment was successful

  Scenario: Unsuccessful card adding - invalid card details
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_VISA_CTP
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | ACCOUNTCHECK AUTH  |
      | orderreference          | order-01           |
      | baseamount              | 1000               |
      | billingfirstname        | FirstName          |
      | billingemail            | FirstName@email.pl |
      | billingcountryiso2a     | GB                 |
      | currencyiso3a           | GBP                |
    And User opens example page VISA_CTP
    When User selects Look up my cards
    And User chooses to add new card on VISA_CTP popup
    And User fills VISA_CTP card details with defined card MASTERCARD_INVALID_EXP_DATE_CARD
    And User reviews VISA_CTP checkout page and continues payment
    Then User will see that VISA_CTP payment was successful

