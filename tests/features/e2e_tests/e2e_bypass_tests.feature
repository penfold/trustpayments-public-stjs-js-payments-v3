Feature: E2E Card Payments with bypass
  As a user
  I want to use card payments method
  In order to check full payment functionality

  @e2e_config_bypass_mastercard
  @bypass_property
  Scenario: Successful payment with bypassCard using Mastercard
    Given JS library configured by inline params BYPASS_MASTERCARD_CONFIG and jwt BASE_JWT with additional attributes
      | key                      | value                                 |
      | requesttypedescriptions  | RISKDEC ACCOUNTCHECK THREEDQUERY AUTH |
      | threedbypasspaymenttypes | MASTERCARD                            |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_SUCCESSFUL_AUTH_CARD
    And User clicks Pay button
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color

  @e2e_smoke_test
  @e2e_config_for_bypass_cards
  @bypass_property
  Scenario: Successful payment bypass cards without 3d secure
    Given JS library configured by inline params BYPASS_CARDS_CONFIG and jwt BASE_JWT with additional attributes
      | key                      | value                                 |
      | requesttypedescriptions  | THREEDQUERY AUTH                      |
      | threedbypasspaymenttypes | VISA AMEX DISCOVER JCB DINERS MAESTRO |
    And User opens example page
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color

  @e2e_config_for_bypass_cards
  @bypass_property
  Scenario: Successful payment bypass cards with 3d secure
    Given JS library configured by inline params BYPASS_CARDS_CONFIG and jwt BASE_JWT with additional attributes
      | key                      | value                                 |
      | requesttypedescriptions  | THREEDQUERY AUTH                      |
      | threedbypasspaymenttypes | VISA AMEX DISCOVER JCB DINERS MAESTRO |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_SUCCESSFUL_AUTH_CARD
    And User clicks Pay button
    And User fills V1 authentication modal
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color

  @e2e_config_bypass_mastercard
  @bypass_property
  Scenario: Unsuccessful payment with bypassCard using Mastercard - invalid expiration date
    Given JS library configured by inline params BYPASS_MASTERCARD_CONFIG and jwt BASE_JWT with additional attributes
      | key                      | value                                 |
      | requesttypedescriptions  | RISKDEC ACCOUNTCHECK THREEDQUERY AUTH |
      | threedbypasspaymenttypes | MASTERCARD                            |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_INVALID_EXP_DATE_CARD
    And User clicks Pay button
    Then User will see payment status information: "Invalid field"
    And User will see that notification frame has "red" color
    And User will see that "EXPIRATION_DATE" field is highlighted
    And User will see "Invalid field" message under field: "EXPIRATION_DATE"

  @e2e_config_bypass_maestro
  @bypass_property
  Scenario: Unsuccessful payment with bypassCard using Maestro - lack of secure code
    Given JS library configured by inline params BYPASS_CARDS_CONFIG and jwt BASE_JWT with additional attributes
      | key                      | value                                 |
      | requesttypedescriptions  | THREEDQUERY AUTH                      |
      | threedbypasspaymenttypes | VISA AMEX DISCOVER JCB DINERS MAESTRO |
    And User opens example page
    When User fills payment form with defined card MAESTRO_CARD
    And User clicks Pay button
    Then User will see payment status information: "Maestro must use SecureCode"
    And User will see that notification frame has "red" color
