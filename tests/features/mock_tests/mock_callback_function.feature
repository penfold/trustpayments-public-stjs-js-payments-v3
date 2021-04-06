Feature: Callback functionality

  As a user
  I want to use card payments method
  In order to check callback popup in payment functionality

  Background:
    Given JavaScript configuration is set for scenario based on scenario's @config tag

  @base_config
  Scenario Outline: Checking <action_code> callback functionality
    When User opens mock payment page
    And User waits for whole form to be loaded
    And User fills payment form with credit card number "4111110000000211", expiration date "12/30" and cvv "123"
    And Frictionless THREEDQUERY, AUTH response is set to <action_code>
    And User clicks Pay button
    Then User will see "<callback_popup>" popup
    And "submit" callback is called only once
    And "<callback_popup>" callback is called only once
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: <threedresponse_defined>

    @smoke_component_test
    Examples:
      | action_code | callback_popup | threedresponse_defined |
      | OK          | success        | False                  |

    Examples:
      | action_code | callback_popup | threedresponse_defined |
      | DECLINE     | error          | False                  |

  @base_config
  Scenario: Checking callback function for in-browser validation
    When User opens mock payment page
    And User clicks Pay button
    Then User will see "error" popup
    And "error" callback is called only once

  @base_config
  Scenario: Checking data type passing to callback function
    When User opens mock payment page
    And User fills payment form with credit card number "4111110000000211", expiration date "12/30" and cvv "123"
    And THREEDQUERY mock response is set to "NOT_ENROLLED_N"
    And User clicks Pay button - AUTH response is set to "OK"
    Then User will see correct error code displayed in popup
    And "submit" callback is called only once

  @base_config @ignore_on_headless @smoke_component_test
  Scenario Outline: Checking callback function about browser data
    When User opens mock payment page WITH_BROWSER_INFO
    Then User will see that browser is marked as supported: "<is_browser_supported>"
    And User will see that operating system is marked as supported: "<is_os_supported>"

    Examples:
      | is_browser_supported | is_os_supported |
      | True                 | True            |
