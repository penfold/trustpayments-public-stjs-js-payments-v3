Feature: Logs

  Scenario Outline: Init logs verification for Card Payments - <config>
    Given JS library configured by inline params <config> and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    And User waits for form inputs to be loaded
    Then User will see following logs
      | name      | step                 |
      | ApplePay  | PAYMENT INIT STARTED |
      | ApplePay  | PAYMENT INIT FAILED  |
      | GooglePay | PAYMENT INIT STARTED |
      | GooglePay | <gp_payment_init>    |

    Examples:
      | config       | gp_payment_init        |
      | BASIC_CONFIG | PAYMENT INIT COMPLETED |
#      | BASIC_CONFIG      | PAYMENT INIT FAILED | STJS-2202


  Scenario Outline: Init logs verification for Digital wallets - <config>
    Given JS library configured by inline params <config> and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    And User waits for form inputs to be loaded
    Then User will see following logs
      | name      | step                 |
      | ApplePay  | PAYMENT INIT STARTED |
      | ApplePay  | PAYMENT INIT FAILED  |
      | GooglePay | PAYMENT INIT STARTED |
      | GooglePay | <gp_payment_init>    |

    Examples:
      | config            | gp_payment_init        |
      | GOOGLE_PAY_CONFIG | PAYMENT INIT COMPLETED |
      | APPLE_PAY_CONFIG  | PAYMENT INIT COMPLETED |
#      | APPLE_PAY_CONFIG  | PAYMENT INIT FAILED | STJS-2202
