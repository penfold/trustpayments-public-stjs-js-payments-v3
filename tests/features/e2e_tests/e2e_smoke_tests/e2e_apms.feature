Feature: E2E APMs Payments
  As a user
  I want to use ZIP payment
  If I use alternative payment method

  @smoke_e2e_test @apm
  Scenario: Successful trigger of ZIP payment with accepted values for billingcountryiso2a and currencyiso3a
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | AUTH            |
      | billingfirstname        | FirstName       |
      | billinglastname         | LastName        |
      | billingemail            | email@email.com |
      | billingpremise          | Premise         |
      | billingtown             | test            |
      | billingcounty           | test            |
      | billingstreet           | test            |
      | billingpostcode         | PO1 3AX         |
      | billingcountryiso2a     | GB              |
      | orderreference          | 123445          |
      | currencyiso3a           | GBP             |
      | baseamount              | 1000            |
    And User opens example page WITH_APM
    And User focuses on APM payment methods section
    When User chooses ZIP from APM list
    Then User will be sent to apm page - zip

  @smoke_e2e_test @apm
  Scenario: Successful trigger of PAYU payment with accepted values for billingcountryiso2a and currencyiso3a
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value     |
      | requesttypedescriptions | AUTH      |
      | baseamount              | 70        |
      | billingfirstname        | FirstName |
      | billingcountryiso2a     | PL        |
      | currencyiso3a           | PLN       |
    And User opens example page WITH_APM
    And User focuses on APM payment methods section
    When User chooses PAYU from APM list
    Then User will be sent to apm page - simulator
