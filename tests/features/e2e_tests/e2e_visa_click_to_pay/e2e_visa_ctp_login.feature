Feature: Visa Click To Pay
  As a registered user
  I want to use Visa Click To Pay payment method
  In order to check full payment functionality

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
    And User login to vctp_3 account with valid credentials
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
    And User login to VISA_CTP account with vctp_3 e-mail address
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
    And User login to VISA_CTP account with vctp_3 e-mail address
    When User clicks cancel button on otp view
    Then User will back to login view
    When User login to VISA_CTP account with vctp_3 e-mail address
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

  #TODO
#  Scenario: Resend one time password
#    Given JS library configured by inline config BASIC_CONFIG
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value |
#      | requesttypedescriptions | AUTH  |
#    And User opens example page VISA_CTP
#    And User selects Look up my cards
#    And User login to VISA_CTP account with vctp_3 e-mail address
#    When User clicks on Resend code button
#    Then OTP is sent again to user email
