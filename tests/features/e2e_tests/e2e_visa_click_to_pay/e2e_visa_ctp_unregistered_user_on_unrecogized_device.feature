Feature: Visa Click To Pay for unregistered user
  As unregistered user
  I want to use Visa Click To Pay payment method
  In order to check full payment functionality


  Scenario: Successful checkout - Unregistered VISA CTP user on new device
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
    Then User will see that VISA_CTP checkout was successful
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |

  Scenario: Successful checkout - Unregistered VISA CTP user with filled billing details fields
    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs BASIC_CONFIG_VISA_CTP
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    When User fills billing details fields
    And User fills VISA_CTP card details with defined card VISA_V21_FRICTIONLESS
    And User chooses to register his card with Visa
    And User clicks Pay Securely button
    And User reviews VISA_CTP checkout page confirm payment
    Then User will see that VISA_CTP checkout was successful
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |

  Scenario: Error checkout - Unregistered VISA CTP
    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs BASIC_CONFIG_VISA_CTP
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And User opens example page VISA_CTP
    #TODO - card with error status
    When User fills VISA_CTP card details with defined card VISA_V21_FRICTIONLESS
    And User chooses to register his card with Visa
    And User clicks Pay Securely button
    And User fills billing address form on Visa checkout popup
    And User reviews VISA_CTP checkout page and confirm with remember me
    Then User will see that VISA_CTP checkout was rejected
    And User will see following callback type called only once
      | callback_type |
      | error         |
      | submit        |

    #TODO
  Scenario: Successful payment - Unregistered VISA CTP user and don't remember me
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
    And User reviews VISA_CTP checkout page and confirm payment
    Then User will see that VISA_CTP checkout was successful
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |
    When User opens example page VISA_CTP
    Then User is not recognized by VISA_CTP

  Scenario: Re-enter card payment - Unregistered VISA CTP user edits card details
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
    #TODO
    And User clicks edit card details
    And User reviews VISA_CTP checkout page and confirm with remember me
    Then User will see that VISA_CTP checkout was successful

    #TODO
  Scenario: Unregistered VISA CTP user edits address details
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
    #TODO
    When User edits address details
    And User reviews VISA_CTP checkout page and confirm with remember me
    Then User will see that VISA_CTP checkout was successful
