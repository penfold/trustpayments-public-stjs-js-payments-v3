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
    And submit callback contains THREEDRESPONSE: True

    Examples:
      | email                   | password                 |
      | securetestpgs@gmail.com | securetestpgs/K5vXO+hZvQ |
    Examples:
      | requesttypedescriptions  |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |
      | THREEDQUERY ACCOUNTCHECK |


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

    Examples:
      | requesttypedescriptions  |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |
      | THREEDQUERY ACCOUNTCHECK |
    Examples:
      | email               | password           |
      | GOOGLE_TEST_ACCOUNT | GOOGLE_TEST_SECRET |
    Examples:
      | card       |
      | VISA       |
      | MASTERCARD |
      | DISCOVER   |
      | AMEX       |
      | VISA       |


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
      | requesttypedescriptions  |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |
      | THREEDQUERY ACCOUNTCHECK |
    Examples:
      | email                       | password       |
      | GOOGLE_INVALID_TEST_ACCOUNT | INVALID_SECRET |


  Scenario Outline: User selects Payment with Google Pay - account without test cards
    Given JS library configured by inline params GOOGLE_PAY_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value                     |
      | requesttypedescriptions | <requesttypedescriptions> |
    And User opens example page
    When User clicks on Google Pay button
    And User will see Google Pay login window
    And User fills google account <email>
    And User fills google account <password>
    And User selects  google test <card>
    And User press next button
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color
    Examples:
      | requesttypedescriptions  |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |
      | THREEDQUERY ACCOUNTCHECK |
    Examples:
      | email               | password           |
      | GOOGLE_TEST_ACCOUNT | GOOGLE_TEST_SECRET |
    Examples:
      | card       |
      | VISA       |
      | MASTERCARD |
      | DISCOVER   |
      | AMEX       |
      | VISA       |

  Scenario Outline: User Aborts Google Payment - Unsuccessful transaction
    Given JS library configured by inline params GOOGLE_PAY_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value                     |
      | requesttypedescriptions | <requesttypedescriptions> |
    And User opens example page
    And User clicks on Google Pay button
    And User will see Google Pay login window
    When User closes Google Pay login window
    Then User will see payment status information: "An error occurred"
    And User will see that notification frame has "red" color
    Examples:
      | requesttypedescriptions  |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |
      | THREEDQUERY ACCOUNTCHECK |

  Scenario: Successful Google payment with updated jwt
    Given JS library configured by inline params GOOGLE_PAY_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page WITH_UPDATE_JWT
      | jwtName          |
      | BASE_UPDATED_JWT |
    And User clicks on Google Pay button
    And User will see Google Pay login window
    When User closes Google Pay login window
    Then User will see payment status information: "An error occurred"
    And User will see that notification frame has "red" color
