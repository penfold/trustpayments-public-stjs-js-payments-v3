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
