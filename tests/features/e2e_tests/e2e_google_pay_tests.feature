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
    And User fills google account email address
    And User fills google account password
    When User selects VISA_V21_FRICTIONLESS card on visa checkout popup
    And User confirms displayed card with data
    And User confirms visa checkout security code
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color

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
