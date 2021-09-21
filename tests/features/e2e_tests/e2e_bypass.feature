@bypass
Feature: E2E Card Payments with bypass
  As a user
  I want to use card payments method
  In order to check full payment functionality


  Scenario Outline: Bypass Cards - Successful payment by <card_type> without 3d secure
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                      | value                                    |
      | requesttypedescriptions  | THREEDQUERY AUTH                         |
      | threedbypasspaymenttypes | VISA AMEX MASTERCARD DISCOVER JCB DINERS |
    And User opens example page
    When User fills payment form with defined card <card>
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |

    Examples:
      | card            |
      | VISA_CARD       |
      | AMEX_CARD       |
      | DISCOVER_CARD   |
      | JCB_CARD        |
      | MASTERCARD_CARD |
      | DINERS_CARD     |


  Scenario: Successful payment with bypassCard using MASTERCARD_SUCCESSFUL_AUTH_CARD card with 3d secure
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                      | value                                 |
      | requesttypedescriptions  | RISKDEC ACCOUNTCHECK THREEDQUERY AUTH |
      | threedbypasspaymenttypes | MASTERCARD                            |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_SUCCESSFUL_AUTH_CARD
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |


  Scenario Outline: Successful payment with bypassCard and request types: <request_types>
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                      | value                                 |
      | requesttypedescriptions  | <request_types>                       |
      | threedbypasspaymenttypes | VISA AMEX DISCOVER JCB DINERS MAESTRO |
    And User opens example page
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |
      | THREEDQUERY ACCOUNTCHECK |



  Scenario: Unsuccessful payment with bypassCard and request types: THREEDQUERY
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                      | value       |
      | requesttypedescriptions  | THREEDQUERY |
      | threedbypasspaymenttypes | VISA        |
    And User opens example page
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    Then User will see notification frame text: "Bypass"
    And User will see that notification frame has "red" color
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | error         |


  Scenario: Unsuccessful payment with bypassCard using Mastercard - invalid expiration date
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                      | value                                 |
      | requesttypedescriptions  | RISKDEC ACCOUNTCHECK THREEDQUERY AUTH |
      | threedbypasspaymenttypes | MASTERCARD                            |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_INVALID_EXP_DATE_CARD
    And User clicks Pay button
    Then User will see notification frame text: "Invalid field"
    And User will see that notification frame has "red" color
    And User will see that "EXPIRATION_DATE" field is highlighted
    And User will see "Invalid field" message under field: "EXPIRATION_DATE"


  Scenario: Unsuccessful payment with bypassCard using Maestro - lack of secure code
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                      | value                                 |
      | requesttypedescriptions  | THREEDQUERY AUTH                      |
      | threedbypasspaymenttypes | VISA AMEX DISCOVER JCB DINERS MAESTRO |
    And User opens example page
    When User fills payment form with defined card MAESTRO_CARD
    And User clicks Pay button
    Then User will see notification frame text: "Maestro must use SecureCode"
    And User will see that notification frame has "red" color
