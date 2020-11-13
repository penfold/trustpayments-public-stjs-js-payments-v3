Feature: E2E for tokenisation
  As a user
  I want to use predefined jwt config files
  To execute payment with only cvv

  @reactJS
  @angular
  @vueJS
  @react_native
  @e2e_for_tokenisation @jwt_config_visa_frictionless_with_parenttransaction
  Scenario: Visa Frictionless tokenisation
    Given JS library configured by inline params TOKENISATION_CONFIG and jwt JWT_VISA_FRICTIONLESS_PARENT_TRANSACTION with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User fills only security code for saved VISA_FRICTIONLESS card
    And User clicks Pay button
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And User will see that Submit button is "disabled" after payment
    And User will see that SECURITY_CODE input fields are "disabled"

  @e2e_for_tokenisation @jwt_config_visa_non_frictionless_with_parenttransaction
  Scenario: Visa Non-Frictionless tokenisation
    Given JS library configured by inline params TOKENISATION_CONFIG and jwt JWT_VISA_NON_FRICTIONLESS_PARENT_TRANSACTION with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User fills only security code for saved VISA_NON_FRICTIONLESS card
    And User clicks Pay button
    And User fills V2 authentication modal
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And User will see that Submit button is "disabled" after payment
    And User will see that SECURITY_CODE input fields are "disabled"

  @e2e_for_tokenisation @jwt_config_amex_non_frictionless_with_parenttransaction
  Scenario: Amex Non-Frictionless tokenisation
    Given JS library configured by inline params TOKENISATION_CONFIG and jwt JWT_AMEX_NON_FRICTIONLESS_PARENT_TRANSACTION with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User fills only security code for saved AMEX_NON_FRICTIONLESS card
    And User clicks Pay button
    And User fills V2 authentication modal
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And User will see that Submit button is "disabled" after payment
    And User will see that SECURITY_CODE input fields are "disabled"

  @reactJS
  @angular
  @vueJS
  @react_native
  @update_jwt_test
  Scenario: Updating payment references for tokenization
    Given JS library configured by inline params TOKENISATION_AND_SUBMIT_ON_SUCCESS_CONFIG and jwt JWT_AMEX_NON_FRICTIONLESS_PARENT_TRANSACTION with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page WITH_UPDATE_JWT
      | jwtName                                  |
      | JWT_VISA_FRICTIONLESS_PARENT_TRANSACTION |
    When User calls updateJWT function by filling amount field
    And User fills only security code for saved VISA_FRICTIONLESS card
    And User clicks Pay button
    Then User will not see notification frame
    And User will be sent to page with url "www.example.com" having params
      | key           | value                                   |
      | errormessage  | Payment has been successfully processed |
      | baseamount    | 2000                                    |
      | currencyiso3a | GBP                                     |
      | errorcode     | 0                                       |
      | status        | A                                       |

  Scenario: Updating payment references for tokenization - fully authentication in second payment
    Given JS library configured by inline params TOKENISATION_WITH_DEFER_INIT_CONFIG and jwt JWT_VISA_NON_FRICTIONLESS_PARENT_TRANSACTION with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page WITH_UPDATE_JWT
      | jwtName                                      |
      | JWT_AMEX_NON_FRICTIONLESS_PARENT_TRANSACTION |
    When User fills only security code for saved VISA_INVALID_CVV card
    And User clicks Pay button
    Then User will see payment status information: "Invalid field"
    And User waits for payment status to disappear
    And User calls updateJWT function by filling amount field
    And User clears security code field
    And User fills only security code for saved AMEX_NON_FRICTIONLESS card
    And User clicks Pay button
    And User fills V2 authentication modal
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
