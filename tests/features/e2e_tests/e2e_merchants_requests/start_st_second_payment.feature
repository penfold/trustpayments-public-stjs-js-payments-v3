@merchant_feature_start_st
Feature: Start ST instance
  As a merchant
  I should be able to Start ST instance and start it again without error

  Scenario Outline: Start ST instance and retry payment with NON_FRICTIONLESS card
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    And User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    And User fills V2 authentication modal
    And User will see notification frame text: "Payment has been successfully processed"
    And Wait for popups to disappear
    And User toggle action buttons bar
    And User clicks Start ST action button
    And User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    When User clicks Pay button
    And User fills V2 authentication modal
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: <threedresponse_defined>

    Examples:
      | request_types            | threedresponse_defined |
      | THREEDQUERY AUTH         | False                  |
      | ACCOUNTCHECK THREEDQUERY | True                   |

  Scenario Outline: Start ST instance and retry payment with NON_FRICTIONLESS card
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    And User fills payment form with defined card VISA_V22_ERROR_ON_AUTH
    And User clicks Pay button
    And User fills V2 authentication modal
    And User will see notification frame text: "An error occurred"
    And Wait for popups to disappear
    And User toggle action buttons bar
    And User clicks Start ST action button
    And User fills payment form with defined card VISA_V22_STEP_UP_AUTH_FAILED
    When User clicks Pay button
    And User fills V2 authentication modal
    Then User will see notification frame text: "An error occurred"
    And User will see following callback type called only once
      | callback_type |
      | error         |
      | submit        |
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: True

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |

  Scenario Outline: Start ST instance and retry payment with FRICTIONLESS card - redirect params verification
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key             | value |
      | submitOnSuccess | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    And User fills payment form with defined card VISA_V22_STEP_UP_AUTH_FAILED
    And User clicks Pay button
    And User fills V2 authentication modal
    And User will see notification frame text: "An error occurred"
    And Wait for popups to disappear
    And User toggle action buttons bar
    And User clicks Start ST action button
    And User fills payment form with defined card MASTERCARD_FRICTIONLESS
    When User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
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
      | request_types            | baseamount         | currencyiso3a      | eci                | threedresponse |
      | THREEDQUERY AUTH         | should not be none | should not be none | should not be none | should be none |
      | ACCOUNTCHECK THREEDQUERY | should be none     | should be none     | should be none     | should be none |

  Scenario Outline: Start ST instance and retry payment with NON_FRICTIONLESS card - startOnLoad payment
    Given JS library configured by inline params START_ON_LOAD_CONFIG and jwt JWT_WITH_NON_FRICTIONLESS_CARD with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    And User fills V2 authentication modal
    And User will see notification frame text: "Payment has been successfully processed"
    And Wait for popups to disappear
    And User toggle action buttons bar
    When User clicks Start ST action button
    And User fills V2 authentication modal
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: <threedresponse_defined>

    Examples:
      | request_types            | threedresponse_defined |
      | THREEDQUERY AUTH         | False                  |
      | ACCOUNTCHECK THREEDQUERY | True                   |
