Feature: Callback functionality

  As a user
  I want to use card payments method
  In order to check callback popup in payment functionality

  Background:
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And Frictionless card payment mock responses are set as BASE_JSINIT and payment status SUCCESS

  @smoke_component_test
  Scenario: Verify success callback functionality
    When User opens example page
    And User waits for form inputs to be loaded
    And User fills payment form with credit card number "4111110000000211", expiration date "12/30" and cvv "123"
    And User clicks Pay button
    Then User will see "success" popup
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: False
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |


  @ignore_on_headless @smoke_component_test
  Scenario Outline: Checking callback function about browser data
    When User opens example page WITH_BROWSER_INFO
    Then User will see that browser is marked as supported: "<is_browser_supported>"
    And User will see that operating system is marked as supported: "<is_os_supported>"

    Examples:
      | is_browser_supported | is_os_supported |
      | True                 | True            |
