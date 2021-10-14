@fields_validation
Feature: Payment form validations

  As a user
  I want to use card payments method
  In order to check payment form validations


  Scenario: "Field is required" fields validation for empty form submit
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    And User waits for form inputs to be loaded
    When User clicks Pay button
    Then User will see validation message "Field is required" under all fields
    And User will see that all fields are highlighted


  Scenario: "Field is required" fields validation for only Security code field enabled
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key            | value        |
      | fieldsToSubmit | securitycode |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User clicks Pay button
    Then User will see "Field is required" message under field: "SECURITY_CODE"
    And User will see that "SECURITY_CODE" field is highlighted


  Scenario Outline: Frontend validation <validation_error> for <field> field
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    And User waits for form inputs to be loaded
    When User fills payment form with credit card number "<card_number>", expiration date "<expiration_date>" and cvv "<cvv>"
    And User clicks Pay button
    Then User will see "<validation_error>" message under field: "<field>"
    And User will see that "<field>" field is highlighted

    Examples:
      | card_number      | expiration_date | cvv  | field           | validation_error       |
      | None             | 12/22           | 123  | CARD_NUMBER     | Field is required      |
      | 4000000000001000 | None            | 123  | EXPIRATION_DATE | Field is required      |
      | 4000000000001000 | 12/22           | None | SECURITY_CODE   | Field is required      |
      | 4000000000001000 | 12/22           | 12   | SECURITY_CODE   | Value mismatch pattern |
      | 40000000         | 12/22           | 123  | CARD_NUMBER     | Value mismatch pattern |
      | 4000000000001000 | 12              | 123  | EXPIRATION_DATE | Value mismatch pattern |
      | 4000000000009999 | 12/22           | 123  | CARD_NUMBER     | Value mismatch pattern |
      | 4000000000001000 | 44/22           | 123  | EXPIRATION_DATE | Value mismatch pattern |


  Scenario: Frontend validation "Value mismatch pattern" for 3-number of cvv code AMEX card
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User fills payment form with credit card number "340000000000611", expiration date "12/22" and cvv "123"
    And User clicks Pay button
    Then User will see "Value mismatch pattern" message under field: "SECURITY_CODE"


  Scenario Outline: Backend validation "Invalid field"
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User fills payment form with credit card number "<card_number>", expiration date "<expiration_date>" and cvv "<cvv>"
    And User clicks Pay button
    Then User will see notification frame text: "Invalid field"
    And User will see that notification frame has "red" color
    And User will see "Invalid field" message under field: "<field>"
    And User will see that "<field>" field is highlighted

    Examples:
      | card_number      | expiration_date | cvv | field           |
      | 4000000000001000 | 12/15           | 123 | EXPIRATION_DATE |


  Scenario: App is embedded in another iframe - fields validation test
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page IN_IFRAME
    When User clicks Pay button
    Then User will see validation message "Field is required" under all fields
    And User will see that all fields are highlighted
