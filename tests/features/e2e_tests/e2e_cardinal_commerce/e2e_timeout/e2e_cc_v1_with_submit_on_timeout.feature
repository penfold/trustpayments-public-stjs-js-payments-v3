@cardinal_commerce_v1
Feature: Cardinal Commerce E2E tests v1 with redirection after payment - Timeout
  As a user
  I want to use card payments method
  In order to check Cardinal Commerce integration


  Scenario Outline: TC_5 - Timeout with submitOnSuccess and request type: <request_types>
    Given JS library configured by inline params SUBMIT_ON_SUCCESS_ERROR_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
      | sitereference           | test_james38641 |
    And User opens example page
    When User fills payment form with defined card AMERICAN_EXPRESS_TIMEOUT_CARD
    And User clicks Pay button
    And User waits to be sent into page with url "www.example.com" after gateway timeout
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value              |
      | errormessage         | <errormessage>     |
      | baseamount           | <baseamount>       |
      | currencyiso3a        | <currencyiso3a>    |
      | errorcode            | <errorcode>        |
      | status               | should be none     |
      | transactionreference | should not be none |
      | jwt                  | should not be none |
      | settlestatus         | 0                  |

    Examples:
      | request_types            | errormessage                            | baseamount     | currencyiso3a  | errorcode |
      | THREEDQUERY AUTH         | Payment has been successfully processed | 1000           | GBP            | 0         |
      | ACCOUNTCHECK THREEDQUERY | Communication error                     | should be none | should be none | 50012     |
      | THREEDQUERY ACCOUNTCHECK | Payment has been successfully processed | 1000           | GBP            | 0         |

