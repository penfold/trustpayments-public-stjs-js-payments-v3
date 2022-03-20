@cardinal_commerce_v2.0_VISA_V21
Feature: Cardinal Commerce E2E Additional tests v2 - Visa v2.1
  As a user
  I want to use card payments method
  In order to check Cardinal Commerce integration


  Scenario Outline: Additional TC_2a. Card Authentication Failed
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_TRANSACTION_TIMEOUT_ACS
    And User clicks Pay button
    Then User will see notification frame text: "<payment_status>"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | <callback>    |
    And User will see that Pay button is "<state>"
    And User will see that ALL input fields are "<state>"
    #TODO - uncomment when cardinal issue will be resolved
    Examples:
      | request_types            | payment_status                          | callback | state    |
#      | THREEDQUERY AUTH         | Unauthenticated                         | error    | enabled  |
      | ACCOUNTCHECK THREEDQUERY | Payment has been successfully processed | success  | disabled |
#      | THREEDQUERY ACCOUNTCHECK | Unauthenticated                         | error    | enabled  |


  Scenario Outline: Additional TC_2b. Suspected Fraud
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_SUSPECTED_FRAUD
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |
    And User will see that Pay button is "disabled"
    And User will see that ALL input fields are "disabled"

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |
      | THREEDQUERY ACCOUNTCHECK |


  Scenario Outline: Additional TC_2c. Cardholder Not Enrolled in Service
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_NOT_ENROLLED
    And User clicks Pay button
    Then User will see notification frame text: "<payment_status>"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | <callback>    |
    And User will see that Pay button is "<state>"
    And User will see that ALL input fields are "<state>"
    #TODO - uncomment when cardinal issue will be resolved
    Examples:
      | request_types            | payment_status                          | callback | state    |
#      | THREEDQUERY AUTH         | Unauthenticated                         | error    | enabled  |
      | ACCOUNTCHECK THREEDQUERY | Payment has been successfully processed | success  | disabled |
#      | THREEDQUERY ACCOUNTCHECK | Unauthenticated                         | error    | enabled  |


#  Scenario Outline: Additional TC_2d. Transaction timed out at the ACS
#    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
#      | key                     | value           |
#      | requesttypedescriptions | <request_types> |
#    And User opens example page
#    When User fills payment form with defined card VISA_TIMEOUT_2_ACS
#    And User clicks Pay button
#    Then User will see notification frame text: "Payment has been successfully processed"
#    And User will see following callback type called only once
#      | callback_type |
#      | submit        |
#      | success       |
#    And User will see that Pay button is "disabled"
#    And User will see that ALL input fields are "disabled"
#
#    Examples:
#      | request_types            |
#      | THREEDQUERY AUTH         |
#      | ACCOUNTCHECK THREEDQUERY |
#      | THREEDQUERY ACCOUNTCHECK |


  Scenario Outline: Additional TC_2e. Non-Payment transaction not supported
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_TRANSACTION_NON_PAYMENT
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |
    And User will see that Pay button is "disabled"
    And User will see that ALL input fields are "disabled"

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |
      | THREEDQUERY ACCOUNTCHECK |


  Scenario Outline: Additional TC_2f. 3RI transaction not supported
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_3RI_TRANSACTION_NOT_SUPPORTED
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |
    And User will see that Pay button is "disabled"
    And User will see that ALL input fields are "disabled"

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |
      | THREEDQUERY ACCOUNTCHECK |
