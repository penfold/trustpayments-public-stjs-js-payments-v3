#TODO
Feature: Visa Click To Pay
  As a user on recognized device
  I want to use Visa Click To Pay payment method
  In order to check full payment functionality


  Scenario: Successful payment - Registered VISA CTP user on recognized device with saved credit cards
    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs BASIC_CONFIG_VISA_CTP
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    And User selects Look up my cards
    And User login to VISA_CTP account with valid credentials
    And User clicks Pay Securely button
    And User reviews VISA_CTP checkout page and confirm with remember me
    And User will see that VISA_CTP payment was successful
    When User opens example page VISA_CTP
    Then User see that first card on the list is auto-selected
    When User clicks Pay Securely button
    And User reviews VISA_CTP checkout page and continues payment
    Then User will see that VISA_CTP payment was successful

  Scenario: Rejected payment - Registered VISA CTP user on recognized device with saved credit cards
    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs BASIC_CONFIG_VISA_CTP
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    And User selects Look up my cards
    And User login to VISA_CTP account with valid credentials
    And User clicks Pay Securely button
    And User reviews VISA_CTP checkout page and confirm with remember me
    And User will see that VISA_CTP payment was successful
    When User opens example page VISA_CTP
    Then User see that first card on the list is auto-selected
    #TODO - card with rejected status
    When User selects VISA_V21_FRICTIONLESS card from cards list view by number
    And User clicks Pay Securely button
    And User reviews VISA_CTP checkout page and continues payment
    Then User will see that VISA_CTP payment was rejected

  Scenario: Successful payment - Unregistered VISA CTP user on recognized device
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
    And User will see that VISA_CTP payment was successful
    When User opens example page VISA_CTP
    Then User see that first card on the list is auto-selected
    When User clicks Pay Securely button
    And User reviews VISA_CTP checkout page and continues payment
    And User will see that VISA_CTP payment was successful

  Scenario: Rejected payment - Unregistered VISA CTP user on recognized device
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
    And User will see that VISA_CTP payment was successful
    When User opens example page VISA_CTP
    Then User see that first card on the list is auto-selected
    #TODO - card with rejected status
    When User selects VISA_V21_FRICTIONLESS card from cards list view by number
    And User clicks Pay Securely button
    And User reviews VISA_CTP checkout page and continues payment
    Then User will see that VISA_CTP payment was rejected



