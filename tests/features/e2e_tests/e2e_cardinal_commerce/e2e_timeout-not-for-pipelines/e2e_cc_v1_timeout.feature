@cardinal_commerce_v1
Feature: Cardinal Commerce E2E tests v1 - Timeout
  As a user
  I want to use card payments method
  In order to check Cardinal Commerce integration


  Scenario Outline: TC_5 - Timeout, request type: <request_types>
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card AMEX_TIMEOUT_CARD
    And User clicks Pay button
    And User waits for timeout payment
    Then User will see notification frame text: "<payment_status>"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | <callback>    |

    Examples:
      | request_types            | payment_status                          | callback |
      | THREEDQUERY AUTH         | Payment has been successfully processed | success  |
      | ACCOUNTCHECK THREEDQUERY | Communication error                     | error    |
      | THREEDQUERY ACCOUNTCHECK | Payment has been successfully processed | success  |
