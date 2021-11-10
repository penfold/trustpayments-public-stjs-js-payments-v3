Feature: Visa Checkout
  As a user
  I want to use Visa Checkout payment method
  In order to check full payment functionality


  @visa_test
  Scenario Outline: Visa Checkout - checking payment status for <action_code> response code
    Given JS library configured by inline params VISA_CHECKOUT_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And Visa Checkout mock responses are set as BASE_JSINIT and payment status <action_code>
    And User opens example page
    When User chooses VISA_CHECKOUT as payment method
    Then User will see notification frame text: "<payment_status_message>"
    And User will see that notification frame has "<color>" color
    And User will see following callback type called only once
      | callback_type |
      | <callback>    |
      | submit        |
    And following requests were sent only once
      | request_type      |
      | VISA_CHECKOUT     |
      | THREEDQUERY, AUTH |
#    And submit callback contains JWT response

    @smoke_mock_test @visa_checkout_smoke_test
    Examples:
      | action_code | payment_status_message                  | color | callback |
      | SUCCESS     | Payment has been successfully processed | green | success  |
    Examples:
      | action_code | payment_status_message | color | callback |
      | ERROR       | An error occurred      | red   | error    |

  @visa_test
  Scenario: Visa Checkout - successful payment with enabled 'submitOnSuccess' process
    Given JS library configured with VISA_CHECKOUT_CONFIG and additional attributes
      | key             | value |
      | submitOnSuccess | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And Visa Checkout mock responses are set as BASE_JSINIT and payment status SUCCESS
    And User opens example page
    When User fills merchant data with name "John Test", email "test@example", phone "44422224444"
    And User chooses VISA_CHECKOUT as payment method
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | errorcode            | 0                                       |
      | myBillName           | John Test                               |
      | myBillEmail          | test@example                            |
      | myBillTel            | 44422224444                             |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | settlestatus         | 0                                       |
      | baseamount           | 1000                                    |
      | currencyiso3a        | GBP                                     |

  @visa_test
  Scenario: Visa Checkout - successful payment - checking that 'submitOnSuccess' is enabled by default
    Given JS library configured by inline params VISA_CHECKOUT_DEFAULT_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And Visa Checkout mock responses are set as BASE_JSINIT and payment status SUCCESS
    And User opens example page
    When User fills merchant data with name "John Test", email "test@example", phone "44422224444"
    And User chooses VISA_CHECKOUT as payment method
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | errorcode            | 0                                       |
      | myBillName           | John Test                               |
      | myBillEmail          | test@example                            |
      | myBillTel            | 44422224444                             |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | settlestatus         | 0                                       |
      | baseamount           | 1000                                    |
      | currencyiso3a        | GBP                                     |
    And following requests were sent only once
      | request_type      |
      | VISA_CHECKOUT     |
      | THREEDQUERY, AUTH |

  @visa_test
  Scenario: Visa Checkout - error payment with enabled 'submitOnError' process
    Given JS library configured with VISA_CHECKOUT_CONFIG and additional attributes
      | key           | value |
      | submitOnError | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And Visa Checkout mock responses are set as BASE_JSINIT and payment status ERROR
    And User opens example page
    When User chooses VISA_CHECKOUT as payment method
    Then User will be sent to page with url "www.example.com" having params
      | key          | value            |
      | errormessage | Invalid response |
      | errorcode    | 50003            |

  @visa_test
  Scenario: Visa Checkout - error payment with disabled 'submitOnError' process
    Given JS library configured with VISA_CHECKOUT_CONFIG and additional attributes
      | key           | value |
      | submitOnError | false |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And Visa Checkout mock responses are set as BASE_JSINIT and payment status ERROR
    And User opens example page
    When User chooses VISA_CHECKOUT as payment method
    Then User remains on checkout page
    And User will see notification frame text: "An error occurred"
    And User will see that notification frame has "red" color
    And following requests were sent only once
      | request_type      |
      | VISA_CHECKOUT     |
      | THREEDQUERY, AUTH |

  @visa_test
  Scenario: Visa Checkout - error payment - checking that 'submitOnError' is disabled by default
    Given JS library configured by inline params VISA_CHECKOUT_DEFAULT_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And Visa Checkout mock responses are set as BASE_JSINIT and payment status ERROR
    And User opens example page
    When User chooses VISA_CHECKOUT as payment method
    Then User remains on checkout page
    And User will see notification frame text: "An error occurred"
    And User will see that notification frame has "red" color
    And following requests were sent only once
      | request_type      |
      | VISA_CHECKOUT     |
      | THREEDQUERY, AUTH |

  @visa_test
  Scenario: Visa Checkout - canceled payment with enabled 'submitOnCancel' process
    Given JS library configured with VISA_CHECKOUT_CONFIG and additional attributes
      | key            | value |
      | submitOnCancel | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And Visa Checkout mock responses are set as BASE_JSINIT and payment status CANCEL
    And User opens example page
    When User chooses VISA_CHECKOUT as payment method
    Then User will be sent to page with url "www.example.com" having params
      | key          | value                      |
      | errormessage | Payment has been cancelled |
      | errorcode    | cancelled                  |

  @visa_test
  Scenario: Visa Checkout - canceled payment with disabled 'submitOnCancel' process
    Given JS library configured with VISA_CHECKOUT_CONFIG and additional attributes
      | key            | value |
      | submitOnCancel | false |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And Visa Checkout mock responses are set as BASE_JSINIT and payment status CANCEL
    And User opens example page
    When User chooses VISA_CHECKOUT as payment method
    Then User remains on checkout page
    And User will see notification frame text: "Payment has been cancelled"
    And User will see that notification frame has "yellow" color

  @visa_test
  Scenario: Visa Checkout - canceled payment - checking that 'submitOnCancel' is disabled by default
    Given JS library configured by inline params VISA_CHECKOUT_DEFAULT_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And Visa Checkout mock responses are set as BASE_JSINIT and payment status CANCEL
    And User opens example page
    When User chooses VISA_CHECKOUT as payment method
    Then User remains on checkout page
    And User will see notification frame text: "Payment has been cancelled"
    And User will see that notification frame has "yellow" color

  @wallet_test @visa_test
  Scenario Outline: Visa Checkout - checking <callback> callback functionality
    Given JS library configured by inline params VISA_CHECKOUT_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And Visa Checkout mock responses are set as BASE_JSINIT and payment status <action_code>
    And User opens example page
    When User chooses VISA_CHECKOUT as payment method
    Then User will see "<callback>" popup
    And User will see following callback type called only once
      | callback_type |
      | <callback>    |
      | submit        |

    Examples:
      | action_code | callback |
      | SUCCESS     | success  |

    Examples:
      | action_code | callback |
      | ERROR       | error    |
      | CANCEL      | cancel   |

  @visa_test
  Scenario: Checking data type passing to callback function
    Given JS library configured by inline params VISA_CHECKOUT_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And Visa Checkout mock responses are set as BASE_JSINIT and payment status SUCCESS
    And User opens example page
    When User chooses VISA_CHECKOUT as payment method
    Then User will see correct error code displayed in popup
    And User will see following callback type called only once
      | callback_type |
      | submit        |

  @visa_test
  Scenario: Visa Checkout - successful payment VISA_CHECKOUT_CONFIG updated JWT
    Given JS library configured by inline params VISA_CHECKOUT_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And Visa Checkout mock responses are set as JSINIT_UPDATED_JWT and payment status SUCCESS
    And User opens page WITH_UPDATE_JWT and jwt BASE_UPDATED_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    When User calls updateJWT function by filling amount field
    And User chooses VISA_CHECKOUT as payment method
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And following requests were sent only once
      | request_type      |
      | VISA_CHECKOUT     |
      | THREEDQUERY, AUTH |
    And JSINIT requests contains updated jwt

  @smoke_mock_test @visa_test @visa_checkout_smoke_test
  Scenario: Visa Checkout - with submitOnSuccess and updated JWT
    Given JS library configured with VISA_CHECKOUT_CONFIG and additional attributes
      | key             | value |
      | submitOnSuccess | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And Visa Checkout mock responses are set as JSINIT_UPDATED_JWT and payment status SUCCESS
    And User opens page WITH_UPDATE_JWT and jwt BASE_UPDATED_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    When User fills merchant data with name "John Test", email "test@example", phone "44422224444"
    And User calls updateJWT function by filling amount field
    And User chooses VISA_CHECKOUT as payment method
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | errorcode            | 0                                       |
      | myBillName           | John Test                               |
      | myBillEmail          | test@example                            |
      | myBillTel            | 44422224444                             |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | settlestatus         | 0                                       |
#      | baseamount           | 2000                                    |
#      | currencyiso3a        | USD                                     |
    And following requests were sent only once
      | request_type      |
      | VISA_CHECKOUT     |
      | THREEDQUERY, AUTH |
    And JSINIT requests contains updated jwt

    #TODO - Cybertonica will be replaced by SEON
#  @visa_test
#  Scenario: Visa Checkout - Cybertonica - 'fraudcontroltransactionid' flag is added to AUTH requests during payment
#    Given JS library configured with VISA_CHECKOUT_CONFIG and additional attributes
#      | key               | value |
#      | cybertonicaApiKey | stfs  |
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value            |
#      | requesttypedescriptions | THREEDQUERY AUTH |
#    And Visa Checkout mock responses are set as BASE_JSINIT and payment status SUCCESS
#    And User opens example page
#    When User chooses VISA_CHECKOUT as payment method
#    Then User will see notification frame text: "Payment has been successfully processed"
#    And following requests were sent only once with 'fraudcontroltransactionid' flag
#      | request_type      |
#      | THREEDQUERY, AUTH |

    # TODO - uncomment this scenario when STJS-1924 will be fixed
#  @visa_test
#  Scenario: Visa Checkout - Cybertonica - 'fraudcontroltransactionid' flag is not added to AUTH requests during payment
#    Given JS library configured with VISA_CHECKOUT_CONFIG and additional attributes
#      | key               | value |
#      | cybertonicaApiKey | test  |
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value            |
#      | requesttypedescriptions | THREEDQUERY AUTH |
#    And Visa Checkout mock responses are set as BASE_JSINIT and payment status SUCCESS
#    And User opens example page
#    When User chooses VISA_CHECKOUT as payment method
#    Then User will see notification frame text: "Payment has been successfully processed"
#    And following requests were sent only once without 'fraudcontroltransactionid' flag
#      | request_type      |
#      | THREEDQUERY, AUTH |

  @parent_iframe @visa_test
  Scenario: Visa Checkout - successful payment when app is embedded in another iframe
    Given JS library configured by inline params VISA_CHECKOUT_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And Visa Checkout mock responses are set as BASE_JSINIT and payment status SUCCESS
    And User opens example page
    When User chooses VISA_CHECKOUT as payment method
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And following requests were sent only once
      | request_type      |
      | VISA_CHECKOUT     |
      | THREEDQUERY, AUTH |

  @visa_test @translations
  Scenario: Visa Checkout - translation for "Success" payment notification
    Given JS library configured by inline params VISA_CHECKOUT_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
      | locale                  | es_ES            |
    And Visa Checkout mock responses are set as BASE_JSINIT and payment status SUCCESS
    And User opens example page
    When User chooses VISA_CHECKOUT as payment method
    Then User will see payment notification text: "Payment has been successfully processed" translated into "es_ES"

  @visa_test @translations
  Scenario: Visa Checkout - check translation overwriting mechanism
    Given JS library configured by inline params WALLETS_CUSTOM_TRANSLATION_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And Visa Checkout mock responses are set as BASE_JSINIT and payment status ERROR
    And User opens example page
    When User chooses VISA_CHECKOUT as payment method
    Then User will see notification frame text: "NOTIFICATION_ERROR_TRANSLATION_OVERRIDE"
    And User will see that notification frame has "red" color

  @visa_test
  Scenario: Visa Checkout - notification frame is not displayed after successful payment
    Given JS library configured with VISA_CHECKOUT_CONFIG and additional attributes
      | key                 | value |
      | disableNotification | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And Visa Checkout mock responses are set as BASE_JSINIT and payment status SUCCESS
    And User opens example page
    When User chooses VISA_CHECKOUT as payment method
    Then User will not see notification frame

  @visa_test
  Scenario: Visa Checkout - notification frame is not displayed after declined payment
    Given JS library configured with VISA_CHECKOUT_CONFIG and additional attributes
      | key                 | value |
      | disableNotification | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And Visa Checkout mock responses are set as BASE_JSINIT and payment status ERROR
    And User opens example page
    When User chooses VISA_CHECKOUT as payment method
    Then User will not see notification frame

  @visa_test
  Scenario: Visa Checkout - notification frame is displayed after payment if disableNotification is false
    Given JS library configured with VISA_CHECKOUT_CONFIG and additional attributes
      | key                 | value |
      | disableNotification | false |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And Visa Checkout mock responses are set as BASE_JSINIT and payment status SUCCESS
    And User opens example page
    When User chooses VISA_CHECKOUT as payment method
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color

  @visa_test
  Scenario: Visa Checkout - successful payment with additional request types: AUTH
    Given JS library configured by inline params VISA_CHECKOUT_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And Visa Checkout mock responses are set as JSINIT_AUTH and request type AUTH
    And User opens example page
    When User chooses VISA_CHECKOUT as payment method
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |
    And following requests were sent only once
      | request_type  |
      | VISA_CHECKOUT |
      | AUTH          |

  @visa_test
  Scenario: Visa Checkout - successful payment with additional request types: ACCOUNTCHECK, AUTH
    Given JS library configured by inline params VISA_CHECKOUT_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value             |
      | requesttypedescriptions | ACCOUNTCHECK AUTH |
    And Visa Checkout mock responses are set as JSINIT_ACHECK_AUTH and request type ACCOUNTCHECK, AUTH
    And User opens example page
    When User chooses VISA_CHECKOUT as payment method
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |
    And following requests were sent only once
      | request_type       |
      | VISA_CHECKOUT      |
      | ACCOUNTCHECK, AUTH |

  @visa_test
  Scenario: Visa Checkout - successful payment with additional request types: ACCOUNTCHECK
    Given JS library configured by inline params VISA_CHECKOUT_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value        |
      | requesttypedescriptions | ACCOUNTCHECK |
    And Visa Checkout mock responses are set as JSINIT_ACHECK and request type ACCOUNTCHECK
    And User opens example page
    When User chooses VISA_CHECKOUT as payment method
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |
    And following requests were sent only once
      | request_type  |
      | VISA_CHECKOUT |
      | ACCOUNTCHECK  |

  @visa_test
  Scenario: Visa Checkout - successful payment with additional request types: RISKDEC, AUTH
    Given JS library configured by inline params VISA_CHECKOUT_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value        |
      | requesttypedescriptions | RISKDEC AUTH |
    And Visa Checkout mock responses are set as JSINIT_RISKDEC_AUTH and request type RISKDEC, AUTH
    And User opens example page
    When User chooses VISA_CHECKOUT as payment method
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |
    And following requests were sent only once
      | request_type  |
      | VISA_CHECKOUT |
      | RISKDEC, AUTH |

  @visa_test
  Scenario: Visa Checkout - successful payment with additional request types: RISKDEC, ACCOUNTCHECK, AUTH
    Given JS library configured by inline params VISA_CHECKOUT_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value                     |
      | requesttypedescriptions | RISKDEC ACCOUNTCHECK AUTH |
    And Visa Checkout mock responses are set as JSINIT_RISKDEC_ACHECK_AUTH and request type RISKDEC, ACCOUNTCHECK, AUTH
    And User opens example page
    When User chooses VISA_CHECKOUT as payment method
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |
    And following requests were sent only once
      | request_type                |
      | VISA_CHECKOUT               |
      | RISKDEC, ACCOUNTCHECK, AUTH |

  @visa_test
  Scenario: Visa Checkout - successful payment with additional request types: AUTH, SUBSCRIPTION
    Given JS library configured by inline params VISA_CHECKOUT_CONFIG and jwt JWT_WITH_SUBSCRIPTION with additional attributes
      | key                     | value             |
      | requesttypedescriptions | AUTH SUBSCRIPTION |
    And Visa Checkout mock responses are set as JSINIT_AUTH_SUBSCRIPTION and request type AUTH, SUBSCRIPTION
    And User opens example page
    When User chooses VISA_CHECKOUT as payment method
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |
    And following requests were sent only once
      | request_type       |
      | VISA_CHECKOUT      |
      | AUTH, SUBSCRIPTION |

  @visa_test
  Scenario: Visa Checkout - successful payment with additional request types: ACCOUNTCHECK, SUBSCRIPTION
    Given JS library configured by inline params VISA_CHECKOUT_CONFIG and jwt JWT_WITH_SUBSCRIPTION with additional attributes
      | key                     | value                     |
      | requesttypedescriptions | ACCOUNTCHECK SUBSCRIPTION |
    And Visa Checkout mock responses are set as JSINIT_ACHECK_SUBSCRIPTION and request type ACCOUNTCHECK, SUBSCRIPTION
    And User opens example page
    When User chooses VISA_CHECKOUT as payment method
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |
    And following requests were sent only once
      | request_type               |
      | VISA_CHECKOUT              |
      | ACCOUNTCHECK, SUBSCRIPTION |

  @visa_test
  Scenario Outline: Visa Checkout - <action_code> payment with mainamount field in jwt payload
    Given JS library configured by inline params VISA_CHECKOUT_CONFIG and jwt JWT_WITH_MAINAMOUNT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And Visa Checkout mock responses are set as JSINIT_MAINAMOUNT and payment status <action_code>
    And User opens example page
    When User chooses VISA_CHECKOUT as payment method
    Then User will see notification frame text: "<payment_status_message>"
    And User will see that notification frame has "<color>" color
    And User will see following callback type called only once
      | callback_type |
      | <callback>    |
      | submit        |
    And following requests were sent only once
      | request_type      |
      | VISA_CHECKOUT     |
      | THREEDQUERY, AUTH |

    Examples:
      | action_code | payment_status_message                  | color | callback |
      | SUCCESS     | Payment has been successfully processed | green | success  |
      | ERROR       | An error occurred                       | red   | error    |

  @visa_test
  Scenario: Form id - cancel payment with Visa checkout
    Given JS library configured with VISA_CHECKOUT_CONFIG and additional attributes
      | key    | value |
      | formId | test  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And Visa Checkout mock responses are set as BASE_JSINIT and payment status CANCEL
    And User opens example page WITH_SPECIFIC_FORM_ID
    When User chooses VISA_CHECKOUT as payment method
    Then User will see notification frame text: "Payment has been cancelled"
    And User will see that notification frame has "yellow" color
    And following requests were sent only once
      | request_type  |
      | VISA_CHECKOUT |
