Feature: Tokenisation

  As a user
  I want to use card payments method with tokenisation config
  In order to check full payment functionality

  @submit_cvv_only
  Scenario: Tokenisation - successful payment by VISA card
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key            | value        |
      | fieldsToSubmit | securitycode |
    And JS library authenticated by jwt JWT_VISA_NON_FRICTIONLESS_PARENT_TRANSACTION with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And Challenge card payment mock responses are set as JSINIT_TOKENISATION_VISA and payment status SUCCESS
    And ACS mock response is set to "OK"
    And User opens example page
    When User fills "SECURITY_CODE" field "123"
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And THREEDQUERY, AUTH ware sent only once in one request

  @submit_cvv_only
  Scenario: tokenization - Amex Frictionless
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key            | value        |
      | fieldsToSubmit | securitycode |
    And JS library authenticated by jwt JWT_AMEX_NON_FRICTIONLESS_PARENT_TRANSACTION with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And Frictionless card payment mock responses are set as JSINIT_TOKENISATION_AMEX and payment status SUCCESS
    And User opens example page
    When User fills "SECURITY_CODE" field "1234"
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"

  @submit_cvv_only
  Scenario: tokenization - Amex Non-Frictionless
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key            | value        |
      | fieldsToSubmit | securitycode |
    And JS library authenticated by jwt JWT_AMEX_NON_FRICTIONLESS_PARENT_TRANSACTION with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And Challenge card payment mock responses are set as JSINIT_TOKENISATION_AMEX and payment status SUCCESS
    And ACS mock response is set to "OK"
    And User opens example page
    When User fills "SECURITY_CODE" field "1234"
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And AUTH request was sent only once

  @submit_cvv_only
  Scenario: Tokenisation and bypassCard - successful payment by VISA card
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key            | value        |
      | fieldsToSubmit | securitycode |
    And JS library authenticated by jwt JWT_VISA_NON_FRICTIONLESS_PARENT_TRANSACTION with additional attributes
      | key                      | value                    |
      | requesttypedescriptions  | THREEDQUERY AUTH RISKDEC |
      | threedbypasspaymenttypes | VISA MASTERCARD          |
    And Challenge card payment mock responses are set as JSINIT_TOKENISATION_BYPASS_VISA and payment status SUCCESS
    And ACS mock response is set to "OK"
    And User opens example page
    When User fills "SECURITY_CODE" field "123"
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And THREEDQUERY, AUTH ware sent only once in one request

  @submit_cvv_only
  Scenario: Tokenisation - successful payment by VISA with request types: RISKDEC, ACCOUNTCHECK, TDQ, AUTH
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key            | value        |
      | fieldsToSubmit | securitycode |
    And JS library authenticated by jwt JWT_VISA_NON_FRICTIONLESS_PARENT_TRANSACTION with additional attributes
      | key                     | value                                   |
      | requesttypedescriptions | RISKDEC ACCOUNTCHECK THREEDQUERY AUTH |
    And Card payment mock responses are set as JSINIT_TOKENISATION_VISA and request type RISKDEC, ACCOUNTCHECK, THREEDQUERY, AUTH
    And Step up AUTH response is set to OK
    And ACS mock response is set to "OK"
    And User opens example page
    When User fills "SECURITY_CODE" field "123"
    And ACS mock response is set to "OK"
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And AUTH request was sent only once
