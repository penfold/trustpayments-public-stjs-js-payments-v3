Feature: Logs


  Scenario Outline: Init logs verification for Card Payments - <config>
    Given JS library configured by inline params <config> and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    And User waits for form inputs to be loaded
    Then User will see following logs
      | name      | step                   |
      | CARD      | PAYMENT INIT STARTED   |
      | CARD      | PAYMENT INIT COMPLETED |
      | ApplePay  | PAYMENT INIT STARTED   |
      | ApplePay  | PAYMENT INIT FAILED    |
      | GooglePay | PAYMENT INIT STARTED   |
      | GooglePay | <gp_payment_init>      |

    Examples:
      | config            | gp_payment_init        |
      | GOOGLE_PAY_CONFIG | PAYMENT INIT COMPLETED |
      | BASIC_CONFIG      | PAYMENT INIT FAILED    |


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
      | APPLE_PAY_CONFIG  | PAYMENT INIT FAILED    |
#      | APPLE_PAY_CONFIG  | PAYMENT INIT FAILED | STJS-2202

  Scenario: Init logs with successful transaction- Card Payments
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    And User waits for form inputs to be loaded
    When User fills payment form with defined card VISA_CARD
    And User clicks Pay button
    Then User will see following logs
      | name      | step                   |
      | CARD      | PAYMENT INIT STARTED   |
      | CARD      | PAYMENT INIT COMPLETED |
      | CARD      | PAYMENT STARTED        |
      | CARD      | PAYMENT COMPLETED      |
      | ApplePay  | PAYMENT INIT STARTED   |
      | ApplePay  | PAYMENT INIT FAILED    |
      | GooglePay | PAYMENT INIT STARTED   |
      | GooglePay | PAYMENT INIT FAILED    |

  Scenario: Init logs with unsuccessful transaction- Card Payments
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
      | baseamount              | 70000            |
    And User opens example page
    And User waits for form inputs to be loaded
    When User fills payment form with defined card VISA_CARD
    And User clicks Pay button
    Then User will see following logs
      | name      | step                   |
      | CARD      | PAYMENT INIT STARTED   |
      | CARD      | PAYMENT INIT COMPLETED |
      | CARD      | PAYMENT STARTED        |
      | CARD      | PAYMENT FAILED         |
      | ApplePay  | PAYMENT INIT STARTED   |
      | ApplePay  | PAYMENT INIT FAILED    |
      | GooglePay | PAYMENT INIT STARTED   |
      | GooglePay | PAYMENT INIT FAILED    |

  Scenario: Init logs with invalid library configuration -  Card Payments
    Given JS library configured by inline params BASIC_CONFIG and jwt INVALID_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    When User opens example page
    And User waits for form inputs to be loaded
    Then User will see following logs
      | name      | step                 |
      | CARD      | PAYMENT INIT STARTED |
      | CARD      | PAYMENT INIT FAILED  |
      | ApplePay  | PAYMENT INIT STARTED |
      | ApplePay  | PAYMENT INIT FAILED  |
      | GooglePay | PAYMENT INIT STARTED |

