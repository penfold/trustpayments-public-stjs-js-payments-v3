@merchant_feature_close_3ds_pop_up
Feature: Close ACS pop-up (3DS modal) for Trustpayments provider
  As a merchant
  I should be able to close the popup (from code)
  In the case when the st.js token expired


  Scenario: Close 3ds pop up for challenge V1
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | THREEDQUERY AUTH   |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
      | sitereference           | trustthreeds76424 |
    And User opens example page
    And User toggle action buttons bar
    And User fills payment form with defined card MASTERCARD_V1_3DS_SDK_NON_FRICTIONLESS
    And User clicks Pay button
    And User see 3ds SDK challenge for v1 is displayed
    When User clicks cancel 3ds action button
    Then User will see payment status information: "Payment has been cancelled"
    And User will see that notification frame has "yellow" color
    And "submit" callback is called only once
    And "cancel" callback is called only once
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: False
    And User will see that Submit button is "enabled"
    And User will see that ALL input fields are "enabled"


  Scenario: Close 3ds pop up for challenge V2
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | THREEDQUERY AUTH   |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
      | sitereference           | trustthreeds76424 |
    And User opens example page
    And User toggle action buttons bar
    And User fills payment form with defined card MASTERCARD_V21_3DS_SDK_NON_FRICTIONLESS
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    When User clicks cancel 3ds action button
    Then User will see payment status information: "Payment has been cancelled"
    And User will see that notification frame has "yellow" color
    And "submit" callback is called only once
    And "cancel" callback is called only once
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: False
    And User will see that Submit button is "enabled"
    And User will see that ALL input fields are "enabled"


  Scenario Outline: Close 3ds pop up and retry payment with NON_FRICTIONLESS card
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value                     |
      | requesttypedescriptions | <requesttypedescriptions> |
      | baseamount              | 1500                      |
      | customercountryiso2a    | GB                        |
      | billingcountryiso2a     | GB                        |
      | sitereference           | trustthreeds76424        |
    And User opens example page
    And User toggle action buttons bar
    And User fills payment form with defined card VISA_V21_3DS_SDK_NON_FRICTIONLESS
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User clicks cancel 3ds action button
    And User will see payment status information: "Payment has been cancelled"
    And User waits for payment status to disappear
    When User clicks Pay button
    And User fills 3ds SDK challenge with THREE_DS_CODE and submit
    Then User will see payment status information: "Payment has been successfully processed"
    And "submit" callback is called only once in second payment
    And "success" callback is called only once
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: <THREEDRESPONSE>

    Examples:
      | requesttypedescriptions | THREEDRESPONSE |
      | THREEDQUERY             | True           |
      | THREEDQUERY AUTH        | False          |

  @STJS-2041
  Scenario Outline: Close 3ds pop up and retry payment with NON_FRICTIONLESS card - submit on success
    Given JS library configured by inline params SUBMIT_ON_SUCCESS_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
      | sitereference           | trustthreeds76424 |
    And User opens example page
    And User toggle action buttons bar
    And User fills payment form with defined card VISA_V22_3DS_SDK_NON_FRICTIONLESS
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User clicks cancel 3ds action button
    And User will see payment status information: "Payment has been cancelled"
    And User waits for payment status to disappear
    When User clicks Pay button
    And User fills 3ds SDK challenge with THREE_DS_CODE and submit
    Then User will not see notification frame
    And User will be sent to page with url "www.example.com" having params
      | key                  | value                      |
      | errormessage         | Payment has been cancelled |
      | baseamount           | <baseamount>               |
      | currencyiso3a        | <currencyiso3a>            |
      | errorcode            | should not be none         |
      | status               | should not be none         |
      | transactionreference | should not be none         |
      | jwt                  | should not be none         |
      | enrolled             | should not be none         |
      | settlestatus         | should not be none         |
      | eci                  | <eci>                      |
      | threedresponse       | <threedresponse>           |

    Examples:
      | request_types    | baseamount         | currencyiso3a      | eci                | threedresponse     |
      | THREEDQUERY      | should be none     | should be none     | should be none     | should not be none |
      | THREEDQUERY AUTH | should not be none | should not be none | should not be none | should be none     |


  Scenario Outline: Close 3ds pop up and retry payment with FRICTIONLESS card
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value                     |
      | requesttypedescriptions | <requesttypedescriptions> |
      | baseamount              | 1500                      |
      | customercountryiso2a    | GB                        |
      | billingcountryiso2a     | GB                        |
      | sitereference           | trustthreeds76424        |
    And User opens example page
    And User toggle action buttons bar
    And User fills payment form with defined card MASTERCARD_V22_3DS_SDK_NON_FRICTIONLESS
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User clicks cancel 3ds action button
    And User will see payment status information: "Payment has been cancelled"
    And User waits for payment status to disappear
    And User re-fills payment form with defined card VISA_V22_3DS_SDK_FRICTIONLESS_SUCCESS
    When User clicks Pay button
    Then User will see payment status information: "Payment has been successfully processed"
    And "submit" callback is called only once in second payment
    And "success" callback is called only once
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: False

    Examples:
      | requesttypedescriptions |
      | THREEDQUERY             |
      | THREEDQUERY AUTH        |

  @STJS-2041
  Scenario Outline: Close 3ds pop up and retry payment with FRICTIONLESS card - submit on success
    Given JS library configured by inline params SUBMIT_ON_SUCCESS_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | <request_types>    |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
      | sitereference           | trustthreeds76424 |
    And User opens example page
    And User toggle action buttons bar
    And User fills payment form with defined card VISA_V21_3DS_SDK_NON_FRICTIONLESS
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User clicks cancel 3ds action button
    And User will see payment status information: "Payment has been cancelled"
    And User waits for payment status to disappear
    And User re-fills payment form with defined card MASTERCARD_V21_3DS_SDK_FRICTIONLESS_SUCCESS
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
      | key                     | value              |
      | requesttypedescriptions | THREEDQUERY AUTH   |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
      | sitereference           | trustthreeds76424 |
      | pan                     | 5591390000000173   |
    And User opens example page WITHOUT_SUBMIT_BUTTON
    And User toggle action buttons bar
    And User see 3ds SDK challenge is displayed
    When User clicks cancel 3ds action button
    Then User will see payment status information: "Payment has been cancelled"
    And User will see that notification frame has "yellow" color
    And "submit" callback is called only once
    And "cancel" callback is called only once
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: False


  Scenario: Close 3ds pop up and retry payment with updated jwt and NON_FRICTIONLESS card
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | THREEDQUERY AUTH   |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
      | sitereference           | trustthreeds76424 |
    And User opens page WITH_UPDATE_JWT and jwt BASE_TRUST_UPDATED_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | THREEDQUERY AUTH   |
      | sitereference           | trustthreeds76424 |
    And User toggle action buttons bar
    And User fills payment form with defined card VISA_V22_3DS_SDK_NON_FRICTIONLESS
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User clicks cancel 3ds action button
    And User will see payment status information: "Payment has been cancelled"
    And User waits for payment status to disappear
    And User calls updateJWT function by filling amount field
    When User clicks Pay button
    And User fills 3ds SDK challenge with THREE_DS_CODE and submit
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color


  Scenario: Close 3ds pop up and retry payment with updated jwt and FRICTIONLESS card
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | THREEDQUERY AUTH   |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
      | sitereference           | trustthreeds76424 |
    And User opens page WITH_UPDATE_JWT and jwt BASE_TRUST_UPDATED_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | THREEDQUERY AUTH   |
      | sitereference           | trustthreeds76424 |
    And User toggle action buttons bar
    And User fills payment form with defined card VISA_V22_3DS_SDK_NON_FRICTIONLESS
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User clicks cancel 3ds action button
    And User will see payment status information: "Payment has been cancelled"
    And User waits for payment status to disappear
    And User calls updateJWT function by filling amount field
    And User re-fills payment form with defined card MASTERCARD_V22_3DS_SDK_FRICTIONLESS_SUCCESS
    When User clicks Pay button
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
