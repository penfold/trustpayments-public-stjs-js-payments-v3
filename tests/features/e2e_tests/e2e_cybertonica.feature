Feature: E2E Cybertonica

  As a user
  I want to use card payments method with cybertonica config
  In order to check full payment functionality

  @e2e_smoke_test
  @e2e_config_cybertonica
  Scenario: Cybertonica - successfull payment
    Given JS library configured by inline params CYBERTONICA_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_SUCCESSFUL_AUTH_CARD
    And User clicks Pay button
    And User fills V1 authentication modal
    Then User will see payment status information: "Payment has been successfully processed"

  @e2e_config_cybertonica_bypass_cards
  @bypass_property
  Scenario: Cybertonica - successfull payment with bypass_pass
    Given JS library configured by inline params CYBERTONICA_WITH_BYPASSCARDS_CONFIG and jwt BASE_JWT with additional attributes
      | key                      | value                         |
      | requesttypedescriptions  | THREEDQUERY AUTH              |
      | threedbypasspaymenttypes | VISA AMEX DISCOVER JCB DINERS |
    And User opens example page
    When User fills payment form with defined card VISA_CARD
    And User clicks Pay button
    Then User will see payment status information: "Payment has been successfully processed"
    And User will see that notification frame has "green" color

  @e2e_config_cybertonica
  Scenario: Cybertonica - successfull payment with startOnLoad
    Given JS library configured by inline params CYBERTONICA_START_ON_LOAD_CONFIG and jwt JWT_WITH_NON_FRICTIONLESS_CARD with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page WITHOUT_SUBMIT_BUTTON
    And User fills V2 authentication modal
    Then User will see payment status information: "Payment has been successfully processed"
