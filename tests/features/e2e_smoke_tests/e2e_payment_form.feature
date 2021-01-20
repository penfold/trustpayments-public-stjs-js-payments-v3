@smoke_e2e_test
Feature: payment form

  Background:
    Given JavaScript configuration is set for scenario based on scenario's @config tag
    And User opens minimal example page with payment form

  @base_config
  Scenario: Submit payment form without data - fields validation
    Given User waits for whole form to be displayed
    When User clicks Pay button
    Then User will see validation message "Field is required" under all fields
    And User will see that all fields are highlighted

   @config_cybertonica
   Scenario: Cybertonica - successfull payment
    When User fills payment form with defined card MASTERCARD_SUCCESSFUL_AUTH_CARD
    And User clicks Pay button
    And User fills V1 authentication modal
    Then User will see payment status information: "Payment has been successfully processed"
