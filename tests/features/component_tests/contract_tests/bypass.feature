Feature: Bypass Cards config - validation of requests send

  As a user
  I want to use card payments method with bypass config
  In order to check payment functionality

  Background:
    Given JavaScript configuration is set for scenario based on scenario's @config tag
    And User opens mock payment page

  @config_bypass_cards
  Scenario Outline: Card payment with Bypass
    When User fills payment form with defined card VISA_CARD
    And User clicks Pay button - <request_types> response is set to "OK"
    Then User will see notification frame text: "Payment has been successfully processed"
    And <request_types> ware sent only once in one request

    Examples:
      | request_types                              |
      | THREEDQUERY AUTH                           |
      | THREEDQUERY                                |
      | THREEDQUERY AUTH RISKDEC                   |
      | ACCOUNTCHECK THREEDQUERY AUTH              |
      | RISKDEC ACCOUNTCHECK THREEDQUERY AUTH      |
      | ACCOUNTCHECK THREEDQUERY AUTH SUBSCRIPTION |
      | THREEDQUERY, ACCOUNTCHECK, RISKDEC, AUTH   |
