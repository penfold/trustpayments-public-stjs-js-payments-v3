Feature: Validation of requests send

  @parent_iframe @<tag>
  Scenario Outline: App is embedded in another iframe - Cardinal Commerce test
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page IN_IFRAME
    And User waits for whole form to be loaded
    When User fills payment form with defined card <card_number>
    And User clicks Pay button
    Then User will see notification frame text: "<payment_status_message>"
    And User will see that notification frame has "<color>" color

    Examples:
      | card_number                           | payment_status_message                  | color | tag                  |
      | VISA_V21_FRICTIONLESS                 | Payment has been successfully processed | green | smoke_component_test |
      | MASTERCARD_REJECTED_FRICTIONLESS_AUTH | Unauthenticated                         | red   |                      |
