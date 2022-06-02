Feature: GooglePay
  As a user
  I want to use GooglePay payment method
  In order to check full payment functionality

  @googlepay_test
  Scenario Outline: GooglePay - checking payment status for <action_code> response code
    Given JS library configured by inline params GOOGLE_PAY_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And Google Pay mock responses are set as JSINIT_AUTH and payment status <action_code>
    And User opens example page
    When User chooses GOOGLE_PAY as payment method
    Then User will see notification frame text: "<payment_status_message>"
    And User will see that notification frame has "<color>" color
    And User will see following callback type called only once
      | <callback_type> |
    And submit callback contains JWT response
    And following requests were sent only once
      | request_type |
      | GOOGLE_PAY   |
      | AUTH         |

    Examples:
      | action_code | payment_status_message                  | color | callback_type |
      | SUCCESS     | Payment has been successfully processed | green | success       |
      | ERROR       | An error occurred                       | red   | error         |

  @googlepay_test
  Scenario: GooglePay - checking translation for "Payment has been cancelled" status for <language>
    Given JS library configured by inline params GOOGLE_PAY_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
      | locale                  | es_ES |
    And Google Pay mock responses are set as JSINIT_AUTH and payment status CANCEL
    And User opens example page
    When User chooses GOOGLE_PAY as payment method
    Then User will see payment notification text: "Payment has been cancelled" translated into "es_ES"

  @googlepay_test
  Scenario: GooglePay - successful payment with enabled 'submit on success' process
    Given JS library configured with GOOGLE_PAY_CONFIG and additional attributes
      | key             | value |
      | submitOnSuccess | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And Google Pay mock responses are set as JSINIT_AUTH and payment status SUCCESS
    And User opens example page
    When User fills merchant data with name "John Test", email "test@example", phone "44422224444"
    And User chooses GOOGLE_PAY as payment method
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | 1000                                    |
      | currencyiso3a        | GBP                                     |
      | errorcode            | 0                                       |
      | myBillName           | John Test                               |
      | myBillEmail          | test@example                            |
      | myBillTel            | 44422224444                             |
      | jwt                  | should not be none                      |
      | transactionreference | should not be none                      |
      | settlestatus         | 0                                       |
    And following requests were sent only once
      | request_type |
      | GOOGLE_PAY   |
      | AUTH         |

  @googlepay_test
  Scenario: GooglePay - error payment with enabled 'submit on error' process
    Given JS library configured with GOOGLE_PAY_CONFIG and additional attributes
      | key           | value |
      | submitOnError | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And Google Pay mock responses are set as JSINIT_AUTH and payment status ERROR
    And User opens example page
    When User chooses GOOGLE_PAY as payment method
    Then User will be sent to page with url "www.example.com" having params
      | key          | value             |
      | errormessage | An error occurred |
      | errorcode    | 30000             |
    And following requests were sent only once
      | request_type |
      | GOOGLE_PAY   |
      | AUTH         |

  @googlepay_test
  Scenario: GooglePay - error payment with disabled 'submit on error' process
    Given JS library configured with GOOGLE_PAY_CONFIG and additional attributes
      | key           | value |
      | submitOnError | false |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And Google Pay mock responses are set as JSINIT_AUTH and payment status ERROR
    And User opens example page
    When User chooses GOOGLE_PAY as payment method
    And User will see notification frame text: "An error occurred"
    And User will see that notification frame has "red" color
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | error         |
    And submit callback contains JWT response
    And following requests were sent only once
      | request_type |
      | GOOGLE_PAY   |
      | AUTH         |

  @googlepay_test
  Scenario: GooglePay - canceled payment with enabled 'submitOnCancel' process
    Given JS library configured with GOOGLE_PAY_CONFIG and additional attributes
      | key            | value |
      | submitOnCancel | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And Google Pay mock responses are set as JSINIT_AUTH and payment status CANCEL
    And User opens example page
    When User chooses GOOGLE_PAY as payment method
    Then User will be sent to page with url "www.example.com" having params
      | key          | value  |
      | errormessage | cancel |
      | errorcode    | 1      |

  @googlepay_test
  Scenario: GooglePay - canceled payment with disabled 'submitOnCancel' process
    Given JS library configured with GOOGLE_PAY_CONFIG and additional attributes
      | key            | value |
      | submitOnCancel | false |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And Google Pay mock responses are set as JSINIT_AUTH and payment status CANCEL
    And User opens example page
    When User chooses GOOGLE_PAY as payment method
    And User will see notification frame text: "Payment has been cancelled"
    And User will see that notification frame has "yellow" color
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | cancel        |
    And following requests were sent only once
      | request_type |
      | GOOGLE_PAY   |

  @googlepay_test
  Scenario: GooglePay - Successful payment with updated JWT
    Given JS library configured by inline params GOOGLE_PAY_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And Google Pay mock responses are set as JSINIT_AUTH_UPDATED_JWT and payment status SUCCESS
    And User opens page WITH_UPDATE_JWT and jwt BASE_UPDATED_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    When User calls updateJWT function by filling amount field
    And User chooses GOOGLE_PAY as payment method
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |
    And submit callback contains JWT response
    And following requests were sent only once
      | request_type |
      | GOOGLE_PAY   |
      | AUTH         |
    And JSINIT requests contains updated jwt

  @googlepay_test
  Scenario: GooglePay - update JWT and submitOnSuccess
    Given JS library configured with GOOGLE_PAY_CONFIG and additional attributes
      | key             | value |
      | submitOnSuccess | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And Google Pay mock responses are set as JSINIT_AUTH_UPDATED_JWT and payment status SUCCESS
    And User opens page WITH_UPDATE_JWT and jwt BASE_UPDATED_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    When User fills merchant data with name "John Test", email "test@example", phone "44422224444"
    And User calls updateJWT function by filling amount field
    And User chooses GOOGLE_PAY as payment method
    Then User will be sent to page with url "www.example.com" having params
      | key           | value                                   |
      | errormessage  | Payment has been successfully processed |
      | baseamount    | 1000                                    |
      | currencyiso3a | GBP                                     |
      | errorcode     | 0                                       |
      | myBillName    | John Test                               |
      | myBillEmail   | test@example                            |
      | myBillTel     | 44422224444                             |
      | jwt           | should not be none                      |
    And following requests were sent only once
      | request_type |
      | GOOGLE_PAY   |
      | AUTH         |

  @googlepay_test
  Scenario: GooglePay - successful payment with additional request types: AUTH
    Given JS library configured by inline params GOOGLE_PAY_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And Google Pay mock responses are set as JSINIT_AUTH and request type AUTH
    And User opens example page
    When User chooses GOOGLE_PAY as payment method
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |
    And following requests were sent only once
      | request_type |
      | GOOGLE_PAY   |
      | AUTH         |

  @googlepay_test
  Scenario: GooglePay - successful payment with additional request types: ACCOUNTCHECK, AUTH
    Given JS library configured by inline params GOOGLE_PAY_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value             |
      | requesttypedescriptions | ACCOUNTCHECK AUTH |
    And Google Pay mock responses are set as JSINIT_ACHECK_AUTH and request type ACCOUNTCHECK, AUTH
    And User opens example page
    When User chooses GOOGLE_PAY as payment method
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |
    And following requests were sent only once
      | request_type       |
      | GOOGLE_PAY         |
      | ACCOUNTCHECK, AUTH |

  @googlepay_test
  Scenario: GooglePay - successful payment with additional request types: ACCOUNTCHECK
    Given JS library configured by inline params GOOGLE_PAY_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value        |
      | requesttypedescriptions | ACCOUNTCHECK |
    And Google Pay mock responses are set as JSINIT_ACHECK and request type ACCOUNTCHECK
    And User opens example page
    When User chooses GOOGLE_PAY as payment method
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |
    And following requests were sent only once
      | request_type |
      | GOOGLE_PAY   |
      | ACCOUNTCHECK |

  @googlepay_test
  Scenario: GooglePay - successful payment with additional request types: RISKDEC, AUTH
    Given JS library configured by inline params GOOGLE_PAY_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value        |
      | requesttypedescriptions | RISKDEC AUTH |
    And Google Pay mock responses are set as JSINIT_RISKDEC_AUTH and request type RISKDEC, AUTH
    And User opens example page
    When User chooses GOOGLE_PAY as payment method
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |
    And following requests were sent only once
      | request_type  |
      | GOOGLE_PAY    |
      | RISKDEC, AUTH |

  @googlepay_test
  Scenario: GooglePay - successful payment with additional request types: RISKDEC, ACCOUNTCHECK, AUTH
    Given JS library configured by inline params GOOGLE_PAY_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value                     |
      | requesttypedescriptions | RISKDEC ACCOUNTCHECK AUTH |
    And Google Pay mock responses are set as JSINIT_RISKDEC_ACHECK_AUTH and request type RISKDEC, ACCOUNTCHECK, AUTH
    And User opens example page
    When User chooses GOOGLE_PAY as payment method
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |
    And following requests were sent only once
      | request_type                |
      | GOOGLE_PAY                  |
      | RISKDEC, ACCOUNTCHECK, AUTH |

  @googlepay_test
  Scenario: GooglePay - successful payment with additional request types: AUTH, SUBSCRIPTION
    Given JS library configured by inline params GOOGLE_PAY_CONFIG and jwt JWT_WITH_SUBSCRIPTION with additional attributes
      | key                     | value             |
      | requesttypedescriptions | AUTH SUBSCRIPTION |
    And Google Pay mock responses are set as JSINIT_AUTH_SUBSCRIPTION and request type AUTH, SUBSCRIPTION
    And User opens example page
    When User chooses GOOGLE_PAY as payment method
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |
    And following requests were sent only once
      | request_type       |
      | GOOGLE_PAY         |
      | AUTH, SUBSCRIPTION |

  @googlepay_test
  Scenario: GooglePay - successful payment with additional request types: ACCOUNTCHECK, SUBSCRIPTION
    Given JS library configured by inline params GOOGLE_PAY_CONFIG and jwt JWT_WITH_SUBSCRIPTION with additional attributes
      | key                     | value                     |
      | requesttypedescriptions | ACCOUNTCHECK SUBSCRIPTION |
    And Google Pay mock responses are set as JSINIT_ACHECK_SUBSCRIPTION and request type ACCOUNTCHECK, SUBSCRIPTION
    And User opens example page
    When User chooses GOOGLE_PAY as payment method
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |
    And following requests were sent only once
      | request_type               |
      | GOOGLE_PAY                 |
      | ACCOUNTCHECK, SUBSCRIPTION |

  @googlepay_test
  Scenario: GooglePay - SEON - 'fraudcontroltransactionid' flag is added to AUTH requests during payment
    Given JS library configured by inline params GOOGLE_PAY_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And Google Pay mock responses are set as JSINIT_AUTH and payment status SUCCESS
    And User opens example page
    When User chooses GOOGLE_PAY as payment method
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |
    And submit callback contains JWT response
    And following requests were sent only once with 'fraudcontroltransactionid' flag
      | request_type |
      | AUTH         |

  @googlepay_test
  Scenario: GooglePay - SEON - 'fraudcontroltransactionid' flag is not added to AUTH requests during payment
    Given JS library configured by inline params GOOGLE_PAY_CONFIG and jwt JWT_WITH_FRAUD_CONTROL with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And Google Pay mock responses are set as JSINIT_AUTH and payment status SUCCESS
    And User opens example page
    When User chooses GOOGLE_PAY as payment method
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |
    And submit callback contains JWT response
    And following requests were sent only once without 'fraudcontroltransactionid' flag
      | request_type |
      | AUTH         |

  @googlepay_test
  Scenario Outline: GooglePay - <payment> payment logs
    Given JS library configured by inline params GOOGLE_PAY_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And Google Pay mock responses are set as JSINIT_AUTH and payment status <action_code>
    And User opens example page
    When User chooses GOOGLE_PAY as payment method
    Then User will see notification frame text: "<payment_status_message>"
    And User will see following logs
      | name      | step                   |
      | GooglePay | PAYMENT INIT STARTED   |
      | GooglePay | PAYMENT INIT COMPLETED |
      | GooglePay | PAYMENT STARTED        |
      | GooglePay | <payment_log>          |

    Examples:
      | payment    | action_code | payment_status_message                  | payment_log       |
      | successful | SUCCESS     | Payment has been successfully processed | PAYMENT COMPLETED |
      | error      | ERROR       | An error occurred                       | PAYMENT FAILED    |

  @googlepay_test
  Scenario: GooglePay - canceled payment logs
    Given JS library configured by inline params GOOGLE_PAY_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value |
      | requesttypedescriptions | AUTH  |
    And Google Pay mock responses are set as JSINIT_AUTH and payment status CANCEL
    And User opens example page
    When User chooses GOOGLE_PAY as payment method
    Then User will see notification frame text: "Payment has been cancelled"
    And User will see following logs
      | name      | step                   |
      | GooglePay | PAYMENT INIT STARTED   |
      | GooglePay | PAYMENT INIT COMPLETED |
      | GooglePay | PAYMENT CANCELED       |
