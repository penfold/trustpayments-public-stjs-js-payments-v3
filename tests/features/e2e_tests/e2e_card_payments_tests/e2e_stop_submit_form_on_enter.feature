@stopSubmitFormOnEnter
Feature: E2E for 'stopSubmitFormOnEnter' option
  As a user
  I want to use config with stopSubmitFormOnEnter
  In order to check payment functionality


  Scenario: stopSubmitFormOnEnter enabled - form submit by 'Enter' keyboard button
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key                   | value |
      | stopSubmitFormOnEnter | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    And User waits for Pay button to be active
    When User fills payment form with defined card VISA_V22_FRICTIONLESS
    And User press ENTER button in input field
    Then User will not see notification frame
    And User will see that Pay button is "enabled"
    And User will see that ALL input fields are "enabled"


  @STJS-1919
  Scenario: stopSubmitFormOnEnter default setting - form submit by 'Enter' keyboard button
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User fills payment form with defined card VISA_V22_FRICTIONLESS
    And User press ENTER button in input field
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |
    And User will see that Pay button is "disabled"
    And User will see that ALL input fields are "disabled"


  Scenario:  stopSubmitFormOnEnter disabled - form submit by 'Enter' keyboard button
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key                   | value |
      | stopSubmitFormOnEnter | false |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User fills payment form with defined card VISA_V22_FRICTIONLESS
    And User press ENTER button in input field
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |
    And User will see that Pay button is "disabled"
    And User will see that ALL input fields are "disabled"
    And User will see the same provided data in inputs fields


  Scenario: stopSubmitFormOnEnter enabled - form submit by 'Pay' button
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key                   | value |
      | stopSubmitFormOnEnter | true  |
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
      | success       |
      | submit        |
    And User will see that Pay button is "disabled"
    And User will see that ALL input fields are "disabled"


  Scenario: stopSubmitFormOnEnter and submitOnSuccess enabled - form submit by 'Pay' button
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key                   | value |
      | submitOnSuccess       | true  |
      | stopSubmitFormOnEnter | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_CARD
    And User clicks Pay button
    Then User will not see notification frame
    And User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | 1000                                    |
      | currencyiso3a        | GBP                                     |
      | errorcode            | 0                                       |
      | threedresponse       | should be none                          |
      | enrolled             | U                                       |
      | settlestatus         | 0                                       |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
