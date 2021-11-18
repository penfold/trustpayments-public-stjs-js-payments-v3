Feature: E2E SEON

  As a user
  I want to use card payments method with seon
  In order to check full payment functionality


  Scenario Outline: SEON - successful payment (non-frictionless)
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User fills payment form with defined card <card>
    And User clicks Pay button
    And User fills <threeds_ver> authentication modal
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |

    Examples:
      | threeds_ver | card                            |
      | V1          | MASTERCARD_SUCCESSFUL_AUTH_CARD |
      | V2          | VISA_V21_NON_FRICTIONLESS       |


  Scenario: SEON - successful payment with bypass
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                      | value                         |
      | requesttypedescriptions  | THREEDQUERY AUTH              |
      | threedbypasspaymenttypes | VISA AMEX DISCOVER JCB DINERS |
    And User opens example page
    When User fills payment form with defined card VISA_CARD
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |


  Scenario: SEON - successful payment with startOnLoad
    Given JS library configured by inline params START_ON_LOAD_CONFIG and jwt JWT_WITH_NON_FRICTIONLESS_CARD with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page WITHOUT_SUBMIT_BUTTON
    And User fills V2 authentication modal
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |


  Scenario: SEON - successful payment on example page with enabled Content Security Policy
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page WITH_CSP
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    And User fills V2 authentication modal
    Then User will see notification frame text: "Payment has been successfully processed"


  Scenario: SEON - verify if getFraudControlData function returns seon object
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page WITH_SEON_OBJECT
    And User waits for Pay button to be active
    Then User will see SEON object in textbox


  Scenario: SEON - successful payment with deprecated 'cybertonicaApiKey' in config
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key               | value |
      | cybertonicaApiKey |       |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    And User fills V2 authentication modal
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |


  Scenario: SEON - successful payment with fraudcontroltransactionid in jwt payload
    Given JS library configured by inline params BASIC_CONFIG and jwt JWT_WITH_FRAUD_CONTROL with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page WITH_CSP
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    And User fills V2 authentication modal
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |
