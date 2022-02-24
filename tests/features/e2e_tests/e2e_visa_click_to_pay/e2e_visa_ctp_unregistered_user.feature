Feature: Visa Click To Pay for unregistered user
  As a new user
  I want to use Visa Click To Pay payment method
  In order to check full payment functionality

#tescase Sebastiana
  Scenario: Successful payment - Unregistered VISA CTP user with registration
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_VISA_CTP
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | AUTH               |
      | orderreference          | order-01           |
      | baseamount              | 70                 |
      | billingfirstname        | FirstName          |
      | billingemail            | FirstName@email.pl |
      | billingcountryiso2a     | GB                 |
      | currencyiso3a           | GBP                |
    And User opens example page VISA_CTP
    When User chooses VISA_CTP from APM list
    And User fills VISA_CTP card details with defined card VISA_V21_FRICTIONLESS
    And User reviews check-out page and register as a new user
    #Visa popup:
    #fill Billing address form and click Continue
      #select “remember me for a faster checkout” option
    And User fills VISA_CTP one time password
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
    When User chooses VISA_CTP from APM list
    And User fills VISA_CTP card details with defined card VISA_V21_REJECTED_FRICTIONLESS_AUTH
    And User reviews check-out page and registering as a new user
    Then User will see that VISA_CTP payment was declined

    Examples:
      | request_types                         |
      | THREEDQUERY AUTH                      |
      | ACCOUNTCHECK THREEDQUERY              |
      | RISKDEC THREEDQUERY AUTH              |
      | RISKDEC ACCOUNTCHECK THREEDQUERY AUTH |

  Scenario Outline: Successful payment - Unregistered VISA CTP user on new device and 3DS authentication
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
    When User chooses VISA_CTP from APM list
    And User fills VISA_CTP card details with defined card VISA_V21_NON_FRICTIONLESS
    And User reviews check-out page and registering as a new user
    And User fills 3ds SDK challenge with <string> and submit
    Then User will see that VISA_CTP payment was successfull

    Examples:
      | request_types    |
      | THREEDQUERY AUTH |

  Scenario Outline: Successful payment - Unregistered VISA CTP user without registration
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_VISA_CTP
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | AUTH               |
      | orderreference          | order-01           |
      | baseamount              | 70                 |
      | billingfirstname        | FirstName          |
      | billingemail            | FirstName@email.pl |
      | billingcountryiso2a     | GB                 |
      | currencyiso3a           | GBP                |
    And User opens example page VISA_CTP
    When User chooses VISA_CTP from APM list
    And User fills VISA_CTP card details with defined card VISA_V21_FRICTIONLESS
    And User reviews check-out page without registering as a new user
    And User fills VISA_CTP one time password
    Then User will see that VISA_CTP payment was successful

    Examples:
      | request_types    |
      | THREEDQUERY AUTH |


  Scenario: Successful payment - Unregistered VISA CTP user on new device and re-enter card
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
    When User chooses VISA_CTP from APM list
    And User fills VISA_CTP card details with defined card VISA_V21_SUCCESSFUL_FRICTIONLESS_AUTH
    And User reviews check-out page and register as a new user and edit card
    And User fills VISA_CTP card details with defined card VISA_V22_SUCCESSFUL_FRICTIONLESS_AUTH
    And User reviews check-out page and register as a new user
    And User fills VISA_CTP one time password
    Then User will see that VISA_CTP payment was successful


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
    When User chooses VISA_CTP from APM list
    And User fills VISA_CTP card details with defined card VISA_V21_FRICTIONLESS
    And User reviews check-out page and register as a new user and cancel payment
    #click on “X” button (cancel payment)
    Then User will see that VISA_CTP payment was unsuccessful



