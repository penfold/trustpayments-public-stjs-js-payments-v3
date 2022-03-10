Feature: Visa Click To Pay
  As a registered user
  I want to use Visa Click To Pay payment method
  In order to check full payment functionality


  Scenario: Successful payment - Registered VISA_CTP user on unrecognized device with saved credit cards
    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs BASIC_CONFIG_VISA_CTP
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    When User selects Look up my cards
    And User login to VISA_CTP account with valid e-mail address
    And User fills valid VISA_CTP one time password
    And User clicks Pay Securely button
    And User selects first card from cards list view
    And User reviews VISA_CTP checkout page and continues payment
    Then User will see that VISA_CTP payment was successful



  Scenario: Successful payment - Registered VISA_CTP user on unrecognized device with saved credit cards and 3DS authentication
    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs BASIC_CONFIG_VISA_CTP
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    When User selects Look up my cards
    And User login to VISA_CTP account with valid e-mail address
    And User fills valid VISA_CTP one time password
    And User selects second card from cards list view
    And User clicks Pay Securely button
    And User reviews VISA_CTP checkout page and continues payment
    And TODO

  Scenario: Declined payment - Registered VISA_CTP user on unrecognized device with saved credit cards
    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs BASIC_CONFIG_VISA_CTP
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    When User selects Look up my cards
    And User login to VISA_CTP account with valid e-mail address
    And User fills valid VISA_CTP one time password
    And User selects VISA_V21_FRICTIONLESS card from cards list view by number
    And User clicks Pay Securely button
    And User reviews VISA_CTP checkout page and continues payment
    Then User will see that VISA_CTP payment was successful

  Scenario: Cancel payment - Registered VISA CTP user on recognized device with saved credit cards
    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs BASIC_CONFIG_VISA_CTP
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    When User selects Look up my cards
    And User login to VISA_CTP account with valid e-mail address
    And User fills valid VISA_CTP one time password
    And User selects first card from cards list view
    And User clicks Pay Securely button
    And  User reviews VISA_CTP checkout page and cancels payment
    Then User will see that VISA_CTP payment was cancelled

  Scenario: Unsuccessful login with not registered email and repeat payment
    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs BASIC_CONFIG_VISA_CTP
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    And User selects Look up my cards
    When User login to VISA_CTP account with not registered e-mail address
    Then User will see validation message "The email address you have entered is not registered for Click to Pay."
    When User clears email field
    And User login to VISA_CTP account with valid credentials
    And User clicks Pay Securely button
    And User reviews VISA_CTP checkout page and continues payment
    Then User will see that VISA_CTP payment was successful

  Scenario: Unsuccessful authentication with incorrect otp and repeat payment
    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs BASIC_CONFIG_VISA_CTP
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    And User selects Look up my cards
    And User login to VISA_CTP account with valid e-mail address
    When User fills incorrect VISA_CTP one time password
    Then User will see validation message "The code you have entered is incorrect."
    When User fills valid VISA_CTP one time password
    And User selects first card from cards list view
    And User clicks Pay Securely button
    And User reviews VISA_CTP checkout page and continues payment
    Then User will see that VISA_CTP payment was successful



  Scenario: Resend one time password
    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs BASIC_CONFIG_VISA_CTP
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    And User selects Look up my cards
    And User login to VISA_CTP account with valid e-mail address
    When User clicks on Resend code button
    Then OTP is sent again to user email

  Scenario: Display card list view
    Given JS library configured by inline config BASIC_CONFIG
##    And JS library configured by inline configAPMs BASIC_CONFIG_VISA_CTP
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    When User selects Look up my cards
    And User login to VISA_CTP account with valid e-mail address
    And User fills valid VISA_CTP one time password
    Then User see that first card on the list is auto-selected
    And User selects second card from cards list view
    And User clicks Pay Securely button
    And User reviews VISA_CTP checkout page and continues payment
    Then User will see that VISA_CTP payment was successful

    #TODO - Delete new card after this test
  Scenario: Add new card from card list view
    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs BASIC_CONFIG_VISA_CTP
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    When User selects Look up my cards
    And User login to VISA_CTP account with valid credentials
    When User clicks Add new card button
    And User fills card details with defined card VISA_V21_SUCCESSFUL_FRICTIONLESS_AUTH
    And User clicks Pay Securely button
    And User reviews VISA_CTP checkout page and continues payment
    And User will see that VISA_CTP payment was successful
    And User selects Look up my cards
    And User login to VISA_CTP account with valid credentials
    Then User see previously added card in card list

    #TODO
  Scenario: Unsuccessful card adding - invalid card details
    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs BASIC_CONFIG_VISA_CTP
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    And User selects Look up my cards
    And User login to VISA_CTP account with valid credentials
    And User clicks Add new card button
    When User fills card details with defined card MASTERCARD_INVALID_EXP_DATE_CARD
    And User clicks Pay Securely button

    #TODO - Delete new card after this test
  Scenario: Add new card from Visa popup
    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs BASIC_CONFIG_VISA_CTP
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    And User selects Look up my cards
    And User login to VISA_CTP account with valid credentials
    And User clicks Pay Securely button
    When User selects Add New Card on VISA_CTP popup
    #TODO - step for fill card details
    And User reviews VISA_CTP checkout page and continues payment
    And User will see that VISA_CTP payment was successful
    And User selects Look up my cards
    And User login to VISA_CTP account with valid credentials
    Then User see previously added card in card list

    #TODO
  Scenario: Edit card details
    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs BASIC_CONFIG_VISA_CTP
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    And User selects Look up my cards
    And User login to VISA_CTP account with valid credentials
    And User clicks Pay Securely button
    When User selects Edit card on VISA_CTP popup
    #TODO - step for fill card details
    And User reviews VISA_CTP checkout page and continues payment
    And User will see that VISA_CTP payment was successful
    And User selects Look up my cards
    And User login to VISA_CTP account with valid credentials
    Then User see previously added card in card list

  #TODO - to confirm - probably it will not be possible cancel payment on login view
#  Scenario: Successful payment after cancel on login view
#    Given JS library configured by inline config BASIC_CONFIG
##    And JS library configured by inline configAPMs BASIC_CONFIG_VISA_CTP
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value |
#      | requesttypedescriptions | AUTH  |
#    And User opens example page VISA_CTP
#    And User selects Look up my cards
#    And User login to VISA_CTP account with valid e-mail address
#    When User cancel payment on login view
#    Then User will see that VISA_CTP payment was cancelled
#    When User selects Look up my cards
#    And User login to VISA_CTP account with valid e-mail address
#    And User fills valid VISA_CTP one time password
#    And User reviews VISA_CTP checkout page and continues payment
#    Then User will see that VISA_CTP payment was successful

#TODO Uncomment this test when browser native validation will be replaced by new one
#  Scenario Outline: Email field validation
#    Given JS library configured by inline config BASIC_CONFIG
##    And JS library configured by inline configAPMs BASIC_CONFIG_VISA_CTP
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value              |
#      | requesttypedescriptions | AUTH               |
#      | orderreference          | order-01           |
#      | baseamount              | 1000               |
#      | billingfirstname        | FirstName          |
#      | billingemail            | FirstName@email.pl |
#      | billingcountryiso2a     | GB                 |
#      | currencyiso3a           | GBP                |
#    And User opens example page VISA_CTP
#    When User selects Look up my cards
#    And User login to VISA_CTP account with <email_state> e-mail address
#    Then User will see validation message "<validation_message>"
#
#    Examples:
#      | email_state    | validation_message |
#      | invalid format | TODO               |
#      | empty          | TODO               |
#
#TODO Uncomment this test when browser native validation will be replaced by new one
#  Scenario Outline: Unsuccessful authentication with invalid format of otp
#    Given JS library configured by inline config BASIC_CONFIG
##    And JS library configured by inline configAPMs BASIC_CONFIG_VISA_CTP
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value              |
#      | requesttypedescriptions | AUTH               |
#      | orderreference          | order-01           |
#      | baseamount              | 1000               |
#      | billingfirstname        | FirstName          |
#      | billingemail            | FirstName@email.pl |
#      | billingcountryiso2a     | GB                 |
#      | currencyiso3a           | GBP                |
#    And User opens example page VISA_CTP
#    When User selects Look up my cards
#    And User login to VISA_CTP account with <email_state> e-mail address
#    And User fills invalid VISA_CTP one time password
#    Then User will see validation message "<validation_message>"
#
#        Examples:
#      | email_state    | validation_message |
#      | invalid format | TODO               |
#      | empty          | TODO               |
