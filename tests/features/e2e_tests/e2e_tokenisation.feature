Feature: E2E for tokenisation
  As a user
  I want to use predefined jwt config files
  To execute payment with only cvv


  Scenario: Visa Frictionless tokenisation
    Given JS library configured by inline params TOKENISATION_CONFIG and jwt JWT_VISA_FRICTIONLESS_PARENT_TRANSACTION with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User fills only security code for saved VISA_V21_FRICTIONLESS card
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And User will see that Pay button is "disabled"
    And User will see that SECURITY_CODE input field is "disabled"


  Scenario: Visa Non-Frictionless tokenisation
    Given JS library configured by inline params TOKENISATION_CONFIG and jwt JWT_VISA_NON_FRICTIONLESS_PARENT_TRANSACTION with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User fills only security code for saved VISA_V21_NON_FRICTIONLESS card
    And User clicks Pay button
    And User fills V2 authentication modal
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And User will see that Pay button is "disabled"
    And User will see that SECURITY_CODE input field is "disabled"


  Scenario: Visa Non-Frictionless tokenisation with bypass
    Given JS library configured by inline params TOKENISATION_CONFIG and jwt JWT_VISA_NON_FRICTIONLESS_PARENT_TRANSACTION with additional attributes
      | key                      | value                    |
      | requesttypedescriptions  | THREEDQUERY AUTH RISKDEC |
      | threedbypasspaymenttypes | VISA MASTERCARD          |
    And User opens example page
    When User fills only security code for saved VISA_V21_NON_FRICTIONLESS card
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And User will see that Pay button is "disabled"
    And User will see that SECURITY_CODE input field is "disabled"


  Scenario: Amex Non-Frictionless tokenisation
    Given JS library configured by inline params TOKENISATION_CONFIG and jwt JWT_AMEX_NON_FRICTIONLESS_PARENT_TRANSACTION with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User fills only security code for saved AMEX_NON_FRICTIONLESS card
    And User clicks Pay button
    And User fills V2 authentication modal
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And User will see that Pay button is "disabled"
    And User will see that SECURITY_CODE input field is "disabled"


  Scenario: Updating payment references for tokenization
    Given JS library configured by inline params TOKENISATION_AND_SUBMIT_ON_SUCCESS_CONFIG and jwt JWT_AMEX_NON_FRICTIONLESS_PARENT_TRANSACTION with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens page WITH_UPDATE_JWT and jwt JWT_VISA_FRICTIONLESS_PARENT_TRANSACTION with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    When User calls updateJWT function by filling amount field
    And User fills only security code for saved VISA_V21_FRICTIONLESS card
    And User clicks Pay button
    Then User will not see notification frame
    And User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | 2000                                    |
      | currencyiso3a        | GBP                                     |
      | errorcode            | 0                                       |
      | status               | A                                       |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | enrolled             | Y                                       |
      | eci                  | 06                                      |


  Scenario: Updating payment references for tokenization - fully authentication in second payment
    Given JS library configured by inline params TOKENISATION_CONFIG and jwt JWT_VISA_NON_FRICTIONLESS_PARENT_TRANSACTION with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
      | baseamount              | 70000            |
    And User opens page WITH_UPDATE_JWT and jwt JWT_AMEX_NON_FRICTIONLESS_PARENT_TRANSACTION with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    When User fills only security code for saved VISA_V21_NON_FRICTIONLESS card
    And User clicks Pay button
    And User fills V2 authentication modal
    Then User will see notification frame text: "Decline"
    And User waits for notification frame to disappear
    And User calls updateJWT function by filling amount field
    And User clears security code field
    And User fills only security code for saved AMEX_NON_FRICTIONLESS card
    And User clicks Pay button
    And User fills V2 authentication modal
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
