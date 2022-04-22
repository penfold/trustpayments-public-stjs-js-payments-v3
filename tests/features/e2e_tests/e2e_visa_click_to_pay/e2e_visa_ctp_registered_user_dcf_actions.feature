Feature: Visa Click To Pay
  As a registered user
  I want to use Visa Click To Pay payment method
  In order to check full payment functionality


  Scenario: Add new card from Visa popup
    Given JS library configured by inline config BASIC_CONFIG
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    And User selects Look up my cards
    And User login to vctp_4 account with valid credentials
    And User see that first card on the list is auto-selected
    And User clicks Pay Securely button
    When User selects Add New Card on VISA_CTP popup
    And User fills card details with defined card VISA_V21_SUCCESSFUL_FRICTIONLESS_AUTH
    And User clicks Pay Securely button
    And User selects address for new card
    And User reviews VISA_CTP checkout page and confirm payment
    And User will see that VISA_CTP checkout is completed
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |
    And User opens example page VISA_CTP
    And User selects Look up my cards
    And User login to vctp_4 account with valid credentials
    Then User see previously added card in card list
    And User clicks Pay Securely button
    And User selects Edit card on VISA_CTP popup
    And User removes card from VISA_CTP wallet
    And User see that first card on the list is auto-selected
    And User will not see previously added card in card list


  Scenario: Edit card details
    Given JS library configured by inline config BASIC_CONFIG
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    And User selects Look up my cards
    And User login to vctp_4 account with valid credentials
    And User see that first card on the list is auto-selected
    And User clicks Pay Securely button
    When User selects Edit card on VISA_CTP popup
    And User changes expiration date, and security code to 0524, 123
    And User reviews VISA_CTP checkout page and confirm payment
    Then User will see that VISA_CTP checkout is completed
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |


  Scenario: Switch card
    Given JS library configured by inline config BASIC_CONFIG
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    And User selects Look up my cards
    And User login to vctp_4 account with valid credentials
    And User see that first card on the list is auto-selected
    And User clicks Pay Securely button
    When User selects Switch card on VISA_CTP popup
    And User selects second card from cards list view
    And User clicks Pay Securely button
    And User reviews VISA_CTP checkout page and continues payment
    And User will see that VISA_CTP checkout is completed
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |

  Scenario: Add and delete address
    Given JS library configured by inline config BASIC_CONFIG
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    And User selects Look up my cards
    And User login to vctp_4 account with valid credentials
    And User see that first card on the list is auto-selected
    And User clicks Pay Securely button
    When User selects Add address on VISA_CTP popup
    And User clicks Add new address plus button
    And User updates billing address form
    And User reviews VISA_CTP checkout page and confirm payment
    And User will see that VISA_CTP checkout is completed
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |
    And User selects Look up my cards
    And User login to vctp_4 account with valid credentials
    And User clicks Pay Securely button
    Then User selects Delete address on VISA_CTP popup
    And User confirms address deletion

  Scenario: Switch address
    Given JS library configured by inline config BASIC_CONFIG
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    And User selects Look up my cards
    And User login to vctp_4 account with valid credentials
    And User see that first card on the list is auto-selected
    And User clicks Pay Securely button
    When User selects Switch address on VISA_CTP popup
    And User chooses card address from the list of available addresses
    And User reviews VISA_CTP checkout page and confirm payment
    And User will see that VISA_CTP checkout is completed

  Scenario: Sign out during payment process
    Given JS library configured by inline config BASIC_CONFIG
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    And User selects Look up my cards
    And User login to vctp_4 account with valid credentials
    And User see that first card on the list is auto-selected
    And User clicks Pay Securely button
    When User signs out from VISA_CTP on popup
    Then User will see that registering card with VISA_CTP is available
    And User is not recognized by VISA_CTP
