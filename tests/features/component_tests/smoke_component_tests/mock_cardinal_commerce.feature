Feature: Cardinal commerce

  As a user
  I want to use card payments method with cardinal commerce config
  In order to check full payment functionality


  @smoke_component_test
  Scenario Outline: Cardinal Commerce (step-up payment) - checking payment status for <action_code> response code
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And Challenge card payment mock responses are set as BASE_JSINIT and payment status <action_code>
    And ACS mock response is set to "OK"
    And User opens example page
    And User waits for form inputs to be loaded
    When User fills payment form with defined card <card>
    And User clicks Pay button
    Then User will see notification frame text: "<payment_status_message>"
    And User will see that notification frame has "<color>" color

    Examples:
      | card                         | action_code | payment_status_message                  | color |
      | VISA_V21_NON_FRICTIONLESS    | SUCCESS     | Payment has been successfully processed | green |
      | VISA_V21_STEP_UP_AUTH_FAILED | DECLINE     | Decline                                 | red   |
