# Created by amiendlarzewski at 12.04.2021
Feature: Google payments
  As a user
  I want to use Google payment method
  In order to check full payment functionality


  Scenario Outline: Successful Authentication with Google Pay
    Given JS library configured by inline params GOOGLE_PAY_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value                     |
      | requesttypedescriptions | <requesttypedescriptions> |
    And User opens example page
    And User clicks on Google Pay button
    And User will see Google Pay login window
    And User fills google account <email> address
    And User fills google account <password>
    When User press next button
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And "submit" callback is called only once
    And "success" callback is called only once
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: False

    Examples:
      | requesttypedescriptions  | email                    | password
      | THREEDQUERY AUTH         | securetestpgs4@gmail.com | securetestpgs1! |
      | ACCOUNTCHECK THREEDQUERY | securetestpgs4@gmail.com | securetestpgs1! |
      | THREEDQUERY ACCOUNTCHECK | securetestpgs4@gmail.com | securetestpgs1! |


  Scenario Outline: Successful Payment with Google Pay test cards
    Given JS library configured by inline params GOOGLE_PAY_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value                     |
      | requesttypedescriptions | <requesttypedescriptions> |
    And User opens example page
    And User clicks on Google Pay button
    And User will see Google Pay login window
    And User fills google account <email>
    And User fills google account <password>
    And User selects  google test <card>
    When User press next button
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And "submit" callback is called only once
    And "success" callback is called only once
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: False

    Examples:
      | requesttypedescriptions  | email                    | password        | card       |
      | THREEDQUERY AUTH         | securetestpgs4@gmail.com | securetestpgs1! | VISA       |
      | ACCOUNTCHECK THREEDQUERY | securetestpgs4@gmail.com | securetestpgs1! | MASTERCARD |
      | THREEDQUERY ACCOUNTCHECK | securetestpgs4@gmail.com | securetestpgs1! | DISCOVER   |
      | THREEDQUERY AUTH         | securetestpgs4@gmail.com | securetestpgs1! | AMEX       |
      | ACCOUNTCHECK THREEDQUERY | securetestpgs4@gmail.com | securetestpgs1! | VISA       |


  Scenario Outline: User selects Payment with Google Pay - account without test cards
    Given JS library configured by inline params GOOGLE_PAY_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value                     |
      | requesttypedescriptions | <requesttypedescriptions> |
    And User opens example page
    When User clicks on Google Pay button
    And User will see Google Pay login window
    And User fills google account <email>
    And User fills google account <password>
    Then User will see card details to be filled
    And User will see address details to be filled

    Examples:
      | requesttypedescriptions  | email                   | password
      | THREEDQUERY AUTH         | securetestpgs@gmail.com | securetestpgs/K5vXO+hZvQ |
      | ACCOUNTCHECK THREEDQUERY | securetestpgs@gmail.com | securetestpgs/K5vXO+hZvQ |
      | THREEDQUERY ACCOUNTCHECK | securetestpgs@gmail.com | securetestpgs/K5vXO+hZvQ |


  Scenario Outline: User Aborts Google Payment - cancelled transaction
    Given JS library configured by inline params GOOGLE_PAY_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value                     |
      | requesttypedescriptions | <requesttypedescriptions> |
    And User opens example page
    And User clicks on Google Pay button
    And User will see Google Pay login window
    When User closes Google Pay login window
    Then User will see payment status information: "Payment has been cancelled"
    And User will see that notification frame has "yellow" color
    And "cancel" callback is called only once
    And "cancel" callback is called only once
    Examples:
      | requesttypedescriptions  |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |
      | THREEDQUERY ACCOUNTCHECK |

  Scenario Outline: Successful Google payment with updated jwt
    Given JS library configured by inline params GOOGLE_PAY_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page WITH_UPDATE_JWT
      | jwtName          |
      | BASE_UPDATED_JWT |
    And User clicks on Google Pay button
    And User will see Google Pay login window
    And User fills google account <email> address
    And User fills google account <password>
    When User press next button
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    And "submit" callback is called only once
    And "success" callback is called only once
    And submit callback contains JWT response
    Examples:
      | email                    | password
      | securetestpgs4@gmail.com | securetestpgs1! |
      | securetestpgs4@gmail.com | securetestpgs1! |
      | securetestpgs4@gmail.com | securetestpgs1! |

  Scenario Outline: Successful Google payment with submitOnSuccess enabled
    Given JS library configured by inline params GOOGLE_PAY_WITH_SUBMIT_ON_SUCCESS_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User clicks on Google Pay button
    And User will see Google Pay login window
    And User fills google account <email> address
    And User fills google account <password>
    When User press next button
    Then User will be sent to page with url "www.example.com" having params
      | key                  | value                                   |
      | errormessage         | Payment has been successfully processed |
      | baseamount           | <baseamount>                            |
      | currencyiso3a        | <currencyiso3a>                         |
      | errorcode            | 0                                       |
      | threedresponse       | <threedresponse>                        |
      | enrolled             | U                                       |
      | settlestatus         | 0                                       |
      | transactionreference | should not be none                      |
      | jwt                  | should not be none                      |

    Examples:
      | request_types            | threedresponse | baseamount     | currencyiso3a  | email                    | password
      | THREEDQUERY AUTH         | should be none | 1000           | GBP            | securetestpgs4@gmail.com | securetestpgs1! |
      | ACCOUNTCHECK THREEDQUERY | should be none | should be none | should be none | securetestpgs4@gmail.com | securetestpgs1! |
