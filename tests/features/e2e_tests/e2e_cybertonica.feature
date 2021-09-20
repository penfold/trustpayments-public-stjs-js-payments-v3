Feature: E2E Cybertonica

  As a user
  I want to use card payments method with cybertonica config
  In order to check full payment functionality


  Scenario: Cybertonica - successful payment with Mastercard non-frictionless
    Given JS library configured by inline params CYBERTONICA_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_SUCCESSFUL_AUTH_CARD
    And User clicks Pay button
    And User fills V1 authentication modal
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |

  Scenario: Cybertonica - successful payment with Visa non-frictionless
    Given JS library configured by inline params CYBERTONICA_CONFIG and jwt BASE_JWT with additional attributes
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
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |

  @bypass_property
  Scenario: Cybertonica - successful payment with bypass_pass
    Given JS library configured by inline params CYBERTONICA_CONFIG and jwt BASE_JWT with additional attributes
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


  Scenario: Cybertonica - successful payment with startOnLoad
    Given JS library configured by inline params CYBERTONICA_START_ON_LOAD_CONFIG and jwt JWT_WITH_NON_FRICTIONLESS_CARD with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page WITHOUT_SUBMIT_BUTTON
    And User fills V2 authentication modal
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |
