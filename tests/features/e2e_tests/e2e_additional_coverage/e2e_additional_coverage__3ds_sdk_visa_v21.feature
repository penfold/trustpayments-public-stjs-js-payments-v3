Feature: request type - 3ds SDK - full test coverage

  Scenario Outline: successful payment with only request types <request_types>  - frictionless
    Given JS library configured by inline params THREE_DS_SDK_BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value                          |
      | requesttypedescriptions | <request_types>                |
      | sitereference           | test_js_automated_tests_tp_3ds |
    And User opens example page
    When User fills payment form with defined card VISA_V21_3DS_SDK_FRICTIONLESS_SUCCESS
    And User clicks Pay button
    Then User will see payment status information: "Payment has been successfully processed"

   Examples:
    | request_types                                      |
    | AUTH                                               |
    | RISKDEC                                            |
    | THREEDQUERY                                        |
    | ACCOUNTCHECK                                       |
    | RISKDEC THREEDQUERY AUTH                           |
    | THREEDQUERY AUTH RISKDEC                           |
    | ACCOUNTCHECK THREEDQUERY                           |
    | ACCOUNTCHECK THREEDQUERY AUTH                      |
    | RISKDEC THREEDQUERY ACCOUNTCHECK                   |
    | RISKDEC THREEDQUERY                                |
    | RISKDEC ACCOUNTCHECK AUTH                          |
    | THREEDQUERY ACCOUNTCHECK                           |
    | THREEDQUERY AUTH                                   |
    | RISKDEC ACCOUNTCHECK THREEDQUERY AUTH              |
    | RISKDEC AUTH                                       |
    | RISKDEC ACCOUNTCHECK THREEDQUERY                   |
    | ACCOUNTCHECK AUTH                                  |
    | RISKDEC ACCOUNTCHECK                               |
    | AUTH RISKDEC                                       |


  Scenario Outline: successful payment with only request types <request_types> - frictionless
    Given JS library configured by inline params THREE_DS_SDK_BASIC_CONFIG and jwt JWT_WITH_SUBSCRIPTION with additional attributes
      | key                     | value                          |
      | requesttypedescriptions | <request_types>                |
      | sitereference           | test_js_automated_tests_tp_3ds |
    And User opens example page
    When User fills payment form with defined card VISA_V21_3DS_SDK_FRICTIONLESS_SUCCESS
    And User clicks Pay button
    Then User will see payment status information: "Payment has been successfully processed"

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


  Scenario Outline: successful payment with only request types <request_types> - non-frictionless
   Given JS library configured by inline params THREE_DS_SDK_BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value                          |
      | requesttypedescriptions | <request_types>                |
      | sitereference           | test_js_automated_tests_tp_3ds |
    And User opens example page
    When User fills payment form with defined card VISA_V21_3DS_SDK_NON_FRICTIONLESS
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User fills 3ds SDK challenge with THREE_DS_CODE and submit
    Then User will see payment status information: "Payment has been successfully processed"

    Examples:
    | request_types                                      |
    | THREEDQUERY                                        |
    | RISKDEC THREEDQUERY AUTH                           |
    | THREEDQUERY AUTH RISKDEC                           |
    | ACCOUNTCHECK THREEDQUERY                           |
    | ACCOUNTCHECK THREEDQUERY AUTH                      |
    | RISKDEC THREEDQUERY ACCOUNTCHECK                   |
    | RISKDEC THREEDQUERY                                |
    | THREEDQUERY ACCOUNTCHECK                           |
    | THREEDQUERY AUTH                                   |
    | RISKDEC ACCOUNTCHECK THREEDQUERY AUTH              |
    | RISKDEC ACCOUNTCHECK THREEDQUERY                   |


   Scenario Outline: unsuccessful payment with only request types <request_types> - non-frictionless
    Given JS library configured by inline params THREE_DS_SDK_BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value                          |
      | requesttypedescriptions | <request_types>                |
      | sitereference           | test_js_automated_tests_tp_3ds |
    And User opens example page
    When User fills payment form with defined card VISA_V21_3DS_SDK_STEP_UP_AUTH_ERROR
    And User clicks Pay button
    And User see 3ds SDK challenge is displayed
    And User fills 3ds SDK challenge with THREE_DS_CODE and submit
    Then User will see payment status information: "An error occurred"

    Examples:
    | request_types                                      |
    | THREEDQUERY                                        |
    | RISKDEC THREEDQUERY AUTH                           |
    | THREEDQUERY AUTH RISKDEC                           |
    | ACCOUNTCHECK THREEDQUERY                           |
    | ACCOUNTCHECK THREEDQUERY AUTH                      |
    | RISKDEC THREEDQUERY ACCOUNTCHECK                   |
    | RISKDEC THREEDQUERY                                |
    | THREEDQUERY ACCOUNTCHECK                           |
    | THREEDQUERY AUTH                                   |
    | RISKDEC ACCOUNTCHECK THREEDQUERY AUTH              |
    | RISKDEC ACCOUNTCHECK THREEDQUERY                   |
