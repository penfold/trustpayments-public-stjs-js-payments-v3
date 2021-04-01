Feature: Callback functionality

  As a user
  I want to use card payments method
  In order to check callback popup in payment functionality

  Background:
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | THREEDQUERY AUTH |

#  @base_config @extended_tests_part_2
#  Scenario Outline: Checking <action_code> callback functionality
#    When User opens page with payment form
#    And User fills payment form with credit card number "4111110000000211", expiration date "12/30" and cvv "123"
#    And User clicks Pay button
#    Then User will see "<callback_popup>" popup
#    And "submit" callback is called only once
#    And "<callback_popup>" callback is called only once
#    And submit callback contains JWT response
#    And submit callback contains THREEDRESPONSE: <threedresponse_defined>
#
#    Examples:
#      | action_code | callback_popup | threedresponse_defined |
#      | OK          | success        | False                  |
#
#    Examples:
#      | action_code | callback_popup | threedresponse_defined |
#      | DECLINE     | error          | False                  |
#
#  @base_config
#  Scenario: Checking callback function for in-browser validation
#    When User opens page with payment form
#    And User clicks Pay button
#    Then User will see "error" popup
#    And "error" callback is called only once
#
#  @base_config
#  Scenario: Checking data type passing to callback function
#    When User opens page with payment form
#    And User fills payment form with credit card number "4111110000000211", expiration date "12/30" and cvv "123"
#    And User clicks Pay button - AUTH response is set to "OK"
#    Then User will see correct error code displayed in popup
#    And "submit" callback is called only once
#
  @base_config @ignore_on_headless @skip_form_inputs_load_wait @skip_form_button_load_wait
  Scenario Outline: Checking callback function about browser data
    When User opens prepared payment form page WITH_BROWSER_INFO
    Then User will see that browser is marked as supported: "<is_browser_supported>"
    And User will see that operating system is marked as supported: "<is_os_supported>"

#    @extended_tests_part_3
#    Examples:
#      | is_browser_supported | is_os_supported |
#      | True                 | True            |
    @browser_info_not_supported
    Examples:
      | is_browser_supported | is_os_supported |
      | False                | False           |
