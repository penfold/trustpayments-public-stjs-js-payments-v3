##TODO It should be uncommented when https://securetrading.atlassian.net/browse/STJS-942 will be done
#Feature: Visa checkout E2E tests
#
#  As a user
#  I want to use visa checkout
#  To use defined card
#
#  @reactJS
#    @angular
#    @vueJS
#    @react_native
#  Scenario Outline: Successful Authentication by Visa checkout
#    Given JS library configured by inline params VISA_CHECKOUT_CONFIG and jwt BASE_JWT with additional attributes
#      | key                     | value                     |
#      | requesttypedescriptions | <requesttypedescriptions> |
#    And User opens example page
#    And User clicks on Visa Checkout button
#    And User fills visa checkout email address
#    And User fills visa checkout one time password
#    When User selects VISA_FRICTIONLESS card on visa checkout popup
#    And User confirms displayed card with data
##    And User confirms visa checkout security code
#    Then User will see payment status information: "Payment has been successfully processed"
#    And User will see that notification frame has "green" color
#
#    Examples:
#      | requesttypedescriptions               |
#      | AUTH                                  |
#      | RISKDEC                               |
#      | THREEDQUERY                           |
#      | ACCOUNTCHECK                          |
#      | RISKDEC THREEDQUERY AUTH              |
#      | THREEDQUERY AUTH RISKDEC              |
#      | ACCOUNTCHECK THREEDQUERY              |
#      | ACCOUNTCHECK THREEDQUERY AUTH         |
#      | RISKDEC THREEDQUERY ACCOUNTCHECK      |
#      | RISKDEC THREEDQUERY                   |
#      | RISKDEC ACCOUNTCHECK AUTH             |
#      | THREEDQUERY ACCOUNTCHECK              |
#      | THREEDQUERY AUTH                      |
#      | RISKDEC ACCOUNTCHECK THREEDQUERY AUTH |
#      | RISKDEC AUTH                          |
#      | RISKDEC ACCOUNTCHECK THREEDQUERY      |
#      | ACCOUNTCHECK AUTH                     |
#      | RISKDEC ACCOUNTCHECK                  |
#      | AUTH RISKDEC                          |
#
#  Scenario Outline: Successful Authentication by Visa checkout
#    Given JS library configured by inline params VISA_CHECKOUT_CONFIG and jwt BASE_JWT with additional attributes
#      | key                     | value                     |
#      | requesttypedescriptions | <requesttypedescriptions> |
#    And User opens example page
#    And User clicks on Visa Checkout button
#    And User fills visa checkout email address
#    And User fills visa checkout one time password
#    When User selects VISA_NON_FRICTIONLESS card on visa checkout popup
#    And User confirms displayed card with data
##    And User confirms visa checkout security code
#    Then User will see payment status information: "Payment has been successfully processed"
#    And User will see that notification frame has "green" color
#
#    Examples:
#      | requesttypedescriptions               |
#      | AUTH                                  |
#      | RISKDEC                               |
#      | THREEDQUERY                           |
#      | ACCOUNTCHECK                          |
#      | RISKDEC THREEDQUERY AUTH              |
#      | THREEDQUERY AUTH RISKDEC              |
#      | ACCOUNTCHECK THREEDQUERY              |
#      | ACCOUNTCHECK THREEDQUERY AUTH         |
#      | RISKDEC THREEDQUERY ACCOUNTCHECK      |
#      | RISKDEC THREEDQUERY                   |
#      | RISKDEC ACCOUNTCHECK AUTH             |
#      | THREEDQUERY ACCOUNTCHECK              |
#      | THREEDQUERY AUTH                      |
#      | RISKDEC ACCOUNTCHECK THREEDQUERY AUTH |
#      | RISKDEC AUTH                          |
#      | RISKDEC ACCOUNTCHECK THREEDQUERY      |
#      | ACCOUNTCHECK AUTH                     |
#      | RISKDEC ACCOUNTCHECK                  |
#      | AUTH RISKDEC                          |
#
#  Scenario Outline: Successful Authentication by Visa checkout
#    Given JS library configured by inline params VISA_CHECKOUT_CONFIG and jwt JWT_WITH_SUBSCRIPTION with additional attributes
#      | key                     | value                     |
#      | requesttypedescriptions | <requesttypedescriptions> |
#    And User opens example page
#    And User clicks on Visa Checkout button
#    And User fills visa checkout email address
#    And User fills visa checkout one time password
#    When User selects VISA_FRICTIONLESS card on visa checkout popup
#    And User confirms displayed card with data
##    And User confirms visa checkout security code
#    Then User will see payment status information: "Payment has been successfully processed"
#    And User will see that notification frame has "green" color
#
#    Examples:
#      | requesttypedescriptions                            |
#      | RISKDEC ACCOUNTCHECK AUTH SUBSCRIPTION             |
#      | THREEDQUERY AUTH SUBSCRIPTION                      |
#      | RISKDEC THREEDQUERY AUTH SUBSCRIPTION              |
#      | ACCOUNTCHECK SUBSCRIPTION                          |
#      | ACCOUNTCHECK AUTH SUBSCRIPTION                     |
#      | RISKDEC AUTH SUBSCRIPTION                          |
#      | THREEDQUERY ACCOUNTCHECK SUBSCRIPTION              |
#      | AUTH SUBSCRIPTION                                  |
#      | ACCOUNTCHECK THREEDQUERY AUTH SUBSCRIPTION         |
#      | RISKDEC ACCOUNTCHECK THREEDQUERY AUTH SUBSCRIPTION |
#      | RISKDEC THREEDQUERY ACCOUNTCHECK SUBSCRIPTION      |
#
#
#  Scenario Outline: Successful Authentication by Visa checkout
#    Given JS library configured by inline params VISA_CHECKOUT_CONFIG and jwt JWT_WITH_SUBSCRIPTION with additional attributes
#      | key                     | value                     |
#      | requesttypedescriptions | <requesttypedescriptions> |
#    And User opens example page
#    And User clicks on Visa Checkout button
#    And User fills visa checkout email address
#    And User fills visa checkout one time password
#    When User selects VISA_NON_FRICTIONLESS card on visa checkout popup
#    And User confirms displayed card with data
##    And User confirms visa checkout security code
#    Then User will see payment status information: "Payment has been successfully processed"
#    And User will see that notification frame has "green" color
#
#    Examples:
#      | requesttypedescriptions                            |
#      | RISKDEC ACCOUNTCHECK AUTH SUBSCRIPTION             |
#      | THREEDQUERY AUTH SUBSCRIPTION                      |
#      | RISKDEC THREEDQUERY AUTH SUBSCRIPTION              |
#      | ACCOUNTCHECK SUBSCRIPTION                          |
#      | ACCOUNTCHECK AUTH SUBSCRIPTION                     |
#      | RISKDEC AUTH SUBSCRIPTION                          |
#      | THREEDQUERY ACCOUNTCHECK SUBSCRIPTION              |
#      | AUTH SUBSCRIPTION                                  |
#      | ACCOUNTCHECK THREEDQUERY AUTH SUBSCRIPTION         |
#      | RISKDEC ACCOUNTCHECK THREEDQUERY AUTH SUBSCRIPTION |
#      | RISKDEC THREEDQUERY ACCOUNTCHECK SUBSCRIPTION      |
#
#  Scenario: Declined Authentication by Visa checkout using declined visa card
#    Given JS library configured by inline params VISA_CHECKOUT_CONFIG and jwt BASE_JWT with additional attributes
#      | key                     | value             |
#      | requesttypedescriptions | ACCOUNTCHECK AUTH |
#    And User opens example page
#    And User clicks on Visa Checkout button
#    And User fills visa checkout email address
#    And User fills visa checkout one time password
#    When User selects VISA_DECLINED_CARD card on visa checkout popup
#    And User confirms displayed card with data
#    #And User confirms visa checkout security code
#    Then User will see payment status information: "Decline"
#    And User will see that notification frame has "red" color
#
#  Scenario: Successful Authentication by Visa checkout with submit on success config
#    Given JS library configured by inline params VISA_CHECKOUT_WITH_SUBMIT_ON_SUCCESS_CONFIG and jwt BASE_JWT with additional attributes
#      | key                     | value             |
#      | requesttypedescriptions | ACCOUNTCHECK AUTH |
#    And User opens example page
#    And User clicks on Visa Checkout button
#    And User fills visa checkout email address
#    And User fills visa checkout one time password
#    When User selects VISA_CARD card on visa checkout popup
#    And User confirms displayed card with data
#    #And User confirms visa checkout security code
#    Then User will be sent to page with url "www.example.com" having params
#      | key           | value                                   |
#      | errormessage  | Payment has been successfully processed |
#      | baseamount    | 1000                                    |
#      | currencyiso3a | GBP                                     |
#      | errorcode     | 0                                       |
#
#  Scenario: Declined Authentication by Visa checkout with error callback config
#    Given JS library configured by inline params VISA_CHECKOUT_CONFIG and jwt BASE_JWT with additional attributes
#      | key                     | value             |
#      | requesttypedescriptions | ACCOUNTCHECK AUTH |
#    And User opens example page
#    And User clicks on Visa Checkout button
#    And User fills visa checkout email address
#    And User fills visa checkout one time password
#    When User selects VISA_DECLINED_CARD card on visa checkout popup
#    And User confirms displayed card with data
#    #And User confirms visa checkout security code
#    Then User will see payment status information: "Decline"
#    And User will see "error" popup
#
#  Scenario: Successful Authentication by Visa checkout with cybertonica config
#    Given JS library configured by inline params VISA_CHECKOUT_WITH_CYBERTONICA_CONFIG and jwt BASE_JWT with additional attributes
#      | key                     | value             |
#      | requesttypedescriptions | ACCOUNTCHECK AUTH |
#    And User opens example page
#    And User clicks on Visa Checkout button
#    And User fills visa checkout email address
#    And User fills visa checkout one time password
#    When User selects VISA_CARD card on visa checkout popup
#    And User confirms displayed card with data
#    #And User confirms visa checkout security code
#    Then User will see payment status information: "Payment has been successfully processed"
#    And User will see that notification frame has "green" color
#
#  Scenario: Successful Authentication by Visa checkout with updateJwt and deferinit true
#    Given JS library is configured with VISA_CHECKOUT_WITH_DEFERINIT_TRUE_CONFIG and BASE_JWT
#    And User opens example page WITH_UPDATE_JWT
#      | jwtName          |
#      | BASE_UPDATED_JWT |
#    And User calls updateJWT function by filling amount field
#    And User clicks on Visa Checkout button
#    And User fills visa checkout email address
#    And User fills visa checkout one time password
#    When User selects VISA_CARD card on visa checkout popup
#    And User confirms displayed card with data
#    #And User confirms visa checkout security code
#    Then User will see payment status information: "Payment has been successfully processed"
#    And User will see that notification frame has "green" color
#
#  Scenario: Successful Authentication by Visa checkout with request types config
#    Given JS library configured by inline params VISA_CHECKOUT_CONFIG and jwt BASE_JWT with additional attributes
#      | key                     | value             |
#      | requesttypedescriptions | ACCOUNTCHECK AUTH |
#    And User opens example page
#    And User clicks on Visa Checkout button
#    And User fills visa checkout email address
#    And User fills visa checkout one time password
#    When User selects VISA_CARD card on visa checkout popup
#    And User confirms displayed card with data
#    #And User confirms visa checkout security code
#    Then User will see payment status information: "Payment has been successfully processed"
#    And User will see that notification frame has "green" color
#
#  @switch_to_parent_iframe
#  Scenario: Successful Authentication by Visa checkout with iFrame
#    Given JS library configured by inline params VISA_CHECKOUT_CONFIG and jwt BASE_JWT with additional attributes
#      | key                     | value             |
#      | requesttypedescriptions | ACCOUNTCHECK AUTH |
#    And User opens example page IN_IFRAME
#    And User clicks on Visa Checkout button
#    And User fills visa checkout email address
#    And User fills visa checkout one time password
#    When User selects VISA_FRICTIONLESS card on visa checkout popup
#    And User confirms displayed card with data
#    #And User confirms visa checkout security code
#    Then User will see payment status information: "Payment has been successfully processed"
#    And User will see that notification frame has "green" color
