# this is commented on purpose
#@smoke_e2e_test
#Feature: E2E PayU Payments
#  As a user
#  I want to use PayU payment
#  If I use alternative payment method
#
#
#  Scenario: Successful trigger of payment with accepted values for billingcountryiso2a and currencyiso3a
#    Given JS library configured by inline config BASIC_CONFIG
#    And JS library configured by inline configAPMs BASIC_CONFIG_APM
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value     |
#      | requesttypedescriptions | AUTH      |
#      | baseamount              | 70        |
#      | billingfirstname        | FirstName |
#      | billingcountryiso2a     | PL        |
#      | currencyiso3a           | PLN       |
#    And User opens example page WITH_APM
#    And User focuses on APM payment methods section
#    When User chooses PayU from APM list
#    Then User will be sent to apm page - simulator

