Feature: E2E Card Payments - ignoreJsInitErrors
  As a merchant
  I would like to choose if I want to ignore callbacks after JSINIT or not,
  by setting new property in config - ignoreJsInitErrors


  Scenario: Invalid JS Library configuration with SubmitOnError enabled - wrong account type description in jwt
    Given JS library configured by inline params SUBMIT_ON_ERROR_CONFIG_WITH_IGNORE_JS_INIT_ERRORS and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
      | accounttypedescription  | XYZ              |
    When User opens example page
    And User waits for whole form to be displayed
    Then User will not see notification frame
    And User will not see following callback types
      | callback_type |
      | submit        |
      | error         |
    And User remains on checkout page


  Scenario: Invalid JS Library configuration with SubmitOnError enabled - wrong currency type in jwt
    Given JS library configured by inline params SUBMIT_ON_ERROR_CONFIG_WITH_IGNORE_JS_INIT_ERRORS and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
      | currencyiso3a           | GBS              |
    When User opens example page
    And User waits for whole form to be displayed
    Then User will not see notification frame
    And User will not see following callback types
      | callback_type |
      | submit        |
      | error         |
    And User remains on checkout page


  Scenario: Invalid JS Library configuration with SubmitOnError enabled - wrong site reference in jwt
    Given JS library configured by inline params SUBMIT_ON_ERROR_CONFIG_WITH_IGNORE_JS_INIT_ERRORS and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
      | sitereference           | test             |
    When User opens example page
    And User waits for whole form to be displayed
    Then User will not see notification frame
    And User will not see following callback types
      | callback_type |
      | submit        |
      | error         |
    And User remains on checkout page


  Scenario: Invalid JS Library configuration with SubmitOnError enabled - wrong locale in jwt
    Given JS library configured by inline params SUBMIT_ON_ERROR_CONFIG_WITH_IGNORE_JS_INIT_ERRORS and jwt INVALID_JWT with additional attributes
      | key                      | value            |
      | requesttypedescriptions  | THREEDQUERY AUTH |
      | threedbypasspaymenttypes | MASTERCARD       |
    When User opens example page
    And User waits for whole form to be displayed
    Then User will not see notification frame
    And User will not see following callback types
      | callback_type |
      | submit        |
      | error         |
    And User remains on checkout page


  Scenario: Invalid JS Library configuration with SubmitOnError disabled - wrong locale in jwt
    Given JS library configured by inline params BASIC_CONFIG_WITH_IGNORE_JS_INIT_ERRORS and jwt INVALID_JWT with additional attributes
      | key                      | value            |
      | requesttypedescriptions  | THREEDQUERY AUTH |
      | threedbypasspaymenttypes | MASTERCARD       |
    When User opens example page
    And User waits for whole form to be displayed
    Then User will not see notification frame
    And User will not see following callback types
      | callback_type |
      | submit        |
      | error         |
    And User remains on checkout page

