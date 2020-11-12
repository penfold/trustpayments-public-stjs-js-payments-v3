Feature: E2E Card Payments with request types in config

  As a user
  I want to use card payments method with request types config
  In order to check full payment functionality

  @reactJS
  @angular
  @vueJS
  @react_native
  Scenario: Successful payment with config's requestTypes param having values in valid order
    Given JS library configured by inline params REQUEST_TYPE_ACC_TDQ_AUTH_RISK_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value                                 |
      | requesttypedescriptions | ACCOUNTCHECK THREEDQUERY AUTH RISKDEC |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_CARD
    And User clicks Pay button
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And "submit" callback is called only once
    And "success" callback is called only once


  @e2e_config_requesttypes_invalid_order
  Scenario: Unsuccessful payment with config's requestTypes param having values in invalid order
    Given JS library configured by inline params REQUEST_TYPES_CONFIG_INVALID_ORDER and jwt BASE_JWT with additional attributes
      | key                     | value                                 |
      | requesttypedescriptions | RISKDEC ACCOUNTCHECK AUTH THREEDQUERY |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_CARD
    And User clicks Pay button
    Then User will see payment status information: "Invalid field"
    And User will see that notification frame has "red" color


  @reactJS
  @angular
  @vueJS
  @react_native
  Scenario: Successful payment with config's requestTypes: ACCOUNTCHECK, TDQ, AUTH, SUBSCRIPTION
    Given JS library configured by inline params REQUEST_TYPE_ACHECK_TDQ_AUTH_SUB_CONFIG and jwt JWT_WITH_SUBSCRIPTION with additional attributes
      | key                     | value                                      |
      | requesttypedescriptions | ACCOUNTCHECK THREEDQUERY AUTH SUBSCRIPTION |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_CARD
    And User clicks Pay button
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And "submit" callback is called only once
    And "success" callback is called only once


  Scenario: Successful payment with bypassCard and requestTpes: RISKDEC, ACCOUNTCHECK,THREEDQUERY, AUTH
    Given JS library configured by inline params BYPASS_MASTERCARD_REQUEST_TYPE_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value                                 |
      | requesttypedescriptions | RISKDEC ACCOUNTCHECK THREEDQUERY AUTH |
      | threedbypasscards       | MASTERCARD                            |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_SUCCESSFUL_AUTH_CARD
    And User clicks Pay button
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And "submit" callback is called only once
    And "success" callback is called only once


  Scenario: Successful step up payment with defer init and requestTypes: ACCOUNTCHECK, TDQ
    Given JS library configured by inline params REQUEST_TYPE_ACHECK_TDQ_WITH_DEFER_INIT and jwt BASE_JWT with additional attributes
      | key                     | value                    |
      | requesttypedescriptions | ACCOUNTCHECK THREEDQUERY |
    And User opens example page
    When User fills payment form with defined card VISA_NON_FRICTIONLESS
    And User clicks Pay button
    And User fills V2 authentication modal
    Then User will see payment status information: "Payment has been successfully processed"
    And "submit" callback is called only once
    And "success" callback is called only once


  Scenario: Successful frictionless payment with defer init and requestTypes: ACCOUNTCHECK, TDQ
    Given JS library configured by inline params REQUEST_TYPE_ACHECK_TDQ_WITH_DEFER_INIT and jwt BASE_JWT with additional attributes
      | key                     | value                    |
      | requesttypedescriptions | ACCOUNTCHECK THREEDQUERY |
    And User opens example page
    When User fills payment form with defined card VISA_FRICTIONLESS
    And User clicks Pay button
    Then User will see payment status information: "Payment has been successfully processed"
    And "submit" callback is called only once
    And "success" callback is called only once

  Scenario Outline: Successful payment with single requestTypes <REQUEST_TYPE_TC>
    Given JS library configured by inline params <E2E_CONFIG> and jwt BASE_JWT with additional attributes
      | key                     | value             |
      | requesttypedescriptions | <REQUEST_TYPE_TC> |
    And User opens example page
    When User fills payment form with defined card <CARD>
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key           | value                                   |
      | errormessage  | Payment has been successfully processed |
      | baseamount    | 1000                                    |
      | currencyiso3a | GBP                                     |
      | errorcode     | 0                                       |

    Examples:
      | E2E_CONFIG                    | REQUEST_TYPE_TC | CARD              |
      | SUBMIT_ON_SUCCESS_ONLY_CONFIG | ACCOUNTCHECK    | VISA_FRICTIONLESS |
      | SUBMIT_ON_SUCCESS_ONLY_CONFIG | AUTH            | VISA_FRICTIONLESS |


  Scenario Outline: Successful payment with single requestTypes <REQUEST_TYPE_TC>
    Given JS library configured by inline params <E2E_CONFIG> and jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <REQUEST_TYPE_TC>> |
    And User opens example page
    When User fills payment form with defined card <CARD>
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key          | value                                   |
      | errormessage | Payment has been successfully processed |
      | errorcode    | 0                                       |

    Examples:
      | E2E_CONFIG                    | REQUEST_TYPE_TC | CARD              |
      | SUBMIT_ON_SUCCESS_ONLY_CONFIG | RISKDEC         | VISA_FRICTIONLESS |
      | SUBMIT_ON_SUCCESS_ONLY_CONFIG | THREEDQUERY     | MASTERCARD_CARD   |
