Feature: E2E Card Payments with cachetoken
  As a user
  I want to use cachetoken from previous payment
  In order to execute payment without card data


  Scenario: Proper receiving cachetoken value from url param
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key             | value      |
      | submitOnSuccess | true       |
      | submitFields    | cachetoken |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value         |
      | requesttypedescriptions | CACHETOKENISE |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_SUCCESSFUL_AUTH_CARD
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key        | value              |
      | jwt        | should not be none |
      | cachetoken | should not be none |

  Scenario: Proper receiving cachetoken value from url param with enabled startOnLoad option
    Given JS library configured with START_ON_LOAD_CONFIG and additional attributes
      | key             | value      |
      | submitOnSuccess | true       |
      | submitFields    | cachetoken |
    And JS library authenticated by jwt JWT_WITH_FRICTIONLESS_CARD with additional attributes
      | key                     | value         |
      | requesttypedescriptions | CACHETOKENISE |
    When User opens example page
    Then User will be sent to page with url "www.example.com" having params
      | key        | value              |
      | jwt        | should not be none |
      | cachetoken | should not be none |

#  STJS-1278
#
#  Scenario: Successful payment with cachetoken, startOnLoad and AUTH requestType - non-frictionless card
#    Given JS library configured with BASIC_CONFIG and additional attributes
#      | key             | value      |
#      | submitOnSuccess | true       |
#      | submitFields    | cachetoken |
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value         |
#      | requesttypedescriptions | CACHETOKENISE |
#    And User opens example page
#    And User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
#    And User clicks Pay button
#    And User gets cachetoken value from url
#    And JS library configured by inline params START_ON_LOAD_CONFIG and jwt BASE_JWT with additional attributes
#      | key                     | value            |
#      | requesttypedescriptions | AUTH             |
#      | cachetoken              | cachetoken_value |
#    When User opens example page WITHOUT_SUBMIT_BUTTON
#    Then User will see notification frame text: "Payment has been successfully processed"
#    And User will see following callback type called only once
#      | callback_type |
#      | submit        |
#      | error         |
#
#  STJS-1278
#
#  Scenario: Successful payment with cachetoken, startOnLoad and AUTH requestType - frictionless card
#    Given JS library configured with BASIC_CONFIG and additional attributes
#      | key             | value      |
#      | submitOnSuccess | true       |
#      | submitFields    | cachetoken |
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value         |
#      | requesttypedescriptions | CACHETOKENISE |
#    And User opens example page
#    And User fills payment form with defined card VISA_V21_FRICTIONLESS
#    And User clicks Pay button
#    And User gets cachetoken value from url
#    And JS library configured by inline params START_ON_LOAD_CONFIG and jwt BASE_JWT with additional attributes
#      | key                     | value            |
#      | requesttypedescriptions | AUTH             |
#      | cachetoken              | cachetoken_value |
#    When User opens example page WITHOUT_SUBMIT_BUTTON
#    Then User will see notification frame text: "Payment has been successfully processed"
#    And User will see following callback type called only once
#      | callback_type |
#      | submit        |
#      | error         |
#
#  STJS-1278
#
#  Scenario: Declined payment with cachetoken, startOnLoad and AUTH requestType - frictionless card
#    Given JS library configured with BASIC_CONFIG and additional attributes
#      | key             | value      |
#      | submitOnSuccess | true       |
#      | submitFields    | cachetoken |
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value         |
#      | requesttypedescriptions | CACHETOKENISE |
#    And User opens example page
#    And User fills payment form with defined card VISA_V21_FRICTIONLESS
#    And User clicks Pay button
#    And User gets cachetoken value from url
#    And JS library configured by inline params START_ON_LOAD_CONFIG and jwt BASE_JWT with additional attributes
#      | key                     | value            |
#      | requesttypedescriptions | AUTH             |
#      | cachetoken              | cachetoken_value |
#      | baseamount              | 70000            |
#    When User opens example page WITHOUT_SUBMIT_BUTTON
#    Then User will see notification frame text: "Decline"
#    And User will see following callback type called only once
#      | callback_type |
#      | submit        |
#      | error         |
#
#  STJS-1278
#
#  Scenario: Successful payment with cachetoken, submitOnSuccess, startOnLoad and AUTH requestType
#    Given JS library configured with BASIC_CONFIG and additional attributes
#      | key             | value      |
#      | submitOnSuccess | true       |
#      | submitFields    | cachetoken |
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value         |
#      | requesttypedescriptions | CACHETOKENISE |
#    And User opens example page
#    And User fills payment form with defined card VISA_V21_FRICTIONLESS
#    And User clicks Pay button
#    And User gets cachetoken value from url
#    Given JS library configured with START_ON_LOAD_CONFIG and additional attributes
#      | key             | value |
#      | submitOnSuccess | true  |
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value            |
#      | requesttypedescriptions | AUTH             |
#      | cachetoken              | cachetoken_value |
#    When User opens example page WITHOUT_SUBMIT_BUTTON
#    Then User will be sent to page with url "www.example.com" having params
#      | key                  | value                                   |
#      | errormessage         | Payment has been successfully processed |
#      | baseamount           | 1000                                    |
#      | currencyiso3a        | GBP                                     |
#      | errorcode            | 0                                       |
#      | settlestatus         | 0                                       |
#      | transactionreference | should not be none                      |
#      | jwt                  | should not be none                      |
#
#  STJS-1278
#
#  Scenario: Declined payment with cachetoken, submitOnError, startOnLoad and AUTH requestType
#    Given JS library configured with BASIC_CONFIG and additional attributes
#      | key             | value      |
#      | submitOnSuccess | true       |
#      | submitFields    | cachetoken |
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value         |
#      | requesttypedescriptions | CACHETOKENISE |
#    And User opens example page
#    And User fills payment form with defined card VISA_V21_FRICTIONLESS
#    And User clicks Pay button
#    And User gets cachetoken value from url
#    Given JS library configured with START_ON_LOAD_CONFIG and additional attributes
#      | key           | value |
#      | submitOnError | true  |
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value            |
#      | requesttypedescriptions | AUTH             |
#      | cachetoken              | cachetoken_value |
#      | baseamount              | 70000            |
#    When User opens example page WITHOUT_SUBMIT_BUTTON
#    Then User will be sent to page with url "www.example.com" having params
#      | key                  | value              |
#      | errormessage         | Decline            |
#      | baseamount           | 70000              |
#      | currencyiso3a        | GBP                |
#      | errorcode            | 70000              |
#      | settlestatus         | 3                  |
#      | transactionreference | should not be none |
#      | jwt                  | should not be none |
#
#  STJS-1278
#
#  Scenario: Successful payment with cachetoken and bypassCard
#    Given User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
#    And User clicks Pay button
#    And User gets cachetoken value from url
#    And JS library configured by inline params START_ON_LOAD_CONFIG and jwt BASE_JWT with additional attributes
#      | key                      | value            |
#      | requesttypedescriptions  | THREEDQUERY AUTH |
#      | cachetoken               | cachetoken_value |
#      | threedbypasspaymenttypes | VISA             |
#    When User opens example page WITHOUT_SUBMIT_BUTTON
#    Then User will see notification frame text: "Payment has been successfully processed"
#    And User will see following callback type called only once
#      | callback_type |
#      | submit        |
#      | error         |
#
#  STJS-1278
#
#  Scenario Outline: Successful payment with cachetoken and requestTypes: <request_types>
#    Given User fills payment form with defined card VISA_V21_FRICTIONLESS
#    And User clicks Pay button
#    And User gets cachetoken value from url
#    And JS library configured by inline params START_ON_LOAD_CONFIG and jwt BASE_JWT with additional attributes
#      | key                     | value            |
#      | requesttypedescriptions | <request_types>  |
#      | cachetoken              | cachetoken_value |
#    When User opens example page WITHOUT_SUBMIT_BUTTON
#    Then User will see notification frame text: "Payment has been successfully processed"
#    And User will see following callback type called only once
#      | callback_type |
#      | submit        |
#      | error         |
#    Examples:
#      | request_types            |
#      | THREEDQUERY              |
#      | AUTH                     |
#      | ACCOUNTCHECK THREEDQUERY |
#
#  STJS-1278
#
#  Scenario: Successful payment with cachetoken, submitOnSuccess and request type: ACCOUNTCHECK THREEDQUERY
#    Given User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
#    And User clicks Pay button
#    And User gets cachetoken value from url
#    And JS library configured with START_ON_LOAD_CONFIG and additional attributes
#      | key             | value |
#      | submitOnSuccess | true  |
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value                    |
#      | requesttypedescriptions | ACCOUNTCHECK THREEDQUERY |
#      | cachetoken              | cachetoken_value         |
#    When User opens example page WITHOUT_SUBMIT_BUTTON
#    And User fills V2 authentication modal
#    Then User will be sent to page with url "www.example.com" having params
#      | key                  | value                                   |
#      | errormessage         | Payment has been successfully processed |
#      | errorcode            | 0                                       |
#      | enrolled             | Y                                       |
#      | settlestatus         | 0                                       |
#      | transactionreference | should not be none                      |
#      | jwt                  | should not be none                      |
#      | threedresponse       | should not be none                      |
#
#  STJS-1278
#
#  Scenario Outline: Cancel Cardinal popup with cachetoken, submitOnError and request type: <request_types>
#    Given User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
#    And User clicks Pay button
#    And User gets cachetoken value from url
#    Given JS library configured with START_ON_LOAD_CONFIG and additional attributes
#      | key           | value |
#      | submitOnError | true  |
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value            |
#      | requesttypedescriptions | <request_types>  |
#      | cachetoken              | cachetoken_value |
#    And User opens example page
#    And User clicks Cancel button on authentication modal
#    Then User will be sent to page with url "www.example.com" having params
#      | key            | value              |
#      | errormessage   | An error occurred  |
#      | enrolled       | Y                  |
#      | settlestatus   | 0                  |
#      | errorcode      | 50003              |
#      | threedresponse | <threedresponse>   |
#      | jwt            | should not be none |
#
#    Examples:
#      | request_types            | threedresponse     |
#      | THREEDQUERY AUTH         | should be none     |
#      | ACCOUNTCHECK THREEDQUERY | should not be none |
#
#  STJS-1278
#
#  Scenario Outline: Invalid combination of request types: <request_types>
#    Given JS library configured with BASIC_CONFIG and additional attributes
#      | key             | value      |
#      | submitOnSuccess | true       |
#      | submitFields    | cachetoken |
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value           |
#      | requesttypedescriptions | <request_types> |
#    And User opens example page
#    When User fills payment form with defined card MASTERCARD_SUCCESSFUL_AUTH_CARD
#    And User clicks Pay button
#    Then User will see notification frame text: "Invalid field"
#    And User will see following callback type called only once
#      | callback_type |
#      | submit        |
#      | error         |
#
#    Examples:
#      | request_types              |
#      | THREEDQUERY CACHETOKENISE  |
#      | CACHETOKENISE AUTH         |
#      | ACCOUNTCHECK CACHETOKENISE |
