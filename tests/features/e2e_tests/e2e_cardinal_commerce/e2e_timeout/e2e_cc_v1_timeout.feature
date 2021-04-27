Feature: Cardinal Commerce E2E tests v1 - Timeout
  As a user
  I want to use card payments method
  In order to check Cardinal Commerce integration


  @e2e_cardinal_commerce_v1
  Scenario Outline: TC_5 - Timeout, request type: <request_types>
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card AMERICAN_EXPRESS_TIMEOUT_CARD
    And User clicks Pay button
   Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And "submit" callback is called only once
    And "success" callback is called only once

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |
