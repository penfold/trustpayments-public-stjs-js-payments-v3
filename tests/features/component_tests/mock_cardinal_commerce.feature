Feature: Cardinal commerce

  As a user
  I want to use card payments method with cardinal commerce config
  In order to check full payment functionality

  Background:
    Given JavaScript configuration is set for scenario based on scenario's @config tag
    And User opens mock payment page

  @base_config @cardinal_commerce
  Scenario Outline: Cardinal Commerce (step-up payment) - checking payment status for <action_code> response code
    And User waits for whole form to be loaded
    When User fills payment form with credit card number "<card_number>", expiration date "12/30" and cvv "123"
    And THREEDQUERY mock response is set to "ENROLLED_Y"
    And ACS mock response is set to "OK"
    And User clicks Pay button - AUTH response is set to "<action_code>"
    Then User will see notification frame text: "<payment_status_message>"
    And User will see that notification frame has "<color>" color
    And AUTH and THREEDQUERY requests were sent only once with correct data

    @smoke_component_test
    Examples:
      | card_number      | action_code | payment_status_message                  | color |
      | 4000000000001091 | OK          | Payment has been successfully processed | green |
      | 4000000000001109 | DECLINE     | Decline                                 | red   |
    Examples:
      | card_number      | action_code     | payment_status_message | color |
      | 4000000000001109 | INVALID_FIELD   | Invalid field          | red   |
      | 4000000000001109 | SOCKET_ERROR    | Socket receive error   | red   |
      | 4000000000001109 | UNAUTHENTICATED | Unauthenticated        | red   |
      | 4000000000001109 | UNKNOWN_ERROR   | Unknown error          | red   |

  @base_config @cardinal_commerce
  Scenario Outline: Cardinal Commerce (frictionless cards) - checking payment status for <action_code> response code
    When User fills payment form with credit card number "<card_number>", expiration date "01/22" and cvv "123"
    And Frictionless THREEDQUERY, AUTH response is set to <action_code>
    And User clicks Pay button
    Then User will see notification frame text: "<payment_status_message>"
    And User will see that notification frame has "<color>" color
    And Frictionless AUTH and THREEDQUERY requests were sent only once with correct data

    @smoke_component_test
    Examples:
      | card_number      | action_code | payment_status_message                  | color |
      | 4000000000001026 | OK          | Payment has been successfully processed | green |
    Examples:
      | card_number      | action_code     | payment_status_message | color |
      | 4000000000001018 | UNAUTHENTICATED | Unauthenticated        | red   |
      | 4000000000001018 | DECLINE         | Decline                | red   |

  @base_config @cardinal_commerce
  Scenario Outline: Cardinal Commerce (card not-enrolled U) - checking payment status for <action_code> response code
    When User fills payment form with credit card number "<card_number>", expiration date "01/22" and cvv "123"
    And Frictionless THREEDQUERY, AUTH response is set to <action_code>
    And User clicks Pay button
    Then User will see notification frame text: "<payment_status_message>"
    And User will see that notification frame has "<color>" color
    And Frictionless AUTH and THREEDQUERY requests were sent only once with correct data

    Examples:
      | card_number      | action_code   | payment_status_message                  | color |
      | 4111110000000401 | TDQ_U_OK      | Payment has been successfully processed | green |
      | 5100000000000412 | TDQ_U_DECLINE | Decline                                 | red   |
      #|5100000000000412	 | UNAUTHENTICATED         | Unauthenticated                | red   |

  @base_config
  Scenario: Cardinal Commerce - check THREEDQUERY response for code: "INVALID_ACQUIRER"
    When User fills payment form with credit card number "4111110000000211", expiration date "01/22" and cvv "123"
    And THREEDQUERY mock response is set to "INVALID_ACQUIRER"
    And User clicks Pay button
    Then User will see notification frame text: "Invalid acquirer for 3-D Secure"
    And User will see that notification frame has "red" color
    And THREEDQUERY request was sent only once with correct data

  @base_config
  Scenario: Cardinal Commerce - check ACS response for code: FAILURE
    When User fills payment form with credit card number "4111110000000211", expiration date "01/22" and cvv "123"
    And THREEDQUERY mock response is set to "ENROLLED_Y"
    And ACS mock response is set to "FAILURE"
    And User clicks Pay button
    Then User will see notification frame text: "An error occurred"
    And User will see that notification frame has "red" color
    And THREEDQUERY request was sent only once with correct data
    And User will see that Pay button is "enabled"
    And submit callback contains THREEDRESPONSE: True
    And submit callback contains JWT response

  @base_config @cardinal_commerce
  Scenario Outline: Cardinal Commerce - check ACS response for code: <action_code>
    When User fills payment form with credit card number "4111110000000211", expiration date "01/22" and cvv "123"
    And THREEDQUERY mock response is set to "ENROLLED_Y"
    And ACS mock response is set to "<action_code>"
    And User clicks Pay button
    Then User will see notification frame text: "<payment_status_message>"
    And User will see that notification frame has "<color>" color
    And AUTH and THREEDQUERY requests were sent only once with correct data

    Examples:
      | action_code | payment_status_message                  | color |
      | NOACTION    | Payment has been successfully processed | green |

