@reactJS
@angular
@vueJS
@react_native
Feature: E2E Successful payments on SPA app

  As a user
  I want to use card payments method embeded on SPA example pages
  In order to check full payment functionality

  Scenario Outline: SPA app - successfully processed payments with tabs change for <Card>
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    And User fills payment form with defined card MASTERCARD_CARD
    And User clicks Pay button
    And User will see notification frame text: "Payment has been successfully processed"
    When User switch tab to 'Personal Data' in reactjs app
    And User switch tab to 'Home' in reactjs app
    And User fills payment form with defined card <Card>
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"

    Examples:
      | Card            |
      | VISA_CARD       |
      | MASTERCARD_CARD |

  Scenario: SPA app - successfully processed payments with tabs change and update JWT
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    And User calls updateJWT function by filling amount field
    And User fills payment form with defined card VISA_CARD
    And User clicks Pay button
    And User will see notification frame text: "Payment has been successfully processed"
    When User switch tab to 'Personal Data' in reactjs app
    And User switch tab to 'Home' in reactjs app
    And User fills payment form with defined card VISA_CARD
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"

  Scenario: SPA app - decline payment and then successful payment
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    And User fills payment form with defined card MASTERCARD_DECLINED_CARD
    And User clicks Pay button
    And User will see notification frame text: "Decline"
    When User switch tab to 'Personal Data' in reactjs app
    And User switch tab to 'Home' in reactjs app
    And User fills payment form with defined card VISA_CARD
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"

  Scenario: SPA app - successfully processed payment after change tabs
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User switch tab to 'Personal Data' in reactjs app
    And User switch tab to 'Payment' in reactjs app
    And User fills payment form with defined card MASTERCARD_CARD
    And User clicks Pay button
    Then User will see notification frame text: "Payment has been successfully processed"
