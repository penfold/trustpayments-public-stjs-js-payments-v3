@cardinal_commerce_v2.0_VISA_V21
Feature: Cardinal Commerce E2E tests with redirection after payment - Timeout - Visa v2.1
  As a user
  I want to use card payments method
  In order to check Cardinal Commerce integration


  Scenario Outline: TC_8 - Timeout on cmpi_lookup Transaction with submitOn - Card: VISA_V21_TIMEOUT_ON_CMPI_LOOKUP_TRANSACTION
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key             | value |
      | submitOnSuccess | true  |
      | submitOnError   | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_V21_TIMEOUT_ON_CMPI_LOOKUP_TRANSACTION
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value              |
      | errormessage         | <errormessage>     |
      | baseamount           | <baseamount>       |
      | currencyiso3a        | <currencyiso3a>    |
      | errorcode            | <errorcode>        |
      | transactionreference | should not be none |
      | jwt                  | should not be none |
      | enrolled             | U                  |
      | settlestatus         | <settlestatus>     |
      | status               | should be none     |

    Examples:
      | request_types            | errormessage                            | baseamount     | currencyiso3a  | errorcode | settlestatus |
      | THREEDQUERY AUTH         | Payment has been successfully processed | 1000           | GBP            | 0         | 0            |
      | ACCOUNTCHECK THREEDQUERY | Bank System Error                       | should be none | should be none | 60010     | 0            |
      | THREEDQUERY ACCOUNTCHECK | Payment has been successfully processed | 1000           | GBP            | 0         | 0            |
