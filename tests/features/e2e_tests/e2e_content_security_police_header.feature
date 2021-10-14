Feature: E2E Card Payments with content-security-police header set

  As a user
  I want to use card payments method with request types config
  In order to check full payment functionality when content-security-header is set


  Scenario Outline: Successful payment with submitOnSuccess=false for VISA_V21_FRICTIONLESS card and <request_types> request_types combination
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens minimal-content-security-header.html page with inline param
    When User fills payment form with defined card VISA_V21_FRICTIONLESS
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And User will see that Pay button is "disabled"
    And User will see that ALL input fields are "disabled"

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |


  Scenario Outline: Successful payment with submitOnSuccess=false for VISA_V21_NON_FRICTIONLESS card and <request_types> request_types combination
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens minimal-content-security-header.html page with inline param
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    And User fills V2 authentication modal
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And User will see that Pay button is "disabled"
    And User will see that ALL input fields are "disabled"

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |


  Scenario Outline: Successful payment with submitOnSuccess=true for VISA_V21_FRICTIONLESS card and <request_types> request_types combination
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key             | value |
      | submitOnSuccess | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens minimal-content-security-header.html page with inline param
    When User fills payment form with defined card VISA_V21_FRICTIONLESS
    And User clicks Pay button
    Then User will not see notification frame
    And User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | <baseamount>                            |
      | currencyiso3a        | <currencyiso3a>                         |
      | errorcode            | 0                                       |
      | threedresponse       | <threedresponse>                        |
      | enrolled             | Y                                       |
      | settlestatus         | 0                                       |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |

    Examples:
      | request_types            | threedresponse | baseamount     | currencyiso3a  |
      | THREEDQUERY AUTH         | should be none | 1000           | GBP            |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | should be none |


  Scenario Outline: Successful payment with submitOnSuccess=true for VISA_V21_NON_FRICTIONLESS card and <request_types> request_types combination
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key             | value |
      | submitOnSuccess | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens minimal-content-security-header.html page with inline param
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    And User fills V2 authentication modal
    Then User will not see notification frame
    And User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | <baseamount>                            |
      | currencyiso3a        | <currencyiso3a>                         |
      | errorcode            | 0                                       |
      | threedresponse       | <threedresponse>                        |
      | enrolled             | Y                                       |
      | settlestatus         | 0                                       |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |

    Examples:
      | request_types            | threedresponse     | baseamount     | currencyiso3a  |
      | THREEDQUERY AUTH         | should be none     | 1000           | GBP            |
      | ACCOUNTCHECK THREEDQUERY | should not be none | should be none | should be none |


  Scenario Outline: Successful payment with submitOnSuccess=false, bypass for VISA_V21_NON_FRICTIONLESS card and <request_types> request_types combination
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                      | value           |
      | requesttypedescriptions  | <request_types> |
      | threedbypasspaymenttypes | VISA            |
    And User opens minimal-content-security-header.html page with inline param
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And User will see that Pay button is "disabled"
    And User will see that ALL input fields are "disabled"

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |


  Scenario Outline: Successful payment with submitOnSuccess=true, bypass for VISA_V21_NON_FRICTIONLESS card and <request_types> request_types combination
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key             | value |
      | submitOnSuccess | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                      | value           |
      | requesttypedescriptions  | <request_types> |
      | threedbypasspaymenttypes | VISA            |
    And User opens minimal-content-security-header.html page with inline param
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    Then User will not see notification frame
    And User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | <baseamount>                            |
      | currencyiso3a        | <currencyiso3a>                         |
      | errorcode            | 0                                       |
      | threedresponse       | <threedresponse>                        |
      | settlestatus         | 0                                       |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |

    Examples:
      | request_types            | threedresponse | baseamount | currencyiso3a |
      | THREEDQUERY AUTH         | should be none | 1000       | GBP           |
      | ACCOUNTCHECK THREEDQUERY | should be none | 1000       | GBP           |
