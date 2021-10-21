Feature: Payment form validations

  As a user
  I want to use card payments method
  In order to check payment form validations

  @smoke_component_test
  Scenario: Submit payment form without data - fields validation
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And Frictionless card payment mock responses are set as BASE_JSINIT and payment status SUCCESS
    And User opens example page
    And User waits for form inputs to be loaded
    And User waits for Pay button to be active
    When User clicks Pay button
    Then User will see validation message "Field is required" under all fields
