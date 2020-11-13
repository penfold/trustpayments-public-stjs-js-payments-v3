Feature: E2E startOnLoad

  As a user
  I want to use card payments method with startOnLoad config
  In order to check full payment functionality

  @reactJS
  @angular
  @vueJS
  @react_native
  Scenario: Successful non-frictionless payment with startOnLoad
    Given JS library configured by inline params START_ON_LOAD_CONFIG and jwt JWT_WITH_NON_FRICTIONLESS_CARD with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page WITHOUT_SUBMIT_BUTTON
    And User fills V2 authentication modal
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color

  Scenario: Successful payment with startOnLoad and additional request types: ACCOUNTCHECK, TDQ, AUTH
    Given JS library configured by inline params START_ON_LOAD_REQUEST_TYPES_CONFIG and jwt JWT_WITH_FRICTIONLESS_CARD with additional attributes
      | key                     | value                         |
      | requesttypedescriptions | ACCOUNTCHECK THREEDQUERY AUTH |
    And User opens example page WITHOUT_SUBMIT_BUTTON
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color

  Scenario: Successful payment with startOnLoad and additional request types: ACCOUNTCHECK, TDQ, AUTH, SUBSCRIPTION
    Given JS library configured by inline params START_ON_LOAD_REQUEST_TYPES_SUB_CONFIG and jwt JWT_NON_FRICTIONLESS_CARD_SUBSCRIPTION with additional attributes
      | key                     | value                                      |
      | requesttypedescriptions | ACCOUNTCHECK THREEDQUERY AUTH SUBSCRIPTION |
    And User opens example page WITHOUT_SUBMIT_BUTTON
    And User fills V2 authentication modal
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
