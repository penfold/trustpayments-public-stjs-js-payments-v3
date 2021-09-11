# commented on for the next official gateway release
#
#Feature: cachetoken with request types - full test coverage
#
#  Background:
#    Given JS library configured by inline params SUBMIT_ON_SUCCESS_CACHETOKEN_FIELD and jwt BASE_JWT with additional attributes
#      | key                     | value         |
#      | requesttypedescriptions | CACHETOKENISE |
#    And User opens example page
#
#
#  Scenario Outline: successful payment with cachetoken and request types <request_types> - frictionless
#    Given User fills payment form with defined card VISA_V21_FRICTIONLESS
#    And User clicks Pay button
#    And User gets cachetoken value from url
#    And JS library configured by inline params START_ON_LOAD_CONFIG and jwt BASE_JWT with additional attributes
#      | key                     | value            |
#      | requesttypedescriptions | <request_types>  |
#      | cachetoken              | cachetoken_value |
#    When User opens example page WITHOUT_SUBMIT_BUTTON
#    Then User will see notification frame text: "Payment has been successfully processed"
#    And "submit" callback is called only once
#    And "success" callback is called only once
#
#    Examples:
#      | request_types                         |
#      | AUTH                                  |
#      | RISKDEC                               |
#      | THREEDQUERY                           |
#      | ACCOUNTCHECK                          |
#      | RISKDEC THREEDQUERY AUTH              |
#      | THREEDQUERY AUTH RISKDEC              |
#      | ACCOUNTCHECK THREEDQUERY              |
#      | ACCOUNTCHECK THREEDQUERY AUTH         |
#      | RISKDEC THREEDQUERY ACCOUNTCHECK      |
#      | RISKDEC THREEDQUERY                   |
#      | RISKDEC ACCOUNTCHECK AUTH             |
#      | THREEDQUERY ACCOUNTCHECK              |
#      | THREEDQUERY AUTH                      |
#      | RISKDEC ACCOUNTCHECK THREEDQUERY AUTH |
#      | RISKDEC AUTH                          |
#      | RISKDEC ACCOUNTCHECK THREEDQUERY      |
#      | ACCOUNTCHECK AUTH                     |
#      | RISKDEC ACCOUNTCHECK                  |
#      | AUTH RISKDEC                          |
#
#
#  Scenario Outline: successful payment with cachetoken and request types <request_types> - frictionless
#    Given User fills payment form with defined card VISA_V21_FRICTIONLESS
#    And User clicks Pay button
#    And User gets cachetoken value from url
#    And JS library configured by inline params START_ON_LOAD_CONFIG and jwt JWT_WITH_SUBSCRIPTION with additional attributes
#      | key                     | value            |
#      | requesttypedescriptions | <request_types>  |
#      | cachetoken              | cachetoken_value |
#    When User opens example page WITHOUT_SUBMIT_BUTTON
#    Then User will see notification frame text: "Payment has been successfully processed"
#    And "submit" callback is called only once
#    And "success" callback is called only once
#
#    Examples:
#      | request_types                                      |
#      | RISKDEC ACCOUNTCHECK AUTH SUBSCRIPTION             |
#      | THREEDQUERY AUTH SUBSCRIPTION                      |
#      | RISKDEC THREEDQUERY AUTH SUBSCRIPTION              |
#      | ACCOUNTCHECK SUBSCRIPTION                          |
#      | ACCOUNTCHECK AUTH SUBSCRIPTION                     |
#      | RISKDEC AUTH SUBSCRIPTION                          |
#      | THREEDQUERY ACCOUNTCHECK SUBSCRIPTION              |
#      | AUTH SUBSCRIPTION                                  |
#      | ACCOUNTCHECK THREEDQUERY AUTH SUBSCRIPTION         |
#      | RISKDEC ACCOUNTCHECK THREEDQUERY AUTH SUBSCRIPTION |
#      | RISKDEC THREEDQUERY ACCOUNTCHECK SUBSCRIPTION      |
#
#
#  Scenario Outline: successful payment with cachetoken and request types <request_types> - non-frictionless
#    Given User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
#    And User clicks Pay button
#    And User gets cachetoken value from url
#    And JS library configured by inline params START_ON_LOAD_CONFIG and jwt BASE_JWT with additional attributes
#      | key                     | value            |
#      | requesttypedescriptions | <request_types>  |
#      | cachetoken              | cachetoken_value |
#    When User opens example page WITHOUT_SUBMIT_BUTTON
#    And User fills V2 authentication modal
#    Then User will see notification frame text: "Payment has been successfully processed"
#    And "submit" callback is called only once
#    And "success" callback is called only once
#
#    Examples:
#      | request_types                         |
#      | THREEDQUERY                           |
#      | RISKDEC THREEDQUERY AUTH              |
#      | THREEDQUERY AUTH RISKDEC              |
#      | ACCOUNTCHECK THREEDQUERY              |
#      | ACCOUNTCHECK THREEDQUERY AUTH         |
#      | RISKDEC THREEDQUERY ACCOUNTCHECK      |
#      | RISKDEC THREEDQUERY                   |
#      | THREEDQUERY ACCOUNTCHECK              |
#      | THREEDQUERY AUTH                      |
#      | RISKDEC ACCOUNTCHECK THREEDQUERY AUTH |
#      | RISKDEC ACCOUNTCHECK THREEDQUERY      |
#
#
#  Scenario Outline: successful payment with cachetoken and request types <request_types> - non-frictionless
#    Given User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
#    And User clicks Pay button
#    And User gets cachetoken value from url
#    Given JS library configured by inline params START_ON_LOAD_CONFIG and jwt BASE_JWT with additional attributes
#      | key                     | value            |
#      | requesttypedescriptions | <request_types>  |
#      | cachetoken              | cachetoken_value |
#    When User opens example page WITHOUT_SUBMIT_BUTTON
#    Then User will see notification frame text: "Payment has been successfully processed"
#    And "submit" callback is called only once
#    And "success" callback is called only once
#
#    Examples:
#      | request_types             |
#      | AUTH                      |
#      | RISKDEC                   |
#      | ACCOUNTCHECK              |
#      | RISKDEC AUTH              |
#      | ACCOUNTCHECK AUTH         |
#      | RISKDEC ACCOUNTCHECK      |
#      | AUTH RISKDEC              |
#      | RISKDEC ACCOUNTCHECK AUTH |
