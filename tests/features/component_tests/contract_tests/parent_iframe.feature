Feature: Payment form embedded into iframe - validation of requests send

  Background:
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |

  @parent_iframe
  Scenario Outline: App is embedded in another iframe - Cardinal Commerce test
    And Challenge card payment mock responses are set as BASE_JSINIT and payment status <action_code>
    And ACS mock response is set to "OK"
    And User opens example page IN_IFRAME
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    Then User will see notification frame text: "<payment_status_message>"
    And AUTH and THREEDQUERY requests were sent only once with correct data

    Examples:
      | action_code     | payment_status_message                  |
      | SUCCESS         | Payment has been successfully processed |
      | UNAUTHENTICATED | Unauthenticated                         |

  @parent_iframe
  Scenario: App is embedded in another iframe - fields validation test
    And Frictionless card payment mock responses are set as BASE_JSINIT and payment status SUCCESS
    And User opens example page IN_IFRAME
    And User clicks Pay button
    Then User will see validation message "Field is required" under all fields
    And User will see that all fields are highlighted
    And THREEDQUERY, AUTH request was not sent
