Feature: GooglePay
  As a user
  I want to use GooglePay payment method
  In order to check full payment functionality

  Background:
    Given JavaScript configuration is set for scenario based on scenario's @config tag


  @config_google_base
  Scenario Outline: GooglePay - checking payment status for <action_code> response code
    Given User opens mock payment page
    When User chooses GooglePay as payment method - response is set to "<action_code>"
    Then User will see payment status information: "<payment_status_message>"
    And User will see that notification frame has "<color>" color
    And User will see following callback type called only once
      | <callback_type> |
    And submit callback contains JWT response
    And GOOGLE_PAY or AUTH requests were sent only once with correct data

    Examples:
      | action_code | payment_status_message                  | color  | callback_type |
      | SUCCESS     | Payment has been successfully processed | green  | success       |
      | CANCEL      | Payment has been cancelled              | yellow | cancel        |
      | ERROR       | An error occurred                       | red    | error         |

  @config_google_base
  Scenario Outline: GooglePay - checking translation for "Payment has been cancelled" status for <language>
    Given User opens mock payment page
    When User changes page language to "<language>"
    And User chooses GooglePay as payment method - response is set to "CANCEL"
    Then User will see "Payment has been cancelled" payment status translated into "<language>"
    Examples:
      | language |
      | es_ES    |

  @config_google_submit_on_success_true
  Scenario: GooglePay - successful payment with enabled 'submit on success' process
    Given User opens mock payment page
    And User waits for whole form to be loaded
    When User fills merchant data with name "John Test", email "test@example", phone "44422224444"
    And User chooses GooglePay as payment method - response is set to "SUCCESS"
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
    And GOOGLE_PAY or AUTH requests were sent only once with correct data


  @config_google_submit_on_error_true
  Scenario: GooglePay - error payment with enabled 'submit on error' process
    Given User opens mock payment page
    And User waits for whole form to be loaded
    When User chooses GooglePay as payment method - response is set to "ERROR"
    Then User will be sent to page with url "www.example.com" having params
      | key          | value             |
      | errormessage | An error occurred |
      | errorcode    | 30000             |
    And GOOGLE_PAY or AUTH requests were sent only once with correct data

  @config_google_base
  Scenario: GooglePay - error payment with disabled 'submit on error' process
    Given User opens mock payment page
    When User chooses GooglePay as payment method - response is set to "ERROR"
    Then User remains on checkout page
    And User will see payment status information: "An error occurred"
    And User will see that notification frame has "red" color
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | error         |
    And submit callback contains JWT response
    And GOOGLE_PAY or AUTH requests were sent only once with correct data

  @config_google_submit_on_cancel_true
  Scenario: GooglePay - canceled payment with enabled 'submitOnCancel' process
    Given User opens mock payment page
    When User chooses GooglePay as payment method - response is set to "CANCEL"
    Then User will be sent to page with url "www.example.com" having params
      | key          | value                      |
      | errormessage | Payment has been cancelled |
      | errorcode    | cancelled                  |

  @config_google_base
  Scenario: GooglePay - canceled payment with disabled 'submitOnCancel' process
    Given User opens mock payment page
    When User chooses GooglePay as payment method - response is set to "CANCEL"
    Then User remains on checkout page
    And User will see payment status information: "Payment has been cancelled"
    And User will see that notification frame has "yellow" color

  @config_google_update_jwt
  Scenario: GooglePay - Successful payment with updated JWT
    Given User opens mock payment page WITH_UPDATE_JWT
      | jwtName          |
      | BASE_UPDATED_JWT |
    And User waits for whole form to be loaded
    When User calls updateJWT function by filling amount field
    And User chooses GooglePay as payment method - response is set to "SUCCESS"
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |
    And submit callback contains JWT response
    And GOOGLE_PAY or AUTH requests were sent only once with correct data


  @config_google_submit_on_success_true
  Scenario: GooglePay - update JWT and submitOnSuccess
    Given User opens mock payment page WITH_UPDATE_JWT
      | jwtName          |
      | BASE_UPDATED_JWT |
    And User waits for whole form to be loaded
    When User fills merchant data with name "John Test", email "test@example", phone "44422224444"
    And User calls updateJWT function by filling amount field
    And User chooses GooglePay as payment method - response is set to "SUCCESS"
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
    And GOOGLE_PAY or AUTH requests were sent only once with correct data


  @config_google_auth
  Scenario: GooglePay - successful payment with additional request types: AUTH
    Given User opens mock payment page
    And User waits for whole form to be loaded
    When AUTH GooglePay mock response is set to SUCCESS
    And User chooses GOOGLE_PAY as payment method
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And AUTH request for GOOGLE_PAY is sent only once with correct data
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |


  @config_google_acheck_auth
  Scenario: GooglePay - successful payment with additional request types: ACCOUNTCHECK, AUTH
    Given User opens mock payment page
    When ACCOUNTCHECK, AUTH GooglePay mock response is set to SUCCESS
    And User chooses GOOGLE_PAY as payment method
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And ACCOUNTCHECK, AUTH request for GOOGLE_PAY is sent only once with correct data
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |

  @config_google_acheck
  Scenario: GooglePay - successful payment with additional request types: ACCOUNTCHECK
    Given User opens mock payment page
    When ACCOUNTCHECK GooglePay mock response is set to SUCCESS
    And User chooses GOOGLE_PAY as payment method
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And ACCOUNTCHECK request for GOOGLE_PAY is sent only once with correct data
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |

  @config_google_riskdec_auth
  Scenario: GooglePay - successful payment with additional request types: RISKDEC, AUTH
    Given User opens mock payment page
    When RISKDEC, AUTH GooglePay mock response is set to SUCCESS
    And User chooses GOOGLE_PAY as payment method
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And RISKDEC, AUTH request for GOOGLE_PAY is sent only once with correct data
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |

  @config_google_riskdec_acheck_auth
  Scenario: GooglePay - successful payment with additional request types: RISKDEC, ACCOUNTCHECK, AUTH
    Given User opens mock payment page
    When RISKDEC, ACCOUNTCHECK, AUTH GooglePay mock response is set to SUCCESS
    And User chooses GOOGLE_PAY as payment method
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And RISKDEC, ACCOUNTCHECK, AUTH request for GOOGLE_PAY is sent only once with correct data
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |

  @config_google_auth_subscription
  Scenario: GooglePay - successful payment with additional request types: AUTH, SUBSCRIPTION
    Given User opens mock payment page
    When AUTH, SUBSCRIPTION GooglePay mock response is set to SUCCESS
    And User chooses GOOGLE_PAY as payment method
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And AUTH, SUBSCRIPTION request for GOOGLE_PAY is sent only once with correct data
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |

  @config_google_acheck_subscription
  Scenario: GooglePay - successful payment with additional request types: ACCOUNTCHECK, SUBSCRIPTION
    Given User opens mock payment page
    When ACCOUNTCHECK, SUBSCRIPTION GooglePay mock response is set to SUCCESS
    And User chooses GOOGLE_PAY as payment method
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And ACCOUNTCHECK, SUBSCRIPTION request for GOOGLE_PAY is sent only once with correct data
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |

  @config_cybertonica
  Scenario: GooglePay - Cybertonica - 'fraudcontroltransactionid' flag is added to AUTH requests during payment
    Given User opens mock payment page
    When User chooses GooglePay as payment method - response is set to "SUCCESS"
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |
    And submit callback contains JWT response
    And THREEDQUERY, AUTH request was sent only once with 'fraudcontroltransactionid' flag

  @config_google_base
  Scenario: GooglePay - Cybertonica - 'fraudcontroltransactionid' flag is not added to AUTH requests during payment
    Given User opens mock payment page
    When User chooses GooglePay as payment method - response is set to "SUCCESS"
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see following callback type called only once
      | callback_type |
      | submit        |
      | success       |
    And submit callback contains JWT response
    And THREEDQUERY, AUTH request was sent only once without 'fraudcontroltransactionid' flag
