Feature: Visa Click To Pay for unregistered user
  As unregistered user
  I want to use Visa Click To Pay payment method
  With data in jwt payload
  In order to check JWT payload


  Scenario: Successful - Unregistered VISA CTP user on new device with data in JWT
    Given JS library configured by inline config BASIC_CONFIG
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                |
      | requesttypedescriptions | AUTH                 |
      | billingfirstname        | John                 |
      | billinglastname         | Test                 |
      | billingemail            | PGxxxest@pgs.pl      |
      | billingtelephone        | 4407702371570        |
      | billingpremise          | TestPremise          |
      | billingtown             | TownTest             |
      | billingcounty           | CountryTest          |
      | billingcountryiso2a     | GB                   |
      | billingstreet           | PGSkensington avenue |
      | billingpostcode         | PG1 3AX              |
    And User opens example page VISA_CTP
    When User fills VISA_CTP card details with defined card VISA_V21_FRICTIONLESS
    And User chooses to register his card with Visa
    And User clicks Pay Securely button
    And User clicks continue on Visa popup
    And User clicks Continue as guest button
    Then User will see previously submitted billing data
      | key              | value                |
      | billingfirstname | John                 |
      | billinglastname  | Test                 |
      | billingpremise   | TestPremise          |
      | billingtelephone | 7702371570           |
      | billingtown      | TownTest             |
      | billingstreet    | PGSkensington avenue |
    And User reviews VISA_CTP checkout page and confirm payment
    Then User will see that VISA_CTP checkout is completed
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |

  Scenario: Unsuccessful - Unregistered VISA CTP user on new device with invalid data in JWT
    Given JS library configured by inline config BASIC_CONFIG
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                |
      | requesttypedescriptions | AUTH                 |
      | billingfirstname        | Firsttest            |
      | billinglastname         | Lasttest             |
      | billingemail            | pgs.pl               |
      | billingtelephone        | 4407702371570        |
      | billingpremise          | TestPremise          |
      | billingtown             | TownTest             |
      | billingcounty           | CountryTest          |
      | billingcountryiso2a     | GB                   |
      | billingstreet           | PGSkensington avenue |
      | billingpostcode         | PG1 3AX              |
    And User opens example page VISA_CTP
    When User fills VISA_CTP card details with defined card VISA_V21_FRICTIONLESS
    And User chooses to register his card with Visa
    And User clicks Pay Securely button
    Then User will see following callback type called only once
      | callback_type |
      | error         |

  Scenario: Successful - Unregistered VISA CTP user with data in JWT and filled billing details fields
    Given JS library configured by inline config BASIC_CONFIG
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                |
      | requesttypedescriptions | AUTH                 |
      | billingfirstname        | Firsttest            |
      | billinglastname         | Lasttest             |
      | billingemail            | PGStest@pgs.pl       |
      | billingtelephone        | 4407702371570        |
      | billingpremise          | TestPremise          |
      | billingtown             | TownTest             |
      | billingcounty           | CountryTest          |
      | billingcountryiso2a     | GB                   |
      | billingstreet           | PGSkensington avenue |
      | billingpostcode         | PG1 3AX              |
    And User opens example page VISA_CTP
    When User fills billing details fields
    When User fills VISA_CTP card details with defined card VISA_V21_FRICTIONLESS
    And User chooses to register his card with Visa
    And User clicks Pay Securely button
    And User clicks continue on Visa popup
    Then User will see previously submitted billing data
      | key              | value        |
      | billingfirstname | John         |
      | billinglastname  | Test         |
      | billingpremise   | 2            |
      | billingtelephone | 7702371570   |
      | billingtown      | Willow Grove |
      | billingstreet    | Willow Grove |
    And User reviews VISA_CTP checkout page and cancels payment
    Then User will see that VISA_CTP checkout is cancelled
    And User will see following callback type called only once
      | callback_type |
      | cancel        |
      | submit        |

  Scenario: Data validation - Unregistered VISA_CTP user overrides JWT data by filling billing details form
    Given JS library configured by inline config BASIC_CONFIG
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                |
      | requesttypedescriptions | AUTH                 |
      | billingfirstname        | Firsttest            |
      | billinglastname         | Lasttest             |
      | billingemail            | PGStest@pgs.pl       |
      | billingtelephone        | 4407702371570        |
      | billingpremise          | TestPremise          |
      | billingtown             | TownTest             |
      | billingcounty           | CountryTest          |
      | billingcountryiso2a     | GB                   |
      | billingstreet           | PGSkensington avenue |
      | billingpostcode         | PG1 3AX              |
    And User opens example page VISA_CTP
    When User fills Billing detail form with defined values
      | key              | value             |
      | billingfirstname | John              |
      | billinglastname  | Test              |
      | billingemail     | test@gmail.com    |
      | billingtelephone | 4407702371570     |
      | billingpremise   | TestPremise       |
      | billingtown      | TownTest          |
      | billingcounty    | CountryTest       |
      | billingcountry   | GB                |
      | billingstreet    | kensington avenue |
      | billingpostcode  | PG1 3AX           |
    When User fills VISA_CTP card details with defined card VISA_V21_FRICTIONLESS
    And User chooses to register his card with Visa
    And User clicks Pay Securely button
    And User clicks continue on Visa popup
    And User clicks Continue as guest button
    Then User will see previously submitted billing data
      | key              | value             |
      | billingfirstname | John              |
      | billinglastname  | Test              |
      | billingpremise   | TestPremise       |
      | billingtelephone | 7702371570        |
      | billingtown      | TownTest          |
      | billingstreet    | kensington avenue |

  Scenario: Data validation - Unregistered VISA_CTP user with data partially in JWT and filled in billing data form
    Given JS library configured by inline config BASIC_CONFIG
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
      | billingfirstname        | John  |
    And User opens example page VISA_CTP
    When User fills Billing detail form with defined values
      | key              | value             |
      | billinglastname  | Deer              |
      | billingemail     | test@gmail.com    |
      | billingtelephone | 4407702371570     |
      | billingpremise   | TestPremise       |
      | billingtown      | TownTest          |
      | billingcounty    | CountryTest       |
      | billingcountry   | GB                |
      | billingstreet    | kensington avenue |
      | billingpostcode  | PG1 3AX           |
    When User fills VISA_CTP card details with defined card VISA_V21_FRICTIONLESS
    And User chooses to register his card with Visa
    And User clicks Pay Securely button
    And User clicks continue on Visa popup
    And User clicks Continue as guest button
    Then User will see previously submitted billing data
      | key              | value             |
      | billingfirstname | John              |
      | billinglastname  | Deer              |
      | billingpremise   | TestPremise       |
      | billingtelephone | 7702371570        |
      | billingtown      | TownTest          |
      | billingstreet    | kensington avenue |

  Scenario: Data validation - Unregistered VISA_CTP user provides insufficient data in billing details form
    Given JS library configured by inline config BASIC_CONFIG
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    When User fills Billing detail form with defined values
      | key              | value          |
      | billingfirstname | John           |
      | billinglastname  | Deer           |
      | billingemail     | test@gmail.com |
      | billingpremise   | TestPremise    |
      | billingcountry   | GB             |
    When User fills VISA_CTP card details with defined card VISA_V21_FRICTIONLESS
    And User chooses to register his card with Visa
    And User clicks Pay Securely button
    And User fills phone number field on Visa popup
    And User clicks Continue as guest button
    Then User will see lack of Card delivery details message on VISA_CTP popup

  Scenario: Data validation - Unregistered VISA_CTP user do not provides his fullname in billing details form
    Given JS library configured by inline config BASIC_CONFIG
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    When User fills Billing detail form with defined values
      | key              | value             |
      | billingemail     | test@gmail.com    |
      | billingtelephone | 4407702371570     |
      | billingpremise   | TestPremise       |
      | billingtown      | TownTest          |
      | billingcounty    | CountryTest       |
      | billingcountry   | GB                |
      | billingstreet    | kensington avenue |
      | billingpostcode  | PG1 3AX           |
    When User fills VISA_CTP card details with defined card VISA_V21_FRICTIONLESS
    And User chooses to register his card with Visa
    And User clicks Pay Securely button
    Then User will see that billing details on VISA_CTP popup are unfilled
      | key        |
      | firstName  |
      | lastName   |
      | city       |
      | postalCode |

