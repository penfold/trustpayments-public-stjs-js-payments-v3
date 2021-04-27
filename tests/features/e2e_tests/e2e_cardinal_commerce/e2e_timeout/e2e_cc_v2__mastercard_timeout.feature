@cardinal_commerce_v2.0_MASTERCARD
Feature: Cardinal Commerce E2E tests v2 - Timeout - MasterCard
  As a user
  I want to use card payments method
  In order to check Cardinal Commerce integration


  @base_config @cardinal_commerce_v2.0
  Scenario Outline: TC_8 - Timeout on cmpi_lookup Transaction - Card: MASTERCARD_TIMEOUT_ON_CMPI_LOOKUP_TRANSACTION
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_TIMEOUT_ON_CMPI_LOOKUP_TRANSACTION
    And User clicks Pay button
    Then User will see payment status information: "<payment_status>"
    And User will see that notification frame has "<color>" color
    And "submit" callback is called only once
    And "<callback>" callback is called only once

    Examples:
      | request_types            | payment_status                          | color | callback |
      | THREEDQUERY AUTH         | Payment has been successfully processed | green | success  |
      | ACCOUNTCHECK THREEDQUERY | Bank System Error                       | red   | error    |
