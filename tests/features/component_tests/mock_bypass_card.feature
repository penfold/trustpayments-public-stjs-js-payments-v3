Feature: Bypass Cards config

  As a user
  I want to use card payments method with bypass config
  In order to check payment functionality

  Background:
    Given JavaScript configuration is set for scenario based on scenario's @config tag
    And User opens mock payment page

  @config_bypass_cards
  Scenario Outline: Bypass Cards - Successful payment by <card_type>
    When User fills payment form with defined card <card>
    And User clicks Pay button - THREEDQUERY, AUTH response is set to "OK"
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And THREEDQUERY, AUTH ware sent only once in one request
    And "submit" callback is called only once
    And "success" callback is called only once

    Examples:
      | card            |
      | VISA_CARD       |
      | AMEX_CARD       |
      | DISCOVER_CARD   |
      | JCB_CARD        |
      | MAESTRO_CARD    |
      | MASTERCARD_CARD |
      | DINERS_CARD     |

  @config_bypass_cards @submit_without_cvv
  Scenario: Bypass Cards - Successful payment by PIBA
    When User fills payment form with credit card number "3089500000000000021", expiration date "12/23"
    And User clicks Pay button - THREEDQUERY, AUTH response is set to "OK"
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And THREEDQUERY, AUTH ware sent only once in one request
    And "submit" callback is called only once
    And "success" callback is called only once

  @config_bypass_cards_auth
  Scenario: Successful payment with bypassCard and request types: AUTH
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button - THREEDQUERY, AUTH response is set to "OK"
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And THREEDQUERY, AUTH ware sent only once in one request
    And "submit" callback is called only once
    And "success" callback is called only once

  @config_bypass_cards_tdq
  Scenario: Successful payment with bypassCard and request types: THREEDQUERY
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button - THREEDQUERY response is set to "ERROR"
    Then User will see payment status information: "Bypass"
    And User will see that notification frame has "red" color
    And THREEDQUERY ware sent only once in one request
    And "submit" callback is called only once
    And "error" callback is called only once

  @config_bypass_cards_tdq_auth_riskdec
  Scenario: Successful payment with bypassCard and custom request types: THREEDQUERY, AUTH, RISKDEC
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button - THREEDQUERY, AUTH, RISKDEC response is set to "OK"
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And THREEDQUERY, AUTH, RISKDEC ware sent only once in one request
    And "submit" callback is called only once
    And "success" callback is called only once

  @config_bypass_cards_acheck_tdq_auth
  Scenario: Successful payment with bypassCard and custom request types: ACCOUNTCHECK, THREEDQUERY, AUTH
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button - ACCOUNTCHECK, THREEDQUERY, AUTH response is set to "OK"
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And ACCOUNTCHECK, THREEDQUERY, AUTH ware sent only once in one request
    And "submit" callback is called only once
    And "success" callback is called only once

  @config_bypass_cards
  Scenario: Successful payment with bypassCard and  request types: THREEDQUERY, AUTH
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button - THREEDQUERY, AUTH response is set to "OK"
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And THREEDQUERY, AUTH ware sent only once in one request
    And "submit" callback is called only once
    And "success" callback is called only once

  @config_bypass_cards_riskdec_acheck_tdq_auth
  Scenario: Successful payment with bypassCard and custom request types: RISKDEC, ACCOUNTCHECK, THREEDQUERY, AUTH
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button - RISKDEC, ACCOUNTCHECK, THREEDQUERY, AUTH response is set to "OK"
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And RISKDEC, ACCOUNTCHECK, THREEDQUERY, AUTH ware sent only once in one request
    And "submit" callback is called only once
    And "success" callback is called only once

  @config_bypass_cards_acheck_tdq_auth_sub
  Scenario: Successful payment with bypassCard and custom request types: ACCOUNTCHECK, THREEDQUERY, AUTH, SUBSCRIPTION
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button - ACCOUNTCHECK, THREEDQUERY, AUTH, SUBSCRIPTION response is set to "OK"
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And ACCOUNTCHECK, THREEDQUERY, AUTH, SUBSCRIPTION ware sent only once in one request
    And "submit" callback is called only once
    And "success" callback is called only once

  @config_bypass_cards_tdq_acheck_riskdec_auth
  Scenario: Invalid payment with bypassCard and custom request types: THREEDQUERY, ACCOUNTCHECK, RISKDEC, AUTH
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button - THREEDQUERY, ACCOUNTCHECK, RISKDEC, AUTH response is set to "INVALID_FIELD"
    Then User will see payment status information: "Invalid field"
    And User will see that notification frame has "red" color
    And THREEDQUERY, ACCOUNTCHECK, RISKDEC, AUTH ware sent only once in one request
    And "submit" callback is called only once
    And "error" callback is called only once

