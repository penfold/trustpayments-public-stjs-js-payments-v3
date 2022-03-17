Feature: Visa Click To Pay
  As a user
  I want to use Visa Click To Pay payment method
  In order to check full payment functionality

  Scenario: Unbind recognized user
    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs BASIC_CONFIG_VISA_CTP
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    And User selects Look up my cards
    And User login to VISA_CTP account with valid e-mail address
    And User fills valid VISA_CTP one time password
    When User clicks Not you button
    Then User is not recognized by VISA_CTP

  Scenario: Unbind recognized user on recognized device
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
    And User will see that VISA_CTP checkout was successful
    And User opens example page VISA_CTP
    And User selects Look up my cards
    And User login to VISA_CTP account with valid e-mail address
    And User fills valid VISA_CTP one time password
    When User clicks Not you button
    Then User is not recognized by VISA_CTP


