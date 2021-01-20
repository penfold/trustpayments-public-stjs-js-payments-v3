@smoke_e2e_test
Feature: payment flow with callbacks

   Background:
    Given JavaScript configuration is set for scenario based on scenario's @config tag
    And User opens minimal example page with payment form

  @config_defer_init
  Scenario: Successful step up payment with defer init and requestTypes: THREEDQUERY AUTH
    When User fills payment form with defined card VISA_NON_FRICTIONLESS
    And User clicks Pay button
    And User fills V2 authentication modal
    Then User will see payment status information: "Payment has been successfully processed"
    And "submit" callback is called only once
    And "success" callback is called only once

  @base_config
  Scenario: Cardinal V1 TC_1 - Successful Authentication, request type: THREEDQUERY AUTH
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens minimal.html page with inline param
    When User fills payment form with defined card MASTERCARD_SUCCESSFUL_AUTH_CARD
    And User clicks Pay button
    And User fills V1 authentication modal
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And "submit" callback is called only once
    And "success" callback is called only once
    And User will see that Submit button is "disabled" after payment
    And User will see that ALL input fields are "disabled"

  @config_requestTypes_tdq
  Scenario: Cardinal V1 TC_1 - Successful Authentication, request type: THREEDQUERY
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens minimal.html page with inline param
    When User fills payment form with defined card MASTERCARD_SUCCESSFUL_AUTH_CARD
    And User clicks Pay button
    And User fills V1 authentication modal
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And "submit" callback is called only once
    And "success" callback is called only once
    And User will see that Submit button is "disabled" after payment
    And User will see that ALL input fields are "disabled"

#  TODO - STJS-1278
#  Scenario: Successful payment with cachetoken, startOnLoad and AUTH requestType - non-frictionless card
#    Given JS library configured by inline params SUBMIT_ON_SUCCESS_CACHETOKEN_FIELD and jwt BASE_JWT with additional attributes
#      | key                     | value         |
#      | requesttypedescriptions | CACHETOKENISE |
#    And User opens example page
#    And User fills payment form with defined card VISA_NON_FRICTIONLESS
#    And User clicks Pay button
#    And User waits for payment to be processed
#    And User gets cachetoken value from url
#    And JS library configured by inline params START_ON_LOAD_CONFIG and jwt BASE_JWT with additional attributes
#      | key                     | value            |
#      | requesttypedescriptions | AUTH             |
#      | cachetoken              | cachetoken_value |
#    When User opens example page WITHOUT_SUBMIT_BUTTON
#    Then User will see payment status information: "Payment has been successfully processed"
#    And "submit" callback is called only once
#    And "success" callback is called only once
