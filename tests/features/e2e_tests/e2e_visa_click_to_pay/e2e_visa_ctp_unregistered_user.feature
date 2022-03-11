Feature: Visa Click To Pay for unregistered user
  As unregistered user
  I want to use Visa Click To Pay payment method
  In order to check full payment functionality


  Scenario: Successful payment - Unregistered VISA CTP user on new device
    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs BASIC_CONFIG_VISA_CTP
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    When User fills VISA_CTP card details with defined card VISA_V21_FRICTIONLESS
    And User chooses to register his card with Visa
    And User clicks Pay Securely button
    And User fills billing address form on Visa checkout popup
    And User reviews VISA_CTP checkout page confirm payment
    Then User will see that VISA_CTP payment was successful
    And TODO

  Scenario: Successful payment - Unregistered VISA CTP user with filled billing details fields
    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs BASIC_CONFIG_VISA_CTP
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    When User fills billing details fields
    And User fills VISA_CTP card details with defined card VISA_V21_FRICTIONLESS
    And User chooses to register his card with Visa
    And User clicks Pay Securely button
    And User reviews VISA_CTP checkout page confirm payment
    Then User will see that VISA_CTP payment was successful

  Scenario: Successful payment - Unregistered VISA CTP user with remember me option
    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs BASIC_CONFIG_VISA_CTP
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    When User fills VISA_CTP card details with defined card VISA_V21_FRICTIONLESS
    And User chooses to register his card with Visa
    And User clicks Pay Securely button
    And User fills billing address form on Visa checkout popup
    And User reviews VISA_CTP checkout page and confirm payment
    Then User will see that VISA_CTP payment was successful
    When User opens example page VISA_CTP
    And User is recognized by VISA_CTP

  Scenario: Rejected payment - Unregistered VISA CTP user with remember me option
    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs BASIC_CONFIG_VISA_CTP
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    When User fills VISA_CTP card details with defined card VISA_V21_FRICTIONLESS
    And User chooses to register his card with Visa
    And User clicks Pay Securely button
    And User fills billing address form on Visa checkout popup
    And User reviews VISA_CTP checkout page and confirm with remember me
    Then User will see that VISA_CTP payment was rejected
    When User opens example page VISA_CTP
    And User is recognized by visa

  Scenario: Successful payment - Unregistered VISA CTP user with remember me option and 3DS authentication
    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs BASIC_CONFIG_VISA_CTP
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    When User fills VISA_CTP card details with defined card VISA_V21_FRICTIONLESS
    And User chooses to register his card with Visa
    And User clicks Pay Securely button
    And User fills billing address form on Visa checkout popup
    And User reviews VISA_CTP checkout page and confirm with remember me
    And User is recognized by visa

  Scenario: Successful payment - Unregistered VISA CTP user and don't remember me
    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs BASIC_CONFIG_VISA_CTP
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    When User fills VISA_CTP card details with defined card VISA_V21_FRICTIONLESS
    And User chooses to register his card with Visa
    And User clicks Pay Securely button
    And User fills billing address form on Visa checkout popup
    And User reviews VISA_CTP checkout page and confirm payment
    Then User will see that VISA_CTP payment was successful
    And User opens example page VISA_CTP

  Scenario: Re-enter card payment - Unregistered VISA CTP user edits card details
    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs BASIC_CONFIG_VISA_CTP
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    When User fills VISA_CTP card details with defined card VISA_V21_FRICTIONLESS
    And User chooses to register his card with Visa
    And User clicks Pay Securely button
    And User fills billing address form on Visa checkout popup
    #TODO
    And User clicks edit card details
    And User reviews VISA_CTP checkout page and confirm with remember me
    Then User will see that VISA_CTP payment was successful

  Scenario: Cancel payment - Unregistered VISA CTP user
    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs BASIC_CONFIG_VISA_CTP
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    When User fills VISA_CTP card details with defined card VISA_V21_FRICTIONLESS
    And User chooses to register his card with Visa
    And User clicks Pay Securely button
    And User reviews VISA_CTP checkout page and cancels payment
    #TODO
    Then User will see that VISA_CTP payment was cancelled



  Scenario: Rejected payment - Unregistered VISA CTP user and new device
    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs BASIC_CONFIG_VISA_CTP
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    When User fills VISA_CTP card details with defined card VISA_V21_FRICTIONLESS
    And User chooses to register his card with Visa
    And User clicks Pay Securely button
    And User fills billing address form on Visa checkout popup
    And User reviews VISA_CTP checkout page confirm payment
    Then User will see that VISA_CTP payment was unsuccessful



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







