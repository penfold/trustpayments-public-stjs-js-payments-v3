Feature: request type + start on load - full test coverage


  Scenario Outline: successful payment with request types <request_types> and start on load - frictionless
    Given JS library configured by inline params START_ON_LOAD_CONFIG and jwt JWT_WITH_FRICTIONLESS_CARD with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    When User opens example page WITHOUT_SUBMIT_BUTTON
    Then User will see notification frame text: "Payment has been successfully processed"
    And "submit" callback is called only once
    And "success" callback is called only once
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: False

    Examples:
      | request_types                         |
      | AUTH                                  |
      | RISKDEC                               |
      | THREEDQUERY                           |
      | ACCOUNTCHECK                          |
      | RISKDEC THREEDQUERY AUTH              |
      | THREEDQUERY AUTH RISKDEC              |
      | ACCOUNTCHECK THREEDQUERY              |
      | ACCOUNTCHECK THREEDQUERY AUTH         |
      | RISKDEC THREEDQUERY ACCOUNTCHECK      |
      | RISKDEC THREEDQUERY                   |
      | RISKDEC ACCOUNTCHECK AUTH             |
      | THREEDQUERY ACCOUNTCHECK              |
      | THREEDQUERY AUTH                      |
      | RISKDEC ACCOUNTCHECK THREEDQUERY AUTH |
      | RISKDEC AUTH                          |
      | RISKDEC ACCOUNTCHECK THREEDQUERY      |
      | ACCOUNTCHECK AUTH                     |
      | RISKDEC ACCOUNTCHECK                  |
      | AUTH RISKDEC                          |


  Scenario Outline: successful payment request types <request_types> and start on load - frictionless
    Given JS library configured by inline params START_ON_LOAD_CONFIG and jwt JWT_WITH_FRICTIONLESS_CARD_SUBSCRIPTION with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    When User opens example page WITHOUT_SUBMIT_BUTTON
    Then User will see notification frame text: "Payment has been successfully processed"
    And "submit" callback is called only once
    And "success" callback is called only once
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: False

    Examples:
      | request_types                                      |
      | RISKDEC ACCOUNTCHECK AUTH SUBSCRIPTION             |
      | THREEDQUERY AUTH SUBSCRIPTION                      |
      | RISKDEC THREEDQUERY AUTH SUBSCRIPTION              |
      | ACCOUNTCHECK SUBSCRIPTION                          |
      | ACCOUNTCHECK AUTH SUBSCRIPTION                     |
      | RISKDEC AUTH SUBSCRIPTION                          |
      | THREEDQUERY ACCOUNTCHECK SUBSCRIPTION              |
      | AUTH SUBSCRIPTION                                  |
      | ACCOUNTCHECK THREEDQUERY AUTH SUBSCRIPTION         |
      | RISKDEC ACCOUNTCHECK THREEDQUERY AUTH SUBSCRIPTION |
      | RISKDEC THREEDQUERY ACCOUNTCHECK SUBSCRIPTION      |


  Scenario Outline: successful payment with request types <request_types> and start on load - non-frictionless
    Given JS library configured by inline params START_ON_LOAD_CONFIG and jwt JWT_WITH_NON_FRICTIONLESS_CARD with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    When User opens example page WITHOUT_SUBMIT_BUTTON
    And User fills V2 authentication modal
    Then User will see notification frame text: "Payment has been successfully processed"
    And "submit" callback is called only once
    And "success" callback is called only once
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: <threedresponse_defined>

    Examples:
      | request_types                         | threedresponse_defined |
      | THREEDQUERY                           | True                   |
      | RISKDEC THREEDQUERY AUTH              | False                  |
      | THREEDQUERY AUTH RISKDEC              | False                  |
      | ACCOUNTCHECK THREEDQUERY              | True                   |
      | ACCOUNTCHECK THREEDQUERY AUTH         | False                  |
      | RISKDEC THREEDQUERY ACCOUNTCHECK      | False                  |
      | RISKDEC THREEDQUERY                   | True                   |
      | THREEDQUERY ACCOUNTCHECK              | False                  |
      | THREEDQUERY AUTH                      | False                  |
      | RISKDEC ACCOUNTCHECK THREEDQUERY AUTH | False                  |
      | RISKDEC ACCOUNTCHECK THREEDQUERY      | True                   |


  Scenario Outline: successful payment with request types <request_types> and start on load - non-frictionless
    Given JS library configured by inline params START_ON_LOAD_CONFIG and jwt JWT_WITH_NON_FRICTIONLESS_CARD with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    When User opens example page WITHOUT_SUBMIT_BUTTON
    Then User will see notification frame text: "Payment has been successfully processed"
    And "submit" callback is called only once
    And "success" callback is called only once
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: False

    Examples:
      | request_types             |
      | AUTH                      |
      | RISKDEC                   |
      | ACCOUNTCHECK              |
      | RISKDEC AUTH              |
      | ACCOUNTCHECK AUTH         |
      | RISKDEC ACCOUNTCHECK      |
      | AUTH RISKDEC              |
      | RISKDEC ACCOUNTCHECK AUTH |


  Scenario Outline: successful payment with request types <request_types> and start on load - non-frictionless
    Given JS library configured by inline params START_ON_LOAD_CONFIG and jwt JWT_NON_FRICTIONLESS_CARD_SUBSCRIPTION with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    When User opens example page WITHOUT_SUBMIT_BUTTON
    And User fills V2 authentication modal
    Then User will see notification frame text: "Payment has been successfully processed"
    And "submit" callback is called only once
    And "success" callback is called only once
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: False

    Examples:
      | request_types                                      |
      | THREEDQUERY AUTH SUBSCRIPTION                      |
      | RISKDEC THREEDQUERY AUTH SUBSCRIPTION              |
      | THREEDQUERY ACCOUNTCHECK SUBSCRIPTION              |
      | ACCOUNTCHECK THREEDQUERY AUTH SUBSCRIPTION         |
      | RISKDEC ACCOUNTCHECK THREEDQUERY AUTH SUBSCRIPTION |
      | RISKDEC THREEDQUERY ACCOUNTCHECK SUBSCRIPTION      |


  Scenario Outline: successful payment with request types <request_types> and start on load - non-frictionless
    Given JS library configured by inline params START_ON_LOAD_CONFIG and jwt JWT_NON_FRICTIONLESS_CARD_SUBSCRIPTION with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    When User opens example page WITHOUT_SUBMIT_BUTTON
    Then User will see notification frame text: "Payment has been successfully processed"
    And "submit" callback is called only once
    And "success" callback is called only once
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: False

    Examples:
      | request_types                          |
      | RISKDEC ACCOUNTCHECK AUTH SUBSCRIPTION |
      | ACCOUNTCHECK SUBSCRIPTION              |
      | ACCOUNTCHECK AUTH SUBSCRIPTION         |
      | RISKDEC AUTH SUBSCRIPTION              |
      | AUTH SUBSCRIPTION                      |


  Scenario: Unsuccessful payment with request types: THREEDQUERY AUTH - non-frictionless
    Given JS library configured by inline params START_ON_LOAD_CONFIG and jwt JWT_FAILED_NON_FRICTIONLESS_CARD with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    When User opens example page WITHOUT_SUBMIT_BUTTON
    And User fills V2 authentication modal
    Then User will see notification frame text: "An error occurred"
    And "submit" callback is called only once
    And "error" callback is called only once
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: True
