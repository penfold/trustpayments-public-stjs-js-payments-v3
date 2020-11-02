Feature: E2E Card Payments with request types in config

  As a user
  I want to use card payments method with request types config
  In order to check full payment functionality

  @reactJS
  @angular
  @vueJS
  @react_native
  Scenario: Successful payment with config's requestTypes param having values in valid order
    Given JS library is configured with REQUEST_TYPE_ACC_TDQ_AUTH_RISK_CONFIG and BASE_JWT
    And User opens example page
    When User fills payment form with defined card MASTERCARD_CARD
    And User clicks Pay button
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And "submit" callback is called only once
    And "success" callback is called only once

  @e2e_config_requesttypes_invalid_order
  Scenario: Unsuccessful payment with config's requestTypes param having values in invalid order
    Given JS library is configured with REQUEST_TYPES_CONFIG_INVALID_ORDER and BASE_JWT
    And User opens example page
    When User fills payment form with defined card MASTERCARD_CARD
    And User clicks Pay button
    Then User will see payment status information: "Invalid field"
    And User will see that notification frame has "red" color

  @reactJS
  @angular
  @vueJS
  @react_native
  Scenario: Successful payment with config's requestTypes ACCOUNTCHECK, TDQ, AUTH, SUBSCRIPTION
    Given JS library is configured with REQUEST_TYPE_ACHECK_TDQ_AUTH_SUB_CONFIG and JWT_WITH_SUBSCRIPTION
    And User opens example page
    When User fills payment form with defined card MASTERCARD_CARD
    And User clicks Pay button
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And "submit" callback is called only once
    And "success" callback is called only once

  Scenario: Successful payment with bypassCard and requestTpes: RISKDEC, ACCOUNTCHECK,THREEDQUERY, AUTH
    Given JS library is configured with BYPASS_MASTERCARD_REQUEST_TYPE_CONFIG and BASE_JWT
    And User opens example page
    When User fills payment form with defined card MASTERCARD_SUCCESSFUL_AUTH_CARD
    And User clicks Pay button
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And "submit" callback is called only once
    And "success" callback is called only once

  Scenario: Successful step up payment with defer init and requestTypes ACCOUNTCHECK, TDQ
    Given JS library is configured with REQUEST_TYPE_ACHECK_TDQ_WITH_DEFER_INIT and BASE_JWT
    And User opens example page
    When User fills payment form with defined card VISA_NON_FRICTIONLESS
    And User clicks Pay button
    And User fills V2 authentication modal
    Then User will see payment status information: "Payment has been successfully processed"
    And "submit" callback is called only once
    And "success" callback is called only once

  Scenario: Successful frictionless payment with defer init and requestTypes ACCOUNTCHECK, TDQ
    Given JS library is configured with REQUEST_TYPE_ACHECK_TDQ_WITH_DEFER_INIT and BASE_JWT
    And User opens example page
    When User fills payment form with defined card VISA_FRICTIONLESS
    And User clicks Pay button
    Then User will see payment status information: "Payment has been successfully processed"
    And "submit" callback is called only once
    And "success" callback is called only once


  Scenario Outline: Successful payment with single requestTypes <REQUEST_TYPE_TC>
    Given JS library is configured with <E2E_CONFIG> and BASE_JWT
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
      | E2E_CONFIG                 | REQUEST_TYPE_TC | CARD              |
      | REQUEST_TYPE_ACHECK_CONFIG | ACCOUNTCHECK    | VISA_FRICTIONLESS |
      | REQUEST_TYPE_AUTH_CONFIG   | AUTH            | VISA_FRICTIONLESS |


  Scenario Outline: Successful payment with single requestTypes <REQUEST_TYPE_TC>
    Given JS library is configured with <E2E_CONFIG> and BASE_JWT
    And User opens example page
    When User fills payment form with defined card <CARD>
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key          | value                                   |
      | errormessage | Payment has been successfully processed |
      | errorcode    | 0                                       |

    Examples:
      | E2E_CONFIG               | REQUEST_TYPE_TC | CARD              |
      | REQUEST_TYPE_RISK_CONFIG | RISKDEC         | VISA_FRICTIONLESS |
      | REQUEST_TYPE_TDQ_CONFIG  | THREEDQUERY     | MASTERCARD_CARD   |


  Scenario: Successful payment with single requestTypes: CACHETOKENISE
    Given JS library is configured with REQUEST_TYPE_CACHETOKENISE and BASE_JWT
    And User opens example page
    When User fills payment form with defined card VISA_FRICTIONLESS
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key        | value              |
      | cachetoken | should not be none |
      | jwt        | should not be none |

  Scenario: Error payment with single requestTypes: CACHETOKENISE
    Given JS library is configured with REQUEST_TYPE_CACHETOKENISE_SUBMIT_ON_ERROR and BASE_JWT
    And User opens example page
    When User fills payment form with defined card VISA_DECLINED_CARD
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key        | value              |
      | cachetoken | should not be none |
      | jwt        | should not be none |

  Scenario: Error payment with invalid combination of requestTypes: CACHETOKENISE, TDQ, AUTH
    Given JS library is configured with INVALID_REQUEST_TYPE_CACHETOKENISE_TDQ_AUTH and BASE_JWT
    And User opens example page
    When User fills payment form with defined card VISA_NON_FRICTIONLESS
    And User clicks Pay button
    Then User will see payment status information: "Invalid field"



