@cardinal_commerce_v2.0_MASTERCARD
Feature: Cardinal Commerce E2E tests v2 - Timeout - MasterCard
  As a user
  I want to use card payments method
  In order to check Cardinal Commerce integration


  Scenario Outline: TC_8 - Timeout on cmpi_lookup Transaction - Card: MASTERCARD_TIMEOUT_ON_CMPI_LOOKUP_TRANSACTION
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
      | sitereference           | jscardinal76426 |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_TIMEOUT_ON_CMPI_LOOKUP_TRANSACTION
    And User clicks Pay button
    Then User will see payment status information: "<payment_status>"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | <callback>    |

    Examples:
      | request_types            | payment_status                          | callback |
      | THREEDQUERY AUTH         | Payment has been successfully processed | success  |
      | ACCOUNTCHECK THREEDQUERY | Bank System Error                       | error    |
      | THREEDQUERY ACCOUNTCHECK | Payment has been successfully processed | success  |
