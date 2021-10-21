Feature: Bypass Cards config - validation of requests send
  As a user
  I want to use card payments method with bypass config
  In order to check payment functionality

  @bypass
  Scenario Outline: Card payment with Bypass
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                      | value                                    |
      | requesttypedescriptions  | THREEDQUERY AUTH                         |
      | threedbypasspaymenttypes | VISA AMEX MASTERCARD DISCOVER JCB DINERS |
    And Card payment mock responses are set as <jsinit_response> and request type <request_types>
    And User opens example page
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    Then User will see notification frame text: "<payment_status>"
    And User will see that notification frame has "<color>" color
    And <request_types> ware sent only once in one request
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | <callback>    |

    Examples:
      | request_types                                 | payment_status                          | color | callback | jsinit_response                       |
      | THREEDQUERY                                   | Bypass                                  | red   | error    | JSINIT_BYPASS_TDQ                     |
      | THREEDQUERY, AUTH, RISKDEC                    | Payment has been successfully processed | green | success  | JSINIT_BYPASS_TDQ_AUTH_RISKDEC        |
      | ACCOUNTCHECK, THREEDQUERY, AUTH               | Payment has been successfully processed | green | success  | JSINIT_BYPASS_ACHECK_TDQ_AUTH         |
      | RISKDEC, ACCOUNTCHECK, THREEDQUERY, AUTH      | Payment has been successfully processed | green | success  | JSINIT_BYPASS_RISKDEC_ACHECK_TDQ_AUTH |
      | ACCOUNTCHECK, THREEDQUERY, AUTH, SUBSCRIPTION | Payment has been successfully processed | green | success  | JSINIT_BYPASS_ACHECK_TDQ_AUTH_SUB     |
      | THREEDQUERY, ACCOUNTCHECK, RISKDEC, AUTH      | Invalid field                           | red   | error    | JSINIT_BYPASS_TDQ_ACHECK_RISKDEC_SUB  |


