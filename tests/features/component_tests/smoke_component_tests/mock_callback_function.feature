Feature: Callback functionality

  As a user
  I want to use card payments method
  In order to check callback popup in payment functionality

  Background:
    Given JavaScript configuration is set for scenario based on scenario's @config tag

  @base_config @smoke_component_test
  Scenario: Verify success callback functionality
    When User opens mock payment page
    And User waits for form inputs to be loaded
    And User fills payment form with credit card number "4111110000000211", expiration date "12/30" and cvv "123"
    And Frictionless THREEDQUERY, AUTH response is set to OK
    And User clicks Pay button
    Then User will see "success" popup
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: False
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |


  @base_config @ignore_on_headless @smoke_component_test
  Scenario Outline: Checking callback function about browser data
    When User opens mock payment page WITH_BROWSER_INFO
    Then User will see that browser is marked as supported: "<is_browser_supported>"
    And User will see that operating system is marked as supported: "<is_os_supported>"

    Examples:
      | is_browser_supported | is_os_supported |
      | True                 | True            |
