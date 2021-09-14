Feature: payment flow with redirect

  As a user
  I want to use card payments method with redirect config
  In order to check if user is redirected or not after submit form action with success or error result

  Background:
    Given JavaScript configuration is set for scenario based on scenario's @config tag
    And User opens mock payment page

  @config_default
  Scenario: Successful payment - verify 'submitOnSuccess' is enabled by default
    And User waits for whole form to be loaded
    And User waits for Pay button to be active
    When User fills merchant data with name "John Test", email "test@example", phone "44422224444"
    And User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And THREEDQUERY mock response is set to "ENROLLED_Y"
    And ACS mock response is set to "OK"
    And User clicks Pay button - AUTH response is set to "OK"
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
    And AUTH and THREEDQUERY requests were sent only once with correct data


  @config_submit_on_error_true
  Scenario: Unsuccessful payment with submitOnError enabled
    And User waits for whole form to be loaded
    And User waits for Pay button to be active
    When User fills merchant data with name "John Test", email "test@example", phone "44422224444"
    And User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And THREEDQUERY mock response is set to "ENROLLED_Y"
    And ACS mock response is set to "OK"
    And User clicks Pay button - AUTH response is set to "DECLINE"
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value              |
      | errormessage         | Decline            |
    And AUTH and THREEDQUERY requests were sent only once with correct data


  @config_submit_on_success_true
  Scenario: Successful payment with submitOnSuccess enabled
    And User waits for whole form to be loaded
    When User fills payment form with defined card MASTERCARD_SUCCESSFUL_FRICTIONLESS_AUTH
    And THREEDQUERY, AUTH mock response is set to OK
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
    And Frictionless AUTH and THREEDQUERY requests were sent only once with correct data
