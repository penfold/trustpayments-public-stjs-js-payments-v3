Feature: Visa Click To Pay
  As a registered user
  I want to use Visa Click To Pay payment method
  In order to check full payment functionality


  Scenario: Successful checkout - Registered VISA_CTP user on unrecognized device with saved credit cards
    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs BASIC_CONFIG_VISA_CTP
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    When User selects Look up my cards
    And User login to VISA_CTP account with valid e-mail address
    And User fills valid VISA_CTP one time password
    And User see that first card on the list is auto-selected
    And User clicks Pay Securely button
    And User reviews VISA_CTP checkout page and continues payment
    Then User will see that VISA_CTP checkout is completed
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |

  #TODO - currently there is no test card with error status
#  Scenario: Error checkout - Registered VISA_CTP user on unrecognized device with saved credit cards
#    Given JS library configured by inline config BASIC_CONFIG
##    And JS library configured by inline configAPMs BASIC_CONFIG_VISA_CTP
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value |
#      | requesttypedescriptions | AUTH  |
#    And User opens example page VISA_CTP
#    When User selects Look up my cards
#    And User login to VISA_CTP account with valid e-mail address
#    And User fills valid VISA_CTP one time password
#    #TODO - card with error status
#    And User selects VISA_V21_FRICTIONLESS card from cards list view by number
#    And User clicks Pay Securely button
#    And User reviews VISA_CTP checkout page and continues payment
#    Then User will see that VISA_CTP checkout is rejected
#    And User will see following callback type called only once
#      | callback_type |
#      | error         |
#      | submit        |

  Scenario: Cancel checkout - Registered VISA CTP user on unrecognized device with saved credit cards
    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs BASIC_CONFIG_VISA_CTP
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    When User selects Look up my cards
    And User login to VISA_CTP account with valid e-mail address
    And User fills valid VISA_CTP one time password
    And User see that first card on the list is auto-selected
    And User clicks Pay Securely button
    And User reviews VISA_CTP checkout page and cancels payment
    Then User will see that VISA_CTP checkout is cancelled
    And User will see following callback type called only once
      | callback_type |
      | cancel        |
      | submit        |

  Scenario: Successful checkout - Registered VISA CTP user with remember me option
    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs BASIC_CONFIG_VISA_CTP
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    When User selects Look up my cards
    And User login to VISA_CTP account with valid e-mail address
    And User fills valid VISA_CTP one time password
    And User see that first card on the list is auto-selected
    And User clicks Pay Securely button
    And User reviews VISA_CTP checkout page and confirm with remember me
    Then User will see that VISA_CTP checkout is completed
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |

  Scenario: Unsuccessful login with not registered email and repeat checkout
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
    And User see that first card on the list is auto-selected
    And User clicks Pay Securely button
    And User reviews VISA_CTP checkout page and continues payment
    Then User will see that VISA_CTP checkout is completed
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |

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
    Then User will see that VISA_CTP checkout is completed
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |

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
#    And JS library configured by inline configAPMs BASIC_CONFIG_VISA_CTP
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
    Then User will see previously selected card on VISA_CTP popup

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
    And User see that first card on the list is not selected
    And User fills card details with defined card VISA_V21_SUCCESSFUL_FRICTIONLESS_AUTH
    And User clicks Pay Securely button
    Then User will see previously selected card on VISA_CTP popup
    When User selects address for new card
    When User reviews VISA_CTP checkout page and confirm payment
    Then User will see that VISA_CTP checkout is completed
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |
    When User opens example page VISA_CTP
    And User selects Look up my cards
    And User login to VISA_CTP account with valid credentials
    Then User see previously added card in card list

    #TODO STJS-3188
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
    When User fills card details with defined card MASTERCARD_INVALID_CVV_CARD
    And User clicks Pay Securely button
#    Then Validation

  Scenario: Unsuccessful card adding - unsupported card
    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs BASIC_CONFIG_VISA_CTP
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    And User selects Look up my cards
    And User login to VISA_CTP account with valid credentials
    And User clicks Add new card button
    When User fills card details with defined card MASTERCARD_CARD
    Then User will see VISA_CTP card validation message

    #TODO - STJS-3042 + Delete new card after this test
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
    And User will see that VISA_CTP checkout was successful
    And User selects Look up my cards
    And User login to VISA_CTP account with valid credentials
    Then User see previously added card in card list

    #TODO - STJS-3042
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
    #TODO - step for edit card details
    And User reviews VISA_CTP checkout page and continues payment
    And User will see that VISA_CTP checkout was successful
    And User selects Look up my cards
    And User login to VISA_CTP account with valid credentials
    Then User see previously added card in card list

    #TODO - STJS-3042
  Scenario: Switch card
    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs BASIC_CONFIG_VISA_CTP
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    And User selects Look up my cards
    And User login to VISA_CTP account with valid credentials
    And User clicks Pay Securely button
    When User selects Switch card on VISA_CTP popup
    #TODO - step for switch card details
    And User reviews VISA_CTP checkout page and continues payment
    And User will see that VISA_CTP checkout was successful

    #TODO - STJS-3042
  Scenario: Add and delete address
    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs BASIC_CONFIG_VISA_CTP
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    And User selects Look up my cards
    And User login to VISA_CTP account with valid credentials
    And User clicks Pay Securely button
    When User selects Add address on VISA_CTP popup
    And User clicks Add new address plus button
    And User fills billing address form on Visa checkout popup
    And User reviews VISA_CTP checkout page and continues payment
    And User will see that VISA_CTP checkout was successful

    #TODO - STJS-3042
  Scenario: Switch address
    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs BASIC_CONFIG_VISA_CTP
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    And User selects Look up my cards
    And User login to VISA_CTP account with valid credentials
    And User clicks Pay Securely button
    When User selects Switch address on VISA_CTP popup
    # TODO - step for switch address
    And User reviews VISA_CTP checkout page and continues payment
    And User will see that VISA_CTP checkout was successful



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
#    Then User will see that VISA_CTP checkout was cancelled
#    When User selects Look up my cards
#    And User login to VISA_CTP account with valid e-mail address
#    And User fills valid VISA_CTP one time password
#    And User reviews VISA_CTP checkout page and continues payment
#    Then User will see that VISA_CTP checkout was successful

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
