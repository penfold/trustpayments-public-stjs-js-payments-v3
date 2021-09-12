Feature: Payment form embeded into iframe

  As a user
  I want to use card payments method embeded into iframe
  In order to check full payment functionality

  Background:
    Given JavaScript configuration is set for scenario based on scenario's @config tag
    And User opens mock payment page

  @base_config @parent_iframe
  Scenario Outline: App is embedded in another iframe - Cardinal Commerce test
    When User opens mock payment page
    And User waits for whole form to be loaded
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And THREEDQUERY mock response is set to "ENROLLED_Y"
    And ACS mock response is set to "OK"
    And User clicks Pay button - AUTH response is set to "<action_code>"
    Then User will see notification frame text: "<payment_status_message>"
    And User will see that notification frame has "<color>" color
    And AUTH and THREEDQUERY requests were sent only once with correct data

    @smoke_component_test
    Examples:
      | action_code | payment_status_message                  | color |
      | OK          | Payment has been successfully processed | green |

    Examples:
      | action_code     | payment_status_message | color |
      | UNAUTHENTICATED | Unauthenticated        | red   |

  @config_animated_card_true @parent_iframe @animated_card
  Scenario Outline: App is embedded in another iframe - animated card test
    When User opens mock payment page
    And User fills payment form with credit card number "<card_number>", expiration date "<expiration_date>" and cvv "<cvv>"
    Then User will see card icon connected to card type <card_type>
    And User will see the same provided data on animated credit card "<formatted_card_number>", "<expiration_date>" and "<cvv>"
    And User will see that animated card is flipped, except for "AMEX"

    Examples:
      | card_number      | formatted_card_number | expiration_date | cvv | card_type |
      | 4111110000000211 | 4111 1100 0000 0211   | 12/22           | 123 | VISA      |

  @base_config @parent_iframe
  Scenario: App is embedded in another iframe - fields validation test
    When User opens mock payment page
    And User clicks Pay button
    Then User will see validation message "Field is required" under all fields
    And User will see that all fields are highlighted
    And THREEDQUERY, AUTH request was not sent
