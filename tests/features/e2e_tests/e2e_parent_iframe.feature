Feature: Payment form embeded into iframe
  As a user
  I want to use card payments method embeded into iframe
  In order to check full payment functionality

  @parent_iframe
  Scenario: App is embedded in another iframe - animated card test
    Given JS library configured by inline params ANIMATED_CARD_PAN_ICON_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page IN_IFRAME
    And User waits for whole form to be loaded
    When User fills payment form with credit card number "4111110000000211", expiration date "12/22" and cvv "123"
    Then User will see card icon connected to card type VISA
    And User will see the same provided data on animated credit card "4111 1100 0000 0211X", "12/22" and "123"
    And User will see that animated card is flipped, except for "AMEX"

  @parent_iframe
  Scenario: App is embedded in another iframe - fields validation test
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page IN_IFRAME
    When User clicks Pay button
    Then User will see validation message "Field is required" under all fields
    And User will see that all fields are highlighted
