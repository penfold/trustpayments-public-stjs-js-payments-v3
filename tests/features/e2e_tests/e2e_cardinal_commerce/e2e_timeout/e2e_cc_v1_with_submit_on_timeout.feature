@cardinal_commerce_v1
Feature: Cardinal Commerce E2E tests v1 with redirection after payment - Timeout
  As a user
  I want to use card payments method
  In order to check Cardinal Commerce integration


  Scenario Outline: TC_5 - Timeout with submitOnSuccess and request type: <request_types>
    Given JS library configured by inline params SUBMIT_ON_SUCCESS_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
      | sitereference           | test_james38641 |
    And User opens example page
    When User fills payment form with defined card AMERICAN_EXPRESS_TIMEOUT_CARD
    And User clicks Pay button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | <baseamount>                            |
      | currencyiso3a        | <currencyiso3a>                         |
      | errorcode            | 0                                       |
      | status               | should be none                          |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |
      | enrolled             | U                                       |
      | settlestatus         | 0                                       |
      | eci                  | <eci>                                   |

    Examples:
      | request_types            | baseamount     | currencyiso3a  | eci            |
      | THREEDQUERY AUTH         | 1000           | GBP            | 07             |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | should be none |
