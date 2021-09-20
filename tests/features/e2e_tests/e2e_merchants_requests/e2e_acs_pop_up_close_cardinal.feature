@merchant_feature_close_3ds_pop_up
Feature: Close ACS pop-up (3DS modal) for Cardinal Commerce provider
  As a merchant
  I should be able to close the popup (from code)
  In the case when the st.js token expired


  Scenario: Close 3ds pop up
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    And User toggle action buttons bar
    And User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    And User see V2 authentication modal is displayed
    When User clicks cancel 3ds action button
    Then User will see notification frame text: "An error occurred"
    And User will see that notification frame has "red" color
    And "submit" callback is called only once
    And "error" callback is called only once
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: False
    And User will see that Pay button is "enabled"
    And User will see that ALL input fields are "enabled"


  Scenario Outline: Close 3ds pop up and retry payment with NON_FRICTIONLESS card
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value                     |
      | requesttypedescriptions | <requesttypedescriptions> |
      | baseamount              | 1500                      |
    And User opens example page
    And User toggle action buttons bar
    And User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    And User see V2 authentication modal is displayed
    And User clicks cancel 3ds action button
    And User will see notification frame text: "An error occurred"
    And User waits for notification frame to disappear
    When User clicks Pay button
    And User fills V2 authentication modal
    Then User will see notification frame text: "Payment has been successfully processed"
    And "submit" callback is called only once in second payment
    And "success" callback is called only once
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: <THREEDRESPONSE>

    Examples:
      | requesttypedescriptions | THREEDRESPONSE |
      | THREEDQUERY             | True           |
      | THREEDQUERY AUTH        | False          |


  Scenario Outline: Close 3ds pop up and retry payment with NON_FRICTIONLESS card - redirect params verification
    Given JS library configured by inline params SUBMIT_ON_SUCCESS_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    And User toggle action buttons bar
    And User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    And User see V2 authentication modal is displayed
    And User clicks cancel 3ds action button
    And User will see notification frame text: "An error occurred"
    And User waits for notification frame to disappear
    When User clicks Pay button
    And User fills V2 authentication modal
    Then User will not see notification frame
    And User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | <baseamount>                            |
      | currencyiso3a        | <currencyiso3a>                         |
      | errorcode            | should not be none                      |
      | status               | should not be none                      |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | enrolled             | should not be none                      |
      | settlestatus         | should not be none                      |
      | eci                  | <eci>                                   |
      | threedresponse       | <threedresponse>                        |

    Examples:
      | request_types    | baseamount         | currencyiso3a      | eci                | threedresponse     |
      | THREEDQUERY      | should be none     | should be none     | should be none     | should not be none |
      | THREEDQUERY AUTH | should not be none | should not be none | should not be none | should be none     |


  Scenario Outline: Close 3ds pop up and retry payment with FRICTIONLESS card
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value                     |
      | requesttypedescriptions | <requesttypedescriptions> |
      | baseamount              | 1500                      |
    And User opens example page
    And User toggle action buttons bar
    And User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    And User see V2 authentication modal is displayed
    And User clicks cancel 3ds action button
    And User will see notification frame text: "An error occurred"
    And User waits for notification frame to disappear
    And User re-fills payment form with defined card MASTERCARD_FRICTIONLESS
    When User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And "submit" callback is called only once in second payment
    And "success" callback is called only once
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: False

    Examples:
      | requesttypedescriptions |
      | THREEDQUERY             |
      | THREEDQUERY AUTH        |


  Scenario Outline: Close 3ds pop up and retry payment with FRICTIONLESS card - redirect params verification
    Given JS library configured by inline params SUBMIT_ON_SUCCESS_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    And User toggle action buttons bar
    And User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    And User see V2 authentication modal is displayed
    And User clicks cancel 3ds action button
    And User will see notification frame text: "An error occurred"
    And User waits for notification frame to disappear
    And User re-fills payment form with defined card MASTERCARD_FRICTIONLESS
    When User clicks Pay button
    Then User will not see notification frame
    And User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | <baseamount>                            |
      | currencyiso3a        | <currencyiso3a>                         |
      | errorcode            | should not be none                      |
      | status               | should not be none                      |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | enrolled             | should not be none                      |
      | settlestatus         | should not be none                      |
      | eci                  | <eci>                                   |
      | threedresponse       | <threedresponse>                        |

    Examples:
      | request_types    | baseamount         | currencyiso3a      | eci                | threedresponse |
      | THREEDQUERY      | should be none     | should be none     | should be none     | should be none |
      | THREEDQUERY AUTH | should not be none | should not be none | should not be none | should be none |

  Scenario: Close 3ds pop up for startOnLoad payment
    Given JS library configured by inline params START_ON_LOAD_CONFIG and jwt JWT_WITH_NON_FRICTIONLESS_CARD with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page WITHOUT_SUBMIT_BUTTON
    And User toggle action buttons bar
    And User see V2 authentication modal is displayed
    When User clicks cancel 3ds action button
    Then User will see notification frame text: "An error occurred"
    And User will see that notification frame has "red" color
    And "submit" callback is called only once
    And "error" callback is called only once
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: False

  Scenario: Close 3ds pop up and retry payment with updated jwt and NON_FRICTIONLESS card
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens page WITH_UPDATE_JWT and jwt BASE_UPDATED_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User toggle action buttons bar
    And User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    And User see V2 authentication modal is displayed
    And User clicks cancel 3ds action button
    And User will see notification frame text: "An error occurred"
    And User waits for notification frame to disappear
    And User calls updateJWT function by filling amount field
    And User toggle action buttons bar
    When User clicks Pay button
    And User fills V2 authentication modal
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color


  Scenario: Close 3ds pop up and retry payment with updated jwt and FRICTIONLESS card
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens page WITH_UPDATE_JWT and jwt BASE_UPDATED_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User toggle action buttons bar
    And User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    And User see V2 authentication modal is displayed
    And User clicks cancel 3ds action button
    And User will see notification frame text: "An error occurred"
    And User waits for notification frame to disappear
    And User calls updateJWT function by filling amount field
    And User re-fills payment form with defined card MASTERCARD_FRICTIONLESS
    And User toggle action buttons bar
    When User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
