# Created by amiendlarzewski at 14.05.2021
Feature: Cancel payment with 3ds SDK library
  As a user
  I want to be able to cancel 3ds payment
  So that I won't be charged with any money

  Scenario Outline: Cancel payment with INLINE configuration
    Given JS library configured by inline params THREE_DS_LIBRARY_INLINE_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_FRICTIONLESS
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User clicks Cancel button on 3ds SDK challenge
    Then User will see payment status information: "Payment has been cancelled"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | cancel        |
    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |


  Scenario Outline: Cancel payment with POPUP configuration
    Given JS library configured by inline params THREE_DS_LIBRARY_POPUP_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_FRICTIONLESS
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User clicks Cancel button on 3ds SDK challenge
    Then User will see payment status information: "Payment has been cancelled"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | cancel        |
    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |

  Scenario Outline: Cancel payment after filling and submitting 3ds challenge with INLINE configuration
    Given JS library configured by inline params THREE_DS_LIBRARY_INLINE_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_FRICTIONLESS
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User fills 3ds SDK challenge with INCORRECT_CODE and submit
    And User clicks Cancel button on 3ds SDK challenge
    Then User will see payment status information: "Payment has been cancelled"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | cancel        |
    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |
