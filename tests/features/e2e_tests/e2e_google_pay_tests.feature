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
    When User clicks on Google Pay button
    And User fills google account <email address>
    And User fills google account <password>
    And User press next button
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    Examples:
      | email address            | password        |
      | securetestpgs4@gmail.com | securetestpgs1! |

    Examples:
      | requesttypedescriptions               |
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

    @launch1
  Scenario Outline: Successful Payment with Google Pay test cards
    Given JS library configured by inline params GOOGLE_PAY_CONFIG and jwt BASE_JWT with additional attributes
    And User opens example page
    When User clicks on Google Pay button
    And User fills google account <email address>
    And User fills google account <password>
    And User selects  google test <card>
    And User press next button
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    Examples:
      | email address            | password        |
      | securetestpgs4@gmail.com | securetestpgs1! |
    Examples:
      | card       |
      | VISA       |
      | MASTERCARD |
      | DISCOVER   |
      | AMEX       |
      | VISA       |


  Scenario Outline: User selects Payment with Google Pay - account without test cards
    Given JS library configured by inline params GOOGLE_PAY_CONFIG and jwt BASE_JWT with additional attributes
    And User opens example page
    When User clicks on Google Pay button
    And User fills google account <email address>
    And User fills google account <password>
    Then User will see card details to be filled
    And User will see address details to be filled
    Examples:
      | email address           | password                 |
      | securetestpgs@gmail.com | securetestpgs/K5vXO+hZvQ |

  Scenario Outline: Successful Payment with Google Pay test cards
    Given JS library configured by inline params GOOGLE_PAY_CONFIG and jwt BASE_JWT with additional attributes
    And User opens example page
    When User clicks on Google Pay button
    And User fills google account <email address>
    And User fills google account <password>
    And User selects  google test <card>
    And User press next button
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    Examples:
      | email address            | password        |
      | securetestpgs4@gmail.com | securetestpgs1! |
    Examples:
      | card       |
      | VISA       |
      | MASTERCARD |
      | DISCOVER   |
      | AMEX       |
      | VISA       |
