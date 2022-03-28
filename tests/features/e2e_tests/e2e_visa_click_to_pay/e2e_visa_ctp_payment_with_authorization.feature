#TODO - uncomment these tests when gateway will be deployed on prod env
#TODO - complete these scenarios when https://securetrading.atlassian.net/browse/CTP-1 is fixed
#Feature: Visa Click To Pay
#  As a user
#  I want to use Visa Click To Pay payment method
#  In order to check full payment functionality
#
#  Scenario: Successful payment - Registered VISA_CTP user on unrecognized device with saved credit cards
#    Given JS library configured by inline config BASIC_CONFIG
##    And JS library configured by inline configAPMs BASIC_CONFIG_VISA_CTP
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value |
#      | requesttypedescriptions | AUTH  |
#    And User opens example page VISA_CTP
#    When User selects Look up my cards
#    And User login to VISA_CTP account with valid e-mail address
#    And User fills valid VISA_CTP one time password
#    And User clicks Pay Securely button
#    And User reviews VISA_CTP checkout page and continues payment
#    Then User will see that VISA_CTP checkout was successful
#    # TODO
#
#  Scenario: Successful payment with 3DS authentication - Registered VISA_CTP user on unrecognized device with saved credit cards
#    Given JS library configured by inline config BASIC_CONFIG
##    And JS library configured by inline configAPMs BASIC_CONFIG_VISA_CTP
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value |
#      | requesttypedescriptions | AUTH  |
#    And User opens example page VISA_CTP
#    When User selects Look up my cards
#    And User login to VISA_CTP account with valid e-mail address
#    And User fills valid VISA_CTP one time password
#    And User selects VISA_V21_FRICTIONLESS card from cards list view by number
#    And User clicks Pay Securely button
#    And User reviews VISA_CTP checkout page and continues payment
#    Then User will see that VISA_CTP checkout was successful
#    # TODO
#
#  Scenario: Rejected payment - Registered VISA_CTP user on unrecognized device with saved credit cards
#    Given JS library configured by inline config BASIC_CONFIG
##    And JS library configured by inline configAPMs BASIC_CONFIG_VISA_CTP
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value |
#      | requesttypedescriptions | AUTH  |
#    And User opens example page VISA_CTP
#    When User selects Look up my cards
#    And User login to VISA_CTP account with valid e-mail address
#    And User fills valid VISA_CTP one time password
#    # TODO
#    And User selects VISA_V21_FRICTIONLESS card from cards list view by number
#    And User clicks Pay Securely button
#    And User reviews VISA_CTP checkout page and continues payment
#    Then User will see that VISA_CTP checkout was successful
#
#  Scenario: Successful payment - Unregistered VISA CTP user on unrecognized device
#    Given JS library configured by inline config BASIC_CONFIG
##    And JS library configured by inline configAPMs BASIC_CONFIG_VISA_CTP
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value |
#      | requesttypedescriptions | AUTH  |
#    And User opens example page VISA_CTP
#    When User fills VISA_CTP card details with defined card VISA_V21_FRICTIONLESS
#    And User chooses to register his card with Visa
#    And User clicks Pay Securely button
#    And User fills billing address form on Visa checkout popup
#    And User reviews VISA_CTP checkout page and confirm with remember me
#
#  Scenario: Successful payment - Unregistered VISA CTP user with 3DS authentication
#    Given JS library configured by inline config BASIC_CONFIG
##    And JS library configured by inline configAPMs BASIC_CONFIG_VISA_CTP
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value |
#      | requesttypedescriptions | AUTH  |
#    And User opens example page VISA_CTP
#    When User fills VISA_CTP card details with defined card VISA_V21_FRICTIONLESS
#    And User chooses to register his card with Visa
#    And User clicks Pay Securely button
#    And User fills billing address form on Visa checkout popup
#    And User reviews VISA_CTP checkout page and confirm with remember me
#
#  Scenario: Rejected payment - Unregistered VISA CTP
#    Given JS library configured by inline config BASIC_CONFIG
##    And JS library configured by inline configAPMs BASIC_CONFIG_VISA_CTP
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value |
#      | requesttypedescriptions | AUTH  |
#    And User opens example page VISA_CTP
#    #TODO - card with rejected status
#    When User fills VISA_CTP card details with defined card VISA_V21_FRICTIONLESS
#    And User chooses to register his card with Visa
#    And User clicks Pay Securely button
#    And User fills billing address form on Visa checkout popup
#    And User reviews VISA_CTP checkout page and confirm with remember me
#    Then User will see that VISA_CTP checkout was rejected
