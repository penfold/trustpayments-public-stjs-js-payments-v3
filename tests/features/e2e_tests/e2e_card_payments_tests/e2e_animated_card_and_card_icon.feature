Feature: Payments Card recognition
  As a user
  I want to use card payments method
  In order to check that card is properly recognized

  Scenario Outline: Credit card recognition for <card_type> and validate date on animated card
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key          | value |
      | panIcon      | true  |
      | animatedCard | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User fills payment form with credit card number "<card_number>", expiration date "<expiration_date>" and cvv "<cvv>"
    Then User will see card icon connected to card type <card_type>
    And User will see the same provided data on animated credit card "<formatted_card_number>", "<expiration_date>" and "<cvv>"
    And User will see that animated card is flipped, except for "AMEX"

    Examples:
      | card_number      | formatted_card_number | expiration_date | cvv  | card_type    |
      | 4111110000000211 | 4111 1100 0000 0211   | 12/22           | 123  | VISA         |
      | 340000000000611  | 3400 000000 00611     | 12/23           | 1234 | AMEX         |
      | 6011000000000301 | 6011 0000 0000 0301   | 12/23           | 123  | DISCOVER     |
      | 3528000000000411 | 3528 0000 0000 0411   | 12/23           | 123  | JCB          |
      | 5000000000000611 | 5000 0000 0000 0611   | 12/23           | 123  | MAESTRO      |
      | 5100000000000511 | 5100 0000 0000 0511   | 12/23           | 123  | MASTERCARD   |
      | 3000000000000111 | 3000 000000 000111    | 12/23           | 123  | DINERS       |
      | 1801000000000901 | 1801 0000 0000 0901   | 12/23           | 123  | ASTROPAYCARD |

  Scenario: Verify that animated card and card icon are not displayed by default
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User fills payment form with defined card VISA_V21_FRICTIONLESS
    Then User will not see form field ANIMATED_CARD
    And User will not see form field CARD_ICON

  Scenario: Verify that animated card is not displayed if 'animatedCard' is false
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key          | value |
      | animatedCard | false |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    When User opens example page
    Then User will not see form field ANIMATED_CARD

  Scenario: Verify that card icon is not displayed if 'panIcon' is false
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key     | value |
      | panIcon | false |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User fills payment form with defined card VISA_V21_FRICTIONLESS
    Then User will not see form field CARD_ICON

  Scenario: App is embedded in another iframe - animated card test
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key          | value |
      | panIcon      | true  |
      | animatedCard | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page IN_IFRAME
    And User waits for form inputs to be loaded
    When User fills payment form with credit card number "4111110000000211", expiration date "12/22" and cvv "123"
    Then User will see card icon connected to card type VISA
    And User will see the same provided data on animated credit card "4111 1100 0000 0211", "12/22" and "123"
    And User will see that animated card is flipped, except for "AMEX"
