Feature: Bypass Cards config - validation of requests send
  As a user
  I want to use card payments method with bypass config
  In order to check payment functionality

  Background:

    Given JavaScript configuration is set for scenario based on scenario's @config tag
    And User opens mock payment page

  @<tag>
  Scenario Outline: Card payment with Bypass
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button - <request_types> response is set to "OK"
    Then User will see notification frame text: "<payment_status>"
    And User will see that notification frame has "<color>" color
    And <request_types> ware sent only once in one request
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | <callback>    |

    Examples:
      | request_types                                 | payment_status                          | color | callback | tag                                         |
      | THREEDQUERY                                   | Bypass                                  | red   | error    | config_bypass_cards_tdq                     |
      | THREEDQUERY, AUTH, RISKDEC                    | Payment has been successfully processed | green | success  | config_bypass_cards_tdq_auth_riskdec        |
      | ACCOUNTCHECK, THREEDQUERY, AUTH               | Payment has been successfully processed | green | success  | config_bypass_cards_acheck_tdq_auth         |
      | RISKDEC, ACCOUNTCHECK, THREEDQUERY, AUTH      | Payment has been successfully processed | green | success  | config_bypass_cards_riskdec_acheck_tdq_auth |
      | ACCOUNTCHECK, THREEDQUERY, AUTH, SUBSCRIPTION | Payment has been successfully processed | green | success  | config_bypass_cards_acheck_tdq_auth_sub     |
      | THREEDQUERY, ACCOUNTCHECK, RISKDEC, AUTH      | Invalid field                           | red   | error    | config_bypass_cards_tdq_acheck_riskdec_auth |


