Feature: Visa Click To Pay for unregistered user
  As unregistered user
  I want to use Visa Click To Pay payment method
  In order to check full payment functionality


  Scenario: Successful checkout - Unregistered VISA CTP user on new device
    Given JS library configured by inline config BASIC_CONFIG
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    When User fills VISA_CTP card details with defined card VISA_V21_FRICTIONLESS
    And User chooses to register his card with Visa
    And User clicks Pay Securely button
    And User fills billing address form on Visa checkout popup and saves address for delivery
    And User reviews VISA_CTP checkout page and confirm payment
    Then User will see that VISA_CTP checkout is completed
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |

  Scenario: Successful checkout - Unregistered VISA CTP user with filled billing details fields
    Given JS library configured by inline config BASIC_CONFIG
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    When User fills billing details fields
    And User fills VISA_CTP card details with defined card VISA_V21_FRICTIONLESS
    And User chooses to register his card with Visa
    And User clicks Pay Securely button
    And User confirms email address
    And User reviews VISA_CTP checkout page and confirm payment
    Then User will see that VISA_CTP checkout is completed
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |

    #TODO - currently there is no test card with error status
#  Scenario: Error checkout - Unregistered VISA CTP
#    Given JS library configured by inline config BASIC_CONFIG
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value |
#      | requesttypedescriptions | AUTH  |
#    And User opens example page VISA_CTP
#    #TODO - card with error status
#    When User fills VISA_CTP card details with defined card VISA_V21_FRICTIONLESS
#    And User chooses to register his card with Visa
#    And User clicks Pay Securely button
#    And User fills billing address form on Visa checkout popup
#    And User reviews VISA_CTP checkout page and confirm with remember me
#    Then User will see that VISA_CTP checkout is rejected
#    And User will see following callback type called only once
#      | callback_type |
#      | error         |
#      | submit        |

  Scenario: Successful payment - Unregistered VISA CTP user with remember me
    Given JS library configured by inline config BASIC_CONFIG
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    When User fills VISA_CTP card details with defined card VISA_V21_FRICTIONLESS
    And User chooses to register his card with Visa
    And User clicks Pay Securely button
    And User fills billing address form on Visa checkout popup and saves address for delivery
    And User reviews VISA_CTP checkout page and confirm with remember me option
    Then User will see that VISA_CTP checkout is completed
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |
    And User waits for notification frame to disappear
    And Wait for popups to disappear
    When User opens example page VISA_CTP
    And User see that first card on the list is auto-selected

  Scenario: Re-enter card payment - Unregistered VISA CTP user edits card details
    Given JS library configured by inline config BASIC_CONFIG
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    When User fills VISA_CTP card details with defined card VISA_V21_FRICTIONLESS
    And User chooses to register his card with Visa
    And User clicks Pay Securely button
    And User clicks edit card details on VISA_CTP popup
    And User clears VISA_CTP payment from
    And User fills VISA_CTP card details with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay Securely button
    And User fills billing address form on Visa checkout popup and saves address for delivery
    And User reviews VISA_CTP checkout page and confirm payment
    Then User will see that VISA_CTP checkout is completed
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |

  Scenario: Unregistered VISA CTP user edits address details
    Given JS library configured by inline config BASIC_CONFIG
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    When User fills VISA_CTP card details with defined card VISA_V21_FRICTIONLESS
    And User chooses to register his card with Visa
    And User clicks Pay Securely button
    And User fills billing address form on Visa checkout popup and saves address for delivery
    When User edits address details on VISA_CTP popup
    And User updates billing address form
    And User reviews VISA_CTP checkout page and confirm payment
    Then User will see that VISA_CTP checkout is completed
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |

  Scenario: Unsuccessful card adding - VISA CTP card recognizing mechanism for Unregistered user
    Given JS library configured by inline config BASIC_CONFIG
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    When User fills VISA_CTP card details with defined card MASTERCARD_CARD
    Then User will see that registering card with VISA_CTP is unavailable
    And User clears card details fields
    And User fills VISA_CTP card details with defined card VISA_V21_FRICTIONLESS
    Then User will see that registering card with VISA_CTP is available

  Scenario: Unregistered VISA CTP user cancels payment
    Given JS library configured by inline config BASIC_CONFIG
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    When User fills VISA_CTP card details with defined card VISA_V21_FRICTIONLESS
    And User chooses to register his card with Visa
    And User clicks Pay Securely button
    And User fills billing address form on Visa checkout popup and saves address for delivery
    And User reviews VISA_CTP checkout page and cancels payment
    Then User will see that VISA_CTP checkout is cancelled
    And User will see following callback type called only once
      | callback_type |
      | cancel        |
      | submit        |
    And User waits for callback to disappear
    When User clicks Pay Securely button
    And User fills billing address form on Visa checkout popup and saves address for delivery
    And User reviews VISA_CTP checkout page and confirm payment
    Then User will see that VISA_CTP checkout is completed
    And User will see following callback type called only once
      | callback_type |
      | success       |

  Scenario: DCF translations - checking language preference
    Given JS library configured by inline config BASIC_CONFIG
    And JS library authenticated by jwt BASE_JWT_DE with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    When User fills VISA_CTP card details with defined card VISA_V21_FRICTIONLESS
    And User chooses to register his card with Visa
    And User clicks Pay Securely button
    Then User will see labels displayed on VISA_CTP popup translated into "de_DE"
      | fields                    |
      | Visa first name label     |
      | Visa last name label      |
      | Visa street name label    |
      | Visa street number label  |
      | Visa e-mail address label |
      | Visa Pay now button       |
