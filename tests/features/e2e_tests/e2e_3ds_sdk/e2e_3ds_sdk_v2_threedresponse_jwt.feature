@3ds_sdk
Feature: 3ds SDK v2 E2E tests - Threedresponse
  As a user
  I want to use card payments method
  In order to check 3ds SDK integration


  Background:
    Given JS library configured by inline config BASIC_CONFIG


  Scenario Outline: Sending threedresponse JWT to merchants with Request types: <request_types> for mastercard v2.1
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value             |
      | requesttypedescriptions | <request_types>   |
      | sitereference           | trustthreeds76424 |
      | customercountryiso2a    | GB                |
      | billingcountryiso2a     | GB                |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_V21_3DS_SDK_NON_FRICTIONLESS
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User fills 3ds SDK challenge with THREE_DS_CODE and submit
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: True
    And THREEDRESPONSE contains paramaters
      | key              | value   |
      | ActionCode       | SUCCESS |
      | ErrorNumber      | 0       |
      | ErrorDescription | Success |

    Examples:
      | request_types            |
      | THREEDQUERY              |
      | ACCOUNTCHECK THREEDQUERY |
      | RISKDEC THREEDQUERY      |


  Scenario Outline: Payement failed with sending threedresponse JWT to merchants with Request types: <request_types> for mastercard v2.1
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value             |
      | requesttypedescriptions | <request_types>   |
      | sitereference           | trustthreeds76424 |
      | customercountryiso2a    | GB                |
      | billingcountryiso2a     | GB                |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_V21_3DS_SDK_STEP_UP_AUTH_FAILED
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User fills 3ds SDK challenge with THREE_DS_CODE and submit
    Then User will see notification frame text: "An error occurred"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | error         |
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: True
    And THREEDRESPONSE contains paramaters
      | key              | value                |
      | ActionCode       | FAILURE              |
      | ErrorNumber      | 1000                 |
      | ErrorDescription | Transaction rejected |

    Examples:
      | request_types            |
      | THREEDQUERY              |
      | ACCOUNTCHECK THREEDQUERY |
      | RISKDEC THREEDQUERY      |


  Scenario Outline: Successful payment with sending threedresponse JWT to merchants with Request types: <request_types> for mastercard v2.2
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value             |
      | requesttypedescriptions | <request_types>   |
      | sitereference           | trustthreeds76424 |
      | customercountryiso2a    | GB                |
      | billingcountryiso2a     | GB                |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_V22_3DS_SDK_NON_FRICTIONLESS
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User fills 3ds SDK challenge with THREE_DS_CODE and submit
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: True
    And THREEDRESPONSE contains paramaters
      | key              | value   |
      | ActionCode       | SUCCESS |
      | ErrorNumber      | 0       |
      | ErrorDescription | Success |

    Examples:
      | request_types            |
      | THREEDQUERY              |
      | ACCOUNTCHECK THREEDQUERY |
      | RISKDEC THREEDQUERY      |


  Scenario Outline: Payment failed with sending threedresponse JWT to merchants with Request types: <request_types> for mastercard v2.2
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value             |
      | requesttypedescriptions | <request_types>   |
      | sitereference           | trustthreeds76424 |
      | customercountryiso2a    | GB                |
      | billingcountryiso2a     | GB                |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_V22_3DS_SDK_STEP_UP_AUTH_FAILED
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User fills 3ds SDK challenge with THREE_DS_CODE and submit
    Then User will see notification frame text: "An error occurred"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | error         |
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: True
    And THREEDRESPONSE contains paramaters
      | key              | value                |
      | ActionCode       | FAILURE              |
      | ErrorNumber      | 1000                 |
      | ErrorDescription | Transaction rejected |

    Examples:
      | request_types            |
      | THREEDQUERY              |
      | ACCOUNTCHECK THREEDQUERY |
      | RISKDEC THREEDQUERY      |


  Scenario Outline: Sending threedresponse JWT to merchants with Request types: <request_types> for visa v2.1
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value             |
      | requesttypedescriptions | <request_types>   |
      | sitereference           | trustthreeds76424 |
      | customercountryiso2a    | GB                |
      | billingcountryiso2a     | GB                |
    And User opens example page
    When User fills payment form with defined card VISA_V21_3DS_SDK_NON_FRICTIONLESS
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User fills 3ds SDK challenge with THREE_DS_CODE and submit
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: True
    And THREEDRESPONSE contains paramaters
      | key              | value   |
      | ActionCode       | SUCCESS |
      | ErrorNumber      | 0       |
      | ErrorDescription | Success |

    Examples:
      | request_types            |
      | THREEDQUERY              |
      | ACCOUNTCHECK THREEDQUERY |
      | RISKDEC THREEDQUERY      |

  Scenario Outline:Payment failed with sending threedresponse JWT to merchants with Request types: <request_types> for visa v2.1
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value             |
      | requesttypedescriptions | <request_types>   |
      | sitereference           | trustthreeds76424 |
      | customercountryiso2a    | GB                |
      | billingcountryiso2a     | GB                |
    And User opens example page
    When User fills payment form with defined card VISA_V21_3DS_SDK_STEP_UP_AUTH_FAILED
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User fills 3ds SDK challenge with THREE_DS_CODE and submit
    Then User will see notification frame text: "An error occurred"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | error         |
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: True
    And THREEDRESPONSE contains paramaters
      | key              | value                |
      | ActionCode       | FAILURE              |
      | ErrorNumber      | 1000                 |
      | ErrorDescription | Transaction rejected |

    Examples:
      | request_types            |
      | THREEDQUERY              |
      | ACCOUNTCHECK THREEDQUERY |
      | RISKDEC THREEDQUERY      |


  Scenario Outline: Sending threedresponse JWT to merchants with Request types: <request_types> for visa v2.2
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value             |
      | requesttypedescriptions | <request_types>   |
      | sitereference           | trustthreeds76424 |
      | customercountryiso2a    | GB                |
      | billingcountryiso2a     | GB                |
    And User opens example page
    When User fills payment form with defined card VISA_V22_3DS_SDK_NON_FRICTIONLESS
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User fills 3ds SDK challenge with THREE_DS_CODE and submit
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: True
    And THREEDRESPONSE contains paramaters
      | key              | value   |
      | ActionCode       | SUCCESS |
      | ErrorNumber      | 0       |
      | ErrorDescription | Success |

    Examples:
      | request_types            |
      | THREEDQUERY              |
      | ACCOUNTCHECK THREEDQUERY |
      | RISKDEC THREEDQUERY      |


  Scenario Outline: Payment failed with sending threedresponse JWT to merchants with Request types: <request_types> for visa v2.2
    Given JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value             |
      | requesttypedescriptions | <request_types>   |
      | sitereference           | trustthreeds76424 |
      | customercountryiso2a    | GB                |
      | billingcountryiso2a     | GB                |
    And User opens example page
    When User fills payment form with defined card VISA_V22_3DS_SDK_STEP_UP_AUTH_FAILED
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User fills 3ds SDK challenge with THREE_DS_CODE and submit
    Then User will see notification frame text: "An error occurred"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | error         |
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: True
    And THREEDRESPONSE contains paramaters
      | key              | value                |
      | ActionCode       | FAILURE              |
      | ErrorNumber      | 1000                 |
      | ErrorDescription | Transaction rejected |

    Examples:
      | request_types            |
      | THREEDQUERY              |
      | ACCOUNTCHECK THREEDQUERY |
      | RISKDEC THREEDQUERY      |
