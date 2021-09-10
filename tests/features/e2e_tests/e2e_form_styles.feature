Feature: Payment form styles check

  As a user
  I want to use card payments method
  In order to check full payment functionality with proper UI styling


  Scenario: Verify style of individual fields
    Given JS library configured by inline params STYLES_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    When User opens example page
    And User waits for whole form to be loaded
    Then User will see that "CARD_NUMBER" field has correct style
    And User will see that "EXPIRATION_DATE" field has correct style

  Scenario: Verify style of notification frame
    Given JS library configured by inline params STYLES_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_SUCCESSFUL_FRICTIONLESS_AUTH
    And User clicks Pay button
    Then User will see that "NOTIFICATION_FRAME" field has correct style

  Scenario: Verify placeholders in input fields
    Given JS library configured by inline params PLACEHOLDERS_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    When User opens example page
    Then User will see specific placeholders in input fields: Number, Expiration, CVV

  Scenario: Verify default placeholders in input fields
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    When User opens example page
    Then User will see default placeholders in input fields: **** **** **** ****, MM/YY, ***

  Scenario: Verify default cvv placeholder for AMEX card
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User fills payment form with credit card number "340000000000611", expiration date "12/23"
    Then User will see "****" placeholder in security code field

