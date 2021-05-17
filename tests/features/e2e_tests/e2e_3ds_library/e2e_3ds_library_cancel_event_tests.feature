# Created by amiendlarzewski at 14.05.2021
Feature: Handle cancel event
  As a user
  I want to be able to cancel 3ds payment
  So that I won't be charged with any money

  Scenario Outline: Cancel payment with 3ds library
    Given JS library configured by inline params THREE_DS_LIBRARY_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_FRICTIONLESS
    And User clicks Pay button
    And User see 3DS Challenge authentication MODAL is displayed
    And User clicks Cancel button on 3DS Challenge MODAL
    Then User will see payment status information: "Payment has been cancelled"
    And User will see that notification frame has "yellow" color
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | cancel        |
    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |


  Scenario Outline: Cancel payment with 3ds library using popup
    Given JS library configured by inline params THREE_DS_LIBRARY_CONFIG_WITH_POPUP and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_FRICTIONLESS
    And User clicks Pay button
    And User see 3DS Challenge authentication POPUP is displayed
    And User clicks Cancel button on 3DS Challenge POPUP
    Then User will see payment status information: "Payment has been cancelled"
    And User will see that notification frame has "yellow" color
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | cancel        |
    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |

  Scenario Outline: Cancel payment after filling  3ds challenge modal
    Given JS library configured by inline params THREE_DS_LIBRARY_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_FRICTIONLESS
    And User clicks Pay button
    And User see 3DS Challenge authentication MODAL is displayed
    And User fills 3DS Challenge authentication MODAL with INCORRECT password
    And User clicks Cancel button on 3DS Challenge MODAL
    Then User will see payment status information: "Payment has been cancelled"
    And User will see that notification frame has "yellow" color
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | cancel        |
    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |
