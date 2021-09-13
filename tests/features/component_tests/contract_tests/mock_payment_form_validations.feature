Feature: Payment form validations

  As a user
  I want to use card payments method
  In order to check payment form validations

  Background:
    Given JavaScript configuration is set for scenario based on scenario's @config tag
    And User opens mock payment page

  @base_config @smoke_component_test
  Scenario: Submit payment form without data - fields validation
    And User waits for whole form to be loaded
    And User waits for Pay button to be active
    When User clicks Pay button
    Then User will see validation message "Field is required" under all fields
    And THREEDQUERY, AUTH request was not sent

  @base_config @fields_validation
  Scenario Outline: Filling payment form with incomplete data (backend validation) -> cardNumber "<card_number>", expiration: "<expiration>", cvv: "<cvv>"
    When User fills payment form with credit card number "<card_number>", expiration date "<expiration_date>" and cvv "<cvv>"
    And InvalidField response set for "<field>"
    And User clicks Pay button
    Then User will see notification frame text: "Invalid field"
    And THREEDQUERY request was sent only once with correct data

    Examples:
      | card_number      | expiration_date | cvv | field       |
      | 4000000000001000 | 12/22           | 123 | CARD_NUMBER |

    Examples:
      | card_number      | expiration_date | cvv | field           |
      | 4000000000001000 | 12/15           | 123 | EXPIRATION_DATE |
      | 4000000000001000 | 12/22           | 000 | SECURITY_CODE   |
