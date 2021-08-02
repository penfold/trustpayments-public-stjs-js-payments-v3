Feature: Retests for bugs

  #STJS-1657
  Scenario: Successful payment and focus on the card number field - all fields remains disabled
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value                         |
      | requesttypedescriptions | THREEDQUERY AUTH              |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_CARD
    And User clicks Pay button
    And User focuses on "CARD_NUMBER" field
    Then User will see that ALL input fields are "disabled"


  #STJS-1657
  Scenario: Replace the PIBA card number to any other card type - security code becomes enable
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value                         |
      | requesttypedescriptions | THREEDQUERY AUTH              |
    And User opens example page
    When User fills payment form with credit card number "3089500000000000021", expiration date "12/23"
    And User replaces value of the card number field to "340000000000611"
    Then User will see that SECURITY_CODE input field is "enabled"
