#TODO
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
    And User selects <string> card on VISA_CTP popup
    And User reviews VISA_CTP checkout page and continues payment
    And User fills 3ds SDK challenge with <string> and submit
    Then User will see that VISA_CTP payment was unsuccessful

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
    And User selects string card on VISA_CTP popup
    And User reviews VISA_CTP checkout page and continues payment
    Then User will see that VISA_CTP payment was declined
