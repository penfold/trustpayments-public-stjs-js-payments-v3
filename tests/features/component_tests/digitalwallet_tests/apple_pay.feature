@apple_test
Feature: ApplePay
  As a user
  I want to use ApplePay payment method
  In order to check full payment functionality

  @apple_test_part1
  Scenario Outline: ApplePay - checking payment status for <action_code> response code
    Given JS library configured by inline params APPLE_PAY_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And ApplePay mock responses are set as BASE_JSINIT and payment status <action_code>
    And User opens example page
    When User chooses APPLE_PAY as payment method
    And User clicks Proceed button on ApplePay popup
    Then User will see notification frame text: "<payment_status_message>"
    And User will see that notification frame has "<color>" color
    And User will see following callback type called only once
      | callback_type |
      | <callback>    |
      | submit        |
    And submit callback contains JWT response
    And following requests were sent only once
      | request_type      |
      | APPLE_PAY         |
      | WALLETVERIFY      |
      | THREEDQUERY, AUTH |

    @apple_pay_smoke_test
    Examples:
      | action_code | payment_status_message                  | color | callback |
      | SUCCESS     | Payment has been successfully processed | green | success  |
    Examples:
      | action_code | payment_status_message | color | callback |
#      | ERROR       | "Invalid response"          | red    |error|
      | DECLINE     | Decline                | red   | error    |

  @apple_test_part1
  Scenario: ApplePay - checking translation for "Payment has been cancelled" status for <language>
    Given JS library configured by inline params APPLE_PAY_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
      | locale                  | es_ES            |
    And ApplePay mock responses are set as BASE_JSINIT and payment status CANCEL
    And User opens example page
    When User chooses APPLE_PAY as payment method
    And User clicks Cancel button on ApplePay popup
    Then User will see payment notification text: "Payment has been cancelled" translated into "es_ES"

  @apple_pay_smoke_test @apple_test_part1
  Scenario: ApplePay - successful payment with enabled 'submit on success' process
    Given JS library configured with APPLE_PAY_CONFIG and additional attributes
      | key             | value |
      | submitOnSuccess | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And ApplePay mock responses are set as BASE_JSINIT and payment status SUCCESS
    And User opens example page
    When User fills merchant data with name "John Test", email "test@example", phone "44422224444"
    And User chooses APPLE_PAY as payment method
    And User clicks Proceed button on ApplePay popup
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | 1000                                    |
      | currencyiso3a        | GBP                                     |
      | errorcode            | 0                                       |
      | myBillName           | John Test                               |
      | myBillEmail          | test@example                            |
      | myBillTel            | 44422224444                             |
      | eci                  | 07                                      |
      | jwt                  | should not be none                      |
      | transactionreference | should not be none                      |
      | settlestatus         | 0                                       |

  @apple_test_part1
  Scenario: ApplePay - successful payment - checking that 'submitOnSuccess' is enabled by default
    Given JS library configured by inline params APPLE_PAY_DEFAULT_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And ApplePay mock responses are set as BASE_JSINIT and payment status SUCCESS
    And User opens example page
    When User fills merchant data with name "John Test", email "test@example", phone "44422224444"
    And User chooses APPLE_PAY as payment method
    And User clicks Proceed button on ApplePay popup
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | 1000                                    |
      | currencyiso3a        | GBP                                     |
      | errorcode            | 0                                       |
      | myBillName           | John Test                               |
      | myBillEmail          | test@example                            |
      | myBillTel            | 44422224444                             |
      | eci                  | 07                                      |
      | jwt                  | should not be none                      |
      | transactionreference | should not be none                      |
      | settlestatus         | 0                                       |
    And following requests were sent only once
      | request_type      |
      | APPLE_PAY         |
      | WALLETVERIFY      |
      | THREEDQUERY, AUTH |

  @apple_test_part1
  Scenario: ApplePay - error payment with enabled 'submit on error' process
    Given JS library configured with APPLE_PAY_CONFIG and additional attributes
      | key           | value |
      | submitOnError | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And ApplePay mock responses are set as BASE_JSINIT and payment status DECLINE
    And User opens example page
    When User fills merchant data with name "John Test", email "test@example", phone "44422224444"
    And User chooses APPLE_PAY as payment method
    And User clicks Proceed button on ApplePay popup
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value              |
      | errormessage         | Decline            |
      | baseamount           | 70000              |
      | currencyiso3a        | GBP                |
      | errorcode            | 70000              |
      | myBillName           | John Test          |
      | myBillEmail          | test@example       |
      | myBillTel            | 44422224444        |
      | eci                  | 07                 |
      | jwt                  | should not be none |
      | transactionreference | should not be none |
      | settlestatus         | 3                  |
    And following requests were sent only once
      | request_type      |
      | APPLE_PAY         |
      | WALLETVERIFY      |
      | THREEDQUERY, AUTH |

  @apple_test_part1
  Scenario: ApplePay - error payment with disabled 'submit on error' process
    Given JS library configured with APPLE_PAY_CONFIG and additional attributes
      | key           | value |
      | submitOnError | false |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And ApplePay mock responses are set as BASE_JSINIT and payment status DECLINE
    And User opens example page
    When User chooses APPLE_PAY as payment method
    And User clicks Proceed button on ApplePay popup
    Then User remains on checkout page
    And User will see notification frame text: "Decline"
    And User will see that notification frame has "red" color
    And User will see following callback type called only once
      | callback_type |
      | error         |
      | submit        |
    And submit callback contains JWT response
    And following requests were sent only once
      | request_type      |
      | APPLE_PAY         |
      | WALLETVERIFY      |
      | THREEDQUERY, AUTH |

  @apple_test_part1
  Scenario: ApplePay - error payment - checking that 'submitOnError' is disabled by default
    Given JS library configured by inline params APPLE_PAY_DEFAULT_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And ApplePay mock responses are set as BASE_JSINIT and payment status DECLINE
    And User opens example page
    When User chooses APPLE_PAY as payment method
    And User clicks Proceed button on ApplePay popup
    Then User remains on checkout page
    And User will see notification frame text: "Decline"
    And User will see that notification frame has "red" color
    And User will see following callback type called only once
      | callback_type |
      | error         |
      | submit        |
    And submit callback contains JWT response
    And following requests were sent only once
      | request_type      |
      | APPLE_PAY         |
      | WALLETVERIFY      |
      | THREEDQUERY, AUTH |

  @apple_test_part1
  Scenario: ApplePay - canceled payment with enabled 'submit on cancel' process
    Given JS library configured with APPLE_PAY_CONFIG and additional attributes
      | key            | value |
      | submitOnCancel | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And ApplePay mock responses are set as BASE_JSINIT and payment status CANCEL
    And User opens example page
    When User chooses APPLE_PAY as payment method
    And User clicks Cancel button on ApplePay popup
    And User will be sent to page with url "www.example.com" having params
      | key          | value                      |
      | errorcode    | cancelled                  |
      | errormessage | Payment has been cancelled |

  @apple_test_part1
  Scenario: ApplePay - redirect on cancel callback
    Given JS library configured with APPLE_PAY_CONFIG and additional attributes
      | key            | value               |
      | cancelCallback | redirectionCallback |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And ApplePay mock responses are set as BASE_JSINIT and payment status CANCEL
    And User opens example page
    When User chooses APPLE_PAY as payment method
    And User clicks Cancel button on ApplePay popup
    And User will be sent to page with url "example.org" having params
      | key          | value                      |
      | errorcode    | cancelled                  |
      | errormessage | Payment has been cancelled |

  @apple_test_part1
  Scenario: ApplePay - canceled payment - checking that 'submitOnCancel' is disabled by default
    Given JS library configured by inline params APPLE_PAY_DEFAULT_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And ApplePay mock responses are set as BASE_JSINIT and payment status CANCEL
    And User opens example page
    When User chooses APPLE_PAY as payment method
    And User clicks Cancel button on ApplePay popup
    Then User remains on checkout page
    And User will see notification frame text: "Payment has been cancelled"
    And User will see that notification frame has "yellow" color
    And User will see following callback type called only once
      | callback_type |
      | cancel        |
      | submit        |

  @apple_test_part1
  Scenario: ApplePay - canceled payment with disabled 'submit on cancel' process
    Given JS library configured with APPLE_PAY_CONFIG and additional attributes
      | key            | value |
      | submitOnCancel | false |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And ApplePay mock responses are set as BASE_JSINIT and payment status CANCEL
    And User opens example page
    When User chooses APPLE_PAY as payment method
    And User clicks Cancel button on ApplePay popup
    Then User remains on checkout page
    And User will see notification frame text: "Payment has been cancelled"
    And User will see that notification frame has "yellow" color
    And User will see following callback type called only once
      | callback_type |
      | cancel        |
      | submit        |

  @apple_pay_smoke_test @apple_test_part1
  Scenario: ApplePay - Successful payment with updated JWT
    Given JS library configured by inline params APPLE_PAY_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens page WITH_UPDATE_JWT and jwt BASE_UPDATED_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And ApplePay mock responses are set as JSINIT_UPDATED_JWT and payment status SUCCESS
    When User calls updateJWT function by filling amount field
    And User chooses APPLE_PAY as payment method
    And User clicks Proceed button on ApplePay popup
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |
    And submit callback contains JWT response
    And following requests were sent only once
      | request_type      |
      | APPLE_PAY         |
      | WALLETVERIFY      |
      | THREEDQUERY, AUTH |
    And WALLETVERIFY requests contains updated jwt

  @apple_test_part1
  Scenario: ApplePay - update JWT and submitOnSuccess
    Given JS library configured with APPLE_PAY_CONFIG and additional attributes
      | key             | value |
      | submitOnSuccess | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And ApplePay mock responses are set as JSINIT_UPDATED_JWT and payment status SUCCESS
    And User opens page WITH_UPDATE_JWT and jwt BASE_UPDATED_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    When User calls updateJWT function by filling amount field
    And User fills merchant data with name "John Test", email "test@example", phone "44422224444"
    And User calls updateJWT function by filling amount field
    And User chooses APPLE_PAY as payment method
    And User clicks Proceed button on ApplePay popup
    Then User will be sent to page with url "www.example.com" having params
      | key           | value                                   |
      | errormessage  | Payment has been successfully processed |
      | baseamount    | 1000                                    |
      | currencyiso3a | GBP                                     |
      | errorcode     | 0                                       |
      | myBillName    | John Test                               |
      | myBillEmail   | test@example                            |
      | myBillTel     | 44422224444                             |
      | eci           | 07                                      |
      | jwt           | should not be none                      |
    And following requests were sent only once
      | request_type      |
      | APPLE_PAY         |
      | WALLETVERIFY      |
      | THREEDQUERY, AUTH |
    And WALLETVERIFY requests contains updated jwt

  @apple_test_part1
  Scenario: ApplePay - successful payment with additional request types: AUTH
    Given JS library configured by inline params APPLE_PAY_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And ApplePay mock responses are set as JSINIT_AUTH and request type AUTH
    And User opens example page
    When User chooses APPLE_PAY as payment method
    And User clicks Proceed button on ApplePay popup
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |
    And submit callback contains JWT response
    And following requests were sent only once
      | request_type |
      | APPLE_PAY    |
      | WALLETVERIFY |
      | AUTH         |

  @apple_test_part2
  Scenario: ApplePay - successful payment with additional request types: ACCOUNTCHECK
    Given JS library configured by inline params APPLE_PAY_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value        |
      | requesttypedescriptions | ACCOUNTCHECK |
    And ApplePay mock responses are set as JSINIT_ACHECK and request type ACCOUNTCHECK
    And User opens example page
    When User chooses APPLE_PAY as payment method
    And User clicks Proceed button on ApplePay popup
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |
    And submit callback contains JWT response
    And following requests were sent only once
      | request_type |
      | APPLE_PAY    |
      | WALLETVERIFY |
      | ACCOUNTCHECK |

  @apple_test_part2
  Scenario: ApplePay - successful payment with additional request types: ACCOUNTCHECK, AUTH
    Given JS library configured by inline params APPLE_PAY_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value             |
      | requesttypedescriptions | ACCOUNTCHECK AUTH |
    And ApplePay mock responses are set as JSINIT_ACHECK_AUTH and request type ACCOUNTCHECK, AUTH
    And User opens example page
    When User chooses APPLE_PAY as payment method
    And User clicks Proceed button on ApplePay popup
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |
    And submit callback contains JWT response
    And following requests were sent only once
      | request_type       |
      | APPLE_PAY          |
      | WALLETVERIFY       |
      | ACCOUNTCHECK, AUTH |

  @apple_test_part2
  Scenario: ApplePay - successful payment with additional request types: RISKDEC, AUTH
    Given JS library configured by inline params APPLE_PAY_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value        |
      | requesttypedescriptions | RISKDEC AUTH |
    And ApplePay mock responses are set as JSINIT_RISKDEC_AUTH and request type RISKDEC, AUTH
    And User opens example page
    When User chooses APPLE_PAY as payment method
    And User clicks Proceed button on ApplePay popup
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |
    And submit callback contains JWT response
    And following requests were sent only once
      | request_type  |
      | APPLE_PAY     |
      | WALLETVERIFY  |
      | RISKDEC, AUTH |

  @apple_test_part2
  Scenario: ApplePay - successful payment with additional request types: RISKDEC, ACCOUNTCHECK, AUTH
    Given JS library configured by inline params APPLE_PAY_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value                     |
      | requesttypedescriptions | RISKDEC ACCOUNTCHECK AUTH |
    And ApplePay mock responses are set as JSINIT_RISKDEC_ACHECK_AUTH and request type RISKDEC, ACCOUNTCHECK, AUTH
    And User opens example page
    When User chooses APPLE_PAY as payment method
    And User clicks Proceed button on ApplePay popup
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |
    And submit callback contains JWT response
    And following requests were sent only once
      | request_type                |
      | APPLE_PAY                   |
      | WALLETVERIFY                |
      | RISKDEC, ACCOUNTCHECK, AUTH |

  @apple_test_part2
  Scenario: ApplePay - successful payment with additional request types: AUTH, SUBSCRIPTION
    Given JS library configured by inline params APPLE_PAY_CONFIG and jwt JWT_WITH_SUBSCRIPTION with additional attributes
      | key                     | value             |
      | requesttypedescriptions | AUTH SUBSCRIPTION |
    And ApplePay mock responses are set as JSINIT_AUTH_SUBSCRIPTION and request type AUTH, SUBSCRIPTION
    And User opens example page
    When User chooses APPLE_PAY as payment method
    And User clicks Proceed button on ApplePay popup
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |
    And submit callback contains JWT response
    And following requests were sent only once
      | request_type       |
      | APPLE_PAY          |
      | WALLETVERIFY       |
      | AUTH, SUBSCRIPTION |

  @apple_test_part2
  Scenario: ApplePay - successful payment with additional request types: ACCOUNTCHECK, SUBSCRIPTION
    Given JS library configured by inline params APPLE_PAY_CONFIG and jwt JWT_WITH_SUBSCRIPTION with additional attributes
      | key                     | value                     |
      | requesttypedescriptions | ACCOUNTCHECK SUBSCRIPTION |
    And ApplePay mock responses are set as JSINIT_ACHECK_SUBSCRIPTION and request type ACCOUNTCHECK, SUBSCRIPTION
    And User opens example page
    When User chooses APPLE_PAY as payment method
    And User clicks Proceed button on ApplePay popup
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |
    And submit callback contains JWT response
    And following requests were sent only once
      | request_type               |
      | APPLE_PAY                  |
      | WALLETVERIFY               |
      | ACCOUNTCHECK, SUBSCRIPTION |

  @apple_test_part2
  Scenario: ApplePay - Cybertonica - 'fraudcontroltransactionid' flag is added to AUTH requests during payment
    Given JS library configured with APPLE_PAY_CONFIG and additional attributes
      | key               | value |
      | cybertonicaApiKey | stfs  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And ApplePay mock responses are set as BASE_JSINIT and payment status SUCCESS
    And User opens example page
    When User chooses APPLE_PAY as payment method
    And User clicks Proceed button on ApplePay popup
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |
    And submit callback contains JWT response
    And following requests were sent only once with 'fraudcontroltransactionid' flag
      | request_type      |
      | THREEDQUERY, AUTH |

# TODO - uncomment this scenario when STJS-1924 will be fixed
#  @apple_test_part2
#  Scenario: ApplePay - Cybertonica - 'fraudcontroltransactionid' flag is not added to AUTH requests during payment
#    Given JS library configured with APPLE_PAY_CONFIG and additional attributes
#      | key               | value |
#      | cybertonicaApiKey | test  |
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value            |
#      | requesttypedescriptions | THREEDQUERY AUTH |
#    And ApplePay mock responses are set as BASE_JSINIT and payment status SUCCESS
#    And User opens example page
#    When User chooses APPLE_PAY as payment method
#    And User clicks Proceed button on ApplePay popup
#    Then User will see notification frame text: "Payment has been successfully processed"
#    And User will see following callback type called only once
#      | callback_type |
#      | success       |
#      | submit        |
#    And submit callback contains JWT response
#    And following requests were sent only once without 'fraudcontroltransactionid' flag
#      | request_type      |
#      | THREEDQUERY, AUTH |

  @apple_test_part2
  Scenario: ApplePay - notification frame is not displayed after successful payment
    Given JS library configured with APPLE_PAY_CONFIG and additional attributes
      | key                 | value |
      | disableNotification | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And ApplePay mock responses are set as BASE_JSINIT and payment status SUCCESS
    And User opens example page
    When User chooses APPLE_PAY as payment method
    And User clicks Proceed button on ApplePay popup
    Then User will not see notification frame

  @apple_test_part2
  Scenario: ApplePay - notification frame is not displayed after declined payment
    Given JS library configured with APPLE_PAY_CONFIG and additional attributes
      | key                 | value |
      | disableNotification | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And ApplePay mock responses are set as BASE_JSINIT and payment status DECLINE
    And User opens example page
    When User chooses APPLE_PAY as payment method
    And User clicks Proceed button on ApplePay popup
    Then User will not see notification frame

  @apple_test_part2
  Scenario: ApplePay - notification frame is displayed after payment if disableNotification is false
    Given JS library configured with APPLE_PAY_CONFIG and additional attributes
      | key                 | value |
      | disableNotification | false |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And ApplePay mock responses are set as BASE_JSINIT and payment status SUCCESS
    And User opens example page
    When User chooses APPLE_PAY as payment method
    And User clicks Proceed button on ApplePay popup
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |
    And submit callback contains JWT response

  @apple_test_part2
  Scenario Outline: ApplePay - <action_code> payment with mainamount field in jwt payload
    Given JS library configured by inline params APPLE_PAY_CONFIG and jwt JWT_WITH_MAINAMOUNT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And ApplePay mock responses are set as JSINIT_MAINAMOUNT and payment status <action_code>
    And User opens example page
    When User chooses APPLE_PAY as payment method
    And User clicks Proceed button on ApplePay popup
    Then User will see notification frame text: "<payment_status_message>"
    And User will see that notification frame has "<color>" color
    And User will see following callback type called only once
      | callback_type |
      | <callback>    |
      | submit        |
    And submit callback contains JWT response
    And following requests were sent only once
      | request_type      |
      | APPLE_PAY         |
      | WALLETVERIFY      |
      | THREEDQUERY, AUTH |

    Examples:
      | action_code | payment_status_message                  | color | callback |
      | SUCCESS     | Payment has been successfully processed | green | success  |
      | DECLINE     | Decline                                 | red   | error    |

  @config_apple_buttonPlacement @apple_test_part2
  Scenario: ApplePay - successful payment with 'buttonPlacement' property in config
    Given JS library configured by inline params APPLE_PAY_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And ApplePay mock responses are set as BASE_JSINIT and payment status SUCCESS
    And User opens example page
    When User chooses APPLE_PAY as payment method
    And User clicks Proceed button on ApplePay popup
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | success       |
      | submit        |
    And submit callback contains JWT response
    And following requests were sent only once
      | request_type      |
      | APPLE_PAY         |
      | WALLETVERIFY      |
      | THREEDQUERY, AUTH |

  @wallet_test @apple_test_part2
  Scenario Outline: ApplePay - <payment> payment logs
    Given JS library configured by inline params APPLE_PAY_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And ApplePay mock responses are set as BASE_JSINIT and payment status <action_code>
    And User opens example page
    When User chooses APPLE_PAY as payment method
    And User clicks Proceed button on ApplePay popup
    Then User will see notification frame text: "<payment_status_message>"
    And User will see following logs
      | name     | step                   |
      | ApplePay | PAYMENT INIT STARTED   |
      | ApplePay | PAYMENT INIT COMPLETED |
      | ApplePay | PAYMENT STARTED        |
      | ApplePay | <payment_log>          |

    Examples:
      | payment    | action_code | payment_status_message                  | payment_log       |
      | successful | SUCCESS     | Payment has been successfully processed | PAYMENT COMPLETED |
      | error      | DECLINE     | Decline                                 | PAYMENT FAILED    |

  @base_config @wallet_test @apple_test_part2
  Scenario: ApplePay - canceled payment logs
    Given JS library configured by inline params APPLE_PAY_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And ApplePay mock responses are set as BASE_JSINIT and payment status CANCEL
    And User opens example page
    When User chooses APPLE_PAY as payment method
    And User clicks Cancel button on ApplePay popup
    Then User will see notification frame text: "Payment has been cancelled"
    And User will see following logs
      | name     | step                   |
      | ApplePay | PAYMENT INIT STARTED   |
      | ApplePay | PAYMENT INIT COMPLETED |
      | ApplePay | PAYMENT CANCELED       |

  @base_config @parent_iframe
  Scenario: ApplePay - successful payment when app is embedded in another iframe
    Given JS library configured by inline params APPLE_PAY_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And ApplePay mock responses are set as BASE_JSINIT and payment status SUCCEESS
    And User opens example page IN_IFRAME
    When User chooses APPLE_PAY as payment method
    And User clicks Proceed button on ApplePay popup
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And following requests were sent only once
      | request_type      |
      | APPLE_PAY         |
      | WALLETVERIFY      |
      | THREEDQUERY, AUTH |
