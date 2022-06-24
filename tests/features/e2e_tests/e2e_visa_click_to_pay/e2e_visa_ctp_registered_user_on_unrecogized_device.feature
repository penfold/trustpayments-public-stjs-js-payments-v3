Feature: Visa Click To Pay
  As a registered user
  I want to use Visa Click To Pay payment method
  In order to check full payment functionality


  Scenario: Successful checkout - Registered VISA_CTP user on unrecognized device with saved credit cards
    Given JS library configured by inline config BASIC_CONFIG
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    When User selects Look up my cards
    And User login to VISA_CTP account with vctp_1 e-mail address
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
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value |
#      | requesttypedescriptions | AUTH  |
#    And User opens example page VISA_CTP
#    When User selects Look up my cards
#    And User login to VISA_CTP account with vctp_1 e-mail address
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
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    When User selects Look up my cards
    And User login to VISA_CTP account with vctp_1 e-mail address
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
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    When User selects Look up my cards
    And User login to VISA_CTP account with vctp_1 e-mail address
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
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    And User selects Look up my cards
    When User login to VISA_CTP account with not registered e-mail address
    Then User will see login validation message "The email address you have entered is not registered for Click to Pay."
    When User clears email field
    And User login to vctp_1 account with valid credentials
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
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    And User selects Look up my cards
    And User login to VISA_CTP account with vctp_1 e-mail address
    When User fills incorrect VISA_CTP one time password
    Then User will see otp validation message "The code you have entered is incorrect"
    When User fills valid VISA_CTP one time password
    And User selects first card from cards list view
    And User clicks Pay Securely button
    And User reviews VISA_CTP checkout page and continues payment
    Then User will see that VISA_CTP checkout is completed
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |

#TODO
#  Scenario: Resend one time password
#    Given JS library configured by inline config BASIC_CONFIG
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value |
#      | requesttypedescriptions | AUTH  |
#    And User opens example page VISA_CTP
#    And User selects Look up my cards
#    And User login to VISA_CTP account with vctp_1 e-mail address
#    When User clicks on Resend code button
#    Then OTP is sent again to user email

  Scenario: Display card list view
    Given JS library configured by inline config BASIC_CONFIG
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    When User selects Look up my cards
    And User login to VISA_CTP account with vctp_1 e-mail address
    And User fills valid VISA_CTP one time password
    Then User see that first card on the list is auto-selected
    And User see that submit button label indicates selected card
    When User selects second card from cards list view
    Then User see that submit button label indicates selected card
    And User clicks Pay Securely button
    Then User will see previously selected card on VISA_CTP popup

  Scenario: Add new card from card list view
    Given JS library configured by inline config BASIC_CONFIG
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    When User selects Look up my cards
    And User login to vctp_1 account with valid credentials
    When User clicks Add new card button
    And User see that first card on the list is not selected
    And User see default submit button label
    And User fills card details with defined card VISA_V21_SUCCESSFUL_FRICTIONLESS_AUTH
    And User clicks Pay Securely button
    Then User will see previously selected card on VISA_CTP popup
    When User selects address for new card
    And User reviews VISA_CTP checkout page and confirm payment
    And User will see that VISA_CTP checkout is completed
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |
    When User opens example page VISA_CTP
    And User selects Look up my cards
    And User login to vctp_1 account with valid credentials
    Then User see previously added card in card list
    And User clicks Pay Securely button
    And User selects Edit card on VISA_CTP popup
    And User removes card from VISA_CTP wallet
    And User will not see previously added card in card list

   # Form validation will be made on hpp
  Scenario: Unsuccessful card adding - invalid card details
    Given JS library configured by inline config BASIC_CONFIG
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    And User selects Look up my cards
    And User login to vctp_1 account with valid credentials
    And User clicks Add new card button
    When User fills card details with defined card VISA_INVALID_CVV
    And User clicks Pay Securely button
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | error         |

  Scenario: Unsuccessful card adding - unsupported card
    Given JS library configured by inline config BASIC_CONFIG
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    And User selects Look up my cards
    And User login to vctp_1 account with valid credentials
    And User clicks Add new card button
    When User fills card details with defined card MASTERCARD_CARD
    And User clicks Pay Securely button
    Then User will see VISA_CTP card validation message


  Scenario: Checking more information tooltip
    Given JS library configured by inline config BASIC_CONFIG
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    When User selects Look up my cards
    Then User can open additional information hint
    And User can get acquainted with VISA_CTP details

  Scenario: Successful payment after cancel on otp view
    Given JS library configured by inline config BASIC_CONFIG
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    And User selects Look up my cards
    And User login to VISA_CTP account with vctp_1 e-mail address
    When User clicks cancel button on otp view
    Then User will back to login view
    When User login to VISA_CTP account with vctp_1 e-mail address
    And User fills valid VISA_CTP one time password
    And User see that first card on the list is auto-selected
    And User clicks Pay Securely button
    And User reviews VISA_CTP checkout page and continues payment
    Then User will see that VISA_CTP checkout is completed
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |

  Scenario: Cancel on login view
    Given JS library configured by inline config BASIC_CONFIG
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    And User selects Look up my cards
    When User clicks cancel button on login view
    Then User will not see login view

  Scenario: Email field validation
    Given JS library configured by inline config BASIC_CONFIG
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    And User selects Look up my cards
    And User login to VISA_CTP account with invalid format e-mail address
    Then User will see login validation message "Email is not in valid format."
