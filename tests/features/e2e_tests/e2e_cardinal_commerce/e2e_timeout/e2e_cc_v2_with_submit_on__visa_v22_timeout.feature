@cardinal_commerce_v2.0_VISA_V22
Feature: Cardinal Commerce E2E tests with redirection after payment - Timeout - Visa v2.2
  As a user
  I want to use card payments method
  In order to check Cardinal Commerce integration


  @cardinal_commerce_v2.0
  Scenario Outline: TC_8 - Timeout on cmpi_lookup Transaction with submitOn - Card: VISA_V22_TIMEOUT_ON_CMPI_LOOKUP_TRANSACTION
    Given JS library configured by inline params SUBMIT_ON_SUCCESS_ERROR_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_V22_TIMEOUT_ON_CMPI_LOOKUP_TRANSACTION
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
