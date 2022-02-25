Feature: Visa Click To Pay
  As a user
  I want to use Visa Click To Pay payment method
  In order to check full payment functionality


  Scenario: Unbind recognized device - Registered VISA CTP user on recognized device with saved credit cards
    Given JS library configured by inline config BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_VISA_CTP
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | RISKDEC AUTH       |
      | orderreference          | order-01           |
      | baseamount              | 1000               |
      | billingfirstname        | FirstName          |
      | billingemail            | FirstName@email.pl |
      | billingcountryiso2a     | GB                 |
      | currencyiso3a           | GBP                |
    And User opens example page VISA_CTP
    When User selects Look up my cards
    And User selects string card on VISA_CTP popup
    And User reviews VISA_CTP checkout page and unbinds device
    Then User will see that VISA_CTP payment was successful
    When User selects Look up my cards
    And User login to VISA_CTP account with valid e-mail address
    And User fills VISA_CTP one time password
    And User selects string card on VISA_CTP popup
    And User reviews VISA_CTP checkout page and continues payment
    Then User will see that VISA_CTP payment was successful

