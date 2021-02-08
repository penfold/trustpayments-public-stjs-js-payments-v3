@stopSubmitFormOnEnter
Feature: E2E for 'stopSubmitFormOnEnter' option
  As a user
  I want to use config with stopSubmitFormOnEnter
  In order to check payment functionality

  @e2e_smoke_test
  Scenario: Prevent submit payment form by 'Enter' button with enabled 'stopSubmitFormOnEnter' option
    Given JS library configured by inline params STOP_SUBMIT_FORM_ON_ENTER and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    And User waits for whole form to be displayed
    And User waits for Pay button to be active
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User press ENTER button in input field
    Then User will not see notification frame
    And User will see that Submit button is "enabled" after payment
    And User will see that ALL input fields are "enabled"


  Scenario: Submit payment form by 'Enter' button - 'stopSubmitFormOnEnter' option is disabled by default
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User fills payment form with defined card VISA_V21_FRICTIONLESS
    And User press ENTER button in input field
    Then User will see payment status information: "Payment has been successfully processed"
    And "submit" callback is called only once
    And "success" callback is called only once
    And User will see that Submit button is "disabled" after payment
    And User will see that ALL input fields are "disabled"


  Scenario: Submit payment form by 'Enter' button with disabled 'stopSubmitFormOnEnter' option
    Given JS library configured by inline params STOP_SUBMIT_FORM_ON_ENTER_FALSE and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User fills payment form with defined card VISA_V21_FRICTIONLESS
    And User press ENTER button in input field
    Then User will see payment status information: "Payment has been successfully processed"
    And "submit" callback is called only once
    And "success" callback is called only once
    And User will see that Submit button is "disabled" after payment
    And User will see that ALL input fields are "disabled"


  Scenario: Submit payment form by 'Pay' button with enabled options: submitOnSuccess and 'stopSubmitFormOnEnter'
    Given JS library configured by inline params SUBMIT_ON_SUCCESS_STOP_SUBMIT_FORM_ON_ENTER and jwt BASE_JWT with additional attributes
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


  Scenario: Submit payment form by 'Pay' button with enabled 'stopSubmitFormOnEnter' option
    Given JS library configured by inline params STOP_SUBMIT_FORM_ON_ENTER and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    And User fills V2 authentication modal
    Then User will see payment status information: "Payment has been successfully processed"
    And "submit" callback is called only once
    And "success" callback is called only once
    And User will see that Submit button is "disabled" after payment
    And User will see that ALL input fields are "disabled"
