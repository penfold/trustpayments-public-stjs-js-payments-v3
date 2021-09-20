Feature: Retests for bugs

  Scenario: Successful payment and focus on the card number field - all fields remains disabled
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value                         |
      | requesttypedescriptions | THREEDQUERY AUTH              |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_CARD
    And User clicks Pay button
    And User focuses on "CARD_NUMBER" field
    Then User will see that ALL input fields are "disabled"
