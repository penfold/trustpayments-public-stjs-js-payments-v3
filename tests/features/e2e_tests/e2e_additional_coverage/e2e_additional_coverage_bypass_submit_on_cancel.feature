Feature: request type with submit on cancel and bypasscard - full test coverage

  Scenario Outline: cancelled visa checkout payment with request types <request_types>, bypass and submit on cancel
    Given JS library configured with VISA_CHECKOUT_CONFIG and additional attributes
      | key            | value |
      | submitOnCancel | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                      | value           |
      | requesttypedescriptions  | <request_types> |
      | threedbypasspaymenttypes | VISA MASTERCARD |
    When User opens example page
    And User clicks on Visa Checkout button
    And User closes the visa checkout popup
    Then User will not see notification frame
    And User will be sent to page with url "example.org" having params
      | key          | value                      |
      | errormessage | Payment has been cancelled |
      | errorcode    | cancelled                  |

    Examples:
      | request_types                         |
      | AUTH                                  |
      | RISKDEC                               |
      | THREEDQUERY                           |
      | ACCOUNTCHECK                          |
      | RISKDEC THREEDQUERY AUTH              |
      | THREEDQUERY AUTH RISKDEC              |
      | ACCOUNTCHECK THREEDQUERY              |
      | ACCOUNTCHECK THREEDQUERY AUTH         |
      | RISKDEC THREEDQUERY ACCOUNTCHECK      |
      | RISKDEC THREEDQUERY                   |
      | RISKDEC ACCOUNTCHECK AUTH             |
      | THREEDQUERY ACCOUNTCHECK              |
      | THREEDQUERY AUTH                      |
      | RISKDEC ACCOUNTCHECK THREEDQUERY AUTH |
      | RISKDEC AUTH                          |
      | RISKDEC ACCOUNTCHECK THREEDQUERY      |
      | ACCOUNTCHECK AUTH                     |
      | RISKDEC ACCOUNTCHECK                  |
      | AUTH RISKDEC                          |

  Scenario Outline: cancelled visa checkout payment with request types <request_types>, bypass and submit on cancel
    Given JS library configured with VISA_CHECKOUT_CONFIG and additional attributes
      | key            | value |
      | submitOnCancel | true  |
    And JS library authenticated by jwt JWT_WITH_SUBSCRIPTION with additional attributes
      | key                      | value           |
      | requesttypedescriptions  | <request_types> |
      | threedbypasspaymenttypes | VISA MASTERCARD |
    When User opens example page
    And User clicks on Visa Checkout button
    And User closes the visa checkout popup
    Then User will not see notification frame
    And User will be sent to page with url "example.org" having params
      | key          | value                      |
      | errormessage | Payment has been cancelled |
      | errorcode    | cancelled                  |

    Examples:
      | request_types                                      |
      | RISKDEC ACCOUNTCHECK AUTH SUBSCRIPTION             |
      | THREEDQUERY AUTH SUBSCRIPTION                      |
      | RISKDEC THREEDQUERY AUTH SUBSCRIPTION              |
      | ACCOUNTCHECK SUBSCRIPTION                          |
      | ACCOUNTCHECK AUTH SUBSCRIPTION                     |
      | RISKDEC AUTH SUBSCRIPTION                          |
      | THREEDQUERY ACCOUNTCHECK SUBSCRIPTION              |
      | AUTH SUBSCRIPTION                                  |
      | ACCOUNTCHECK THREEDQUERY AUTH SUBSCRIPTION         |
      | RISKDEC ACCOUNTCHECK THREEDQUERY AUTH SUBSCRIPTION |
      | RISKDEC THREEDQUERY ACCOUNTCHECK SUBSCRIPTION      |
