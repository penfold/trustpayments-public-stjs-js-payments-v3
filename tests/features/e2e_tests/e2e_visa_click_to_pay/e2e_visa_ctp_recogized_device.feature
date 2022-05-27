Feature: Visa Click To Pay
  As a user on recognized device
  I want to use Visa Click To Pay payment method
  In order to check full digital terminal functionality

# TODO temporarily disabled until problems with Remember me are explained with Visa
#  Scenario: Successful checkout - Registered VISA CTP user on recognized device with saved credit cards
#    Given JS library configured by inline config BASIC_CONFIG
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value |
#      | requesttypedescriptions | AUTH  |
#    And User opens example page VISA_CTP
#    And User selects Look up my cards
#    And User login to vctp_3 account with valid credentials
#    And User see that first card on the list is auto-selected
#    And User clicks Pay Securely button
#    And User reviews VISA_CTP checkout page and confirm with remember me
#    Then User will see that VISA_CTP checkout is completed
#    And User waits for notification frame to disappear
#    And Wait for popups to disappear
#    When User opens example page VISA_CTP
#    And User see that first card on the list is auto-selected
#    And User clicks Pay Securely button
#    And User reviews VISA_CTP checkout page and continues payment
#    Then User will see that VISA_CTP checkout is completed
#    And User will see following callback type called only once
#      | callback_type |
#      | success       |
#      | submit        |

    #TODO - currently there is no test card with error status
#  Scenario: Error checkout - Registered VISA CTP user on recognized device with saved credit cards
#    Given JS library configured by inline config BASIC_CONFIG
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value |
#      | requesttypedescriptions | AUTH  |
#    And User opens example page VISA_CTP
#    And User selects Look up my cards
#    And User login to vctp_3 account with valid credentials
#    And User clicks Pay Securely button
#    And User reviews VISA_CTP checkout page and confirm with remember me
#    Then User will see that VISA_CTP checkout is completed
#    When User opens example page VISA_CTP
#    And User see that first card on the list is auto-selected
#    #TODO - card with rejected status
#    And User selects VISA_V21_FRICTIONLESS card from cards list view by number
#    And User clicks Pay Securely button
#    And User reviews VISA_CTP checkout page and continues payment
#    Then User will see that VISA_CTP checkout is rejected
#    And User will see following callback type called only once
#      | callback_type |
#      | error         |
#      | submit        |

  # TODO temporarily disabled until problems with Remember me are explained with Visa
#  Scenario: Cancel checkout - Registered VISA CTP user on recognized device
#    Given JS library configured by inline config BASIC_CONFIG
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value |
#      | requesttypedescriptions | AUTH  |
#    And User opens example page VISA_CTP
#    And User selects Look up my cards
#    And User login to vctp_3 account with valid credentials
#    And User see that first card on the list is auto-selected
#    And User clicks Pay Securely button
#    And User reviews VISA_CTP checkout page and confirm with remember me
#    Then User will see that VISA_CTP checkout is completed
#    When User opens example page VISA_CTP
#    And User see that first card on the list is auto-selected
#    And User clicks Pay Securely button
#    And User reviews VISA_CTP checkout page and cancels payment
#    Then User will see that VISA_CTP checkout is cancelled
#    And User will see following callback type called only once
#      | callback_type |
#      | cancel        |
#      | submit        |
#
#  Scenario: Successful checkout - Unregistered VISA CTP user on recognized device
#    Given JS library configured by inline config BASIC_CONFIG
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value |
#      | requesttypedescriptions | AUTH  |
#    And User opens example page VISA_CTP
#    And User fills VISA_CTP card details with defined card VISA_V21_FRICTIONLESS
#    And User chooses to register his card with Visa
#    And User clicks Pay Securely button
#    And User fills billing address form on Visa checkout popup and saves address for delivery
#    And User reviews VISA_CTP checkout page and confirm with remember me option
#    Then User will see that VISA_CTP checkout is completed
#    And User waits for notification frame to disappear
#    And Wait for popups to disappear
#    When User opens example page VISA_CTP
#    And User see that first card on the list is auto-selected
#    And User clicks Pay Securely button
#    And User reviews VISA_CTP checkout page and continues payment
#    Then User will see that VISA_CTP checkout is completed
#    And User will see following callback type called only once
#      | callback_type |
#      | success       |
#      | submit        |

    #TODO - currently there is no test card with error status
#  Scenario: Error checkout - Unregistered VISA CTP user on recognized device
#    Given JS library configured by inline config BASIC_CONFIG

#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value |
#      | requesttypedescriptions | AUTH  |
#    And User opens example page VISA_CTP
#    And User fills VISA_CTP card details with defined card VISA_V21_FRICTIONLESS
#    And User chooses to register his card with Visa
#    And User clicks Pay Securely button
#    And User fills billing address form on Visa checkout popup
#    And User reviews VISA_CTP checkout page confirm payment
#    Then User will see that VISA_CTP checkout is completed
#    When User opens example page VISA_CTP
#    And User see that first card on the list is auto-selected
#    #TODO - card with error status
#    And User selects VISA_V21_FRICTIONLESS card from cards list view by number
#    And User clicks Pay Securely button
#    And User reviews VISA_CTP checkout page and continues payment
#    Then User will see that VISA_CTP checkout is rejected
#    And User will see following callback type called only once
#      | callback_type |
#      | error         |
#      | submit        |
