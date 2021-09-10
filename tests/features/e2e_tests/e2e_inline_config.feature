@inline_config
Feature: Payment form styles check

  As a user
  I want to use inline config
  In order to check payment form functionality


  Scenario: Check translation overwriting mechanism for Pay button and validation message
    Given JS library configured by inline params CUSTOM_TRANSLATION_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    When User opens example page
    And User waits for Pay button to be active
    Then User will see that Pay button is translated into "KupTeraz!"


  Scenario: Notification frame is not displayed after payment
    Given JS library configured by inline params DISABLE_NOTIFICATION_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    When User opens example page
    And User fills payment form with defined card MASTERCARD_CARD
    And User clicks Pay button
    Then User will not see notification frame
