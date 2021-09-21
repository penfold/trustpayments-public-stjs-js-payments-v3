Feature: E2E Card Payments with request types in config

  As a user
  I want to use card payments method with request types config
  In order to check full payment functionality

  Scenario: Successful payment with config's requestTypes param having values in valid order
    Given JS library configured by inline params REQUEST_TYPE_ACC_TDQ_AUTH_RISK_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value                         |
      | requesttypedescriptions | ACCOUNTCHECK THREEDQUERY AUTH |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_CARD
    And User clicks Pay button
    And User waits for payment to be processed
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And "submit" callback is called only once
    And "success" callback is called only once


  Scenario: Unsuccessful payment with config's requestTypes param having values in invalid order
    Given JS library configured by inline params REQUEST_TYPES_CONFIG_INVALID_ORDER and jwt BASE_JWT with additional attributes
      | key                     | value                                 |
      | requesttypedescriptions | RISKDEC ACCOUNTCHECK AUTH THREEDQUERY |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_CARD
    And User clicks Pay button
    Then User will see notification frame text: "Invalid field"
    And User will see that notification frame has "red" color


  Scenario: Successful payment with config's requestTypes: ACCOUNTCHECK, TDQ, AUTH, SUBSCRIPTION
    Given JS library configured by inline params REQUEST_TYPE_ACHECK_TDQ_AUTH_SUB_CONFIG and jwt JWT_WITH_SUBSCRIPTION with additional attributes
      | key                     | value                                      |
      | requesttypedescriptions | ACCOUNTCHECK THREEDQUERY AUTH SUBSCRIPTION |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_CARD
    And User clicks Pay button
    And User waits for payment to be processed
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
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
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | 1000                                    |
      | currencyiso3a        | GBP                                     |
      | errorcode            | 0                                       |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | settlestatus         | 0                                       |

    Examples:
      | E2E_CONFIG                    | REQUEST_TYPE_TC | CARD              |
      | SUBMIT_ON_SUCCESS_ONLY_CONFIG | ACCOUNTCHECK    | VISA_V21_FRICTIONLESS |
      | SUBMIT_ON_SUCCESS_ONLY_CONFIG | AUTH            | VISA_V21_FRICTIONLESS |


  Scenario: Successful payment with single requestTypes RISKDEC
    Given JS library configured by inline params SUBMIT_ON_SUCCESS_ONLY_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value   |
      | requesttypedescriptions | RISKDEC |
    And User opens example page
    When User fills payment form with defined card VISA_V21_FRICTIONLESS
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | errorcode            | 0                                       |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |

  @bypass_property
  Scenario Outline: unsuccessful payment with THREEDQUERY as only request type and bypass set to used card
    Given JS library configured by inline params REQUEST_TYPE_ACC_TDQ_AUTH_RISK_CONFIG and jwt BASE_JWT with additional attributes
      | key                      | value           |
      | requesttypedescriptions  | THREEDQUERY     |
      | threedbypasspaymenttypes | VISA MASTERCARD |
    And User opens example page
    When User fills payment form with defined card <card_type>
    And User clicks Pay button
    Then User will see notification frame text: "Bypass"

    Examples:
      | card_type             |
      | MASTERCARD_CARD       |
      | VISA_V21_NON_FRICTIONLESS |

  @bypass_property
  Scenario Outline: successful payment with  request types <request_types>, bypass and submit on success and failed Subscription request - frictionless
    Given JS library configured by inline params SUBMIT_ON_SUCCESS_ONLY_CONFIG and jwt JWT_WITH_SUBSCRIPTION with additional attributes
      | key                      | value           |
      | requesttypedescriptions  | <request_types> |
      | threedbypasspaymenttypes | VISA MASTERCARD |
      | currencyiso3a            | JPY             |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_CARD
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key          | value                                   |
      | errormessage | Payment has been successfully processed |
      | errorcode    | 0                                       |

    Examples:
      | request_types                  |
      | THREEDQUERY AUTH SUBSCRIPTION  |
      | ACCOUNTCHECK AUTH SUBSCRIPTION |