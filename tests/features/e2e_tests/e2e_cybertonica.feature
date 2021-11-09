Feature: E2E Cybertonica

  As a user
  I want to use card payments method with cybertonica config
  In order to check full payment functionality

#TODO - Cybertonica will be replaced by SEON
#  Scenario Outline: Cybertonica - successful payment (non-frictionless)
#    Given JS library configured with BASIC_CONFIG and additional attributes
#      | key               | value |
#      | cybertonicaApiKey | stfs  |
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                     | value            |
#      | requesttypedescriptions | THREEDQUERY AUTH |
#    And User opens example page
#    When User fills payment form with defined card <card>
#    And User clicks Pay button
#    And User fills <threeds_ver> authentication modal
#    Then User will see notification frame text: "Payment has been successfully processed"
#    And User will see following callback type called only once
#      | callback_type |
#      | submit        |
#      | success       |
#
#    Examples:
#      | threeds_ver | card                            |
#      | V1          | MASTERCARD_SUCCESSFUL_AUTH_CARD |
#      | V2          | VISA_V21_NON_FRICTIONLESS       |
#
#
#  Scenario: Cybertonica - successful payment with bypass
#    Given JS library configured with BASIC_CONFIG and additional attributes
#      | key               | value |
#      | cybertonicaApiKey | stfs  |
#    And JS library authenticated by jwt BASE_JWT with additional attributes
#      | key                      | value                         |
#      | requesttypedescriptions  | THREEDQUERY AUTH              |
#      | threedbypasspaymenttypes | VISA AMEX DISCOVER JCB DINERS |
#    And User opens example page
#    When User fills payment form with defined card VISA_CARD
#    And User clicks Pay button
#    Then User will see notification frame text: "Payment has been successfully processed"
#    And User will see that notification frame has "green" color
#    And User will see following callback type called only once
#      | callback_type |
#      | submit        |
#      | success       |
#
#
#  Scenario: Cybertonica - successful payment with startOnLoad
#    Given JS library configured with START_ON_LOAD_CONFIG and additional attributes
#      | key               | value |
#      | cybertonicaApiKey | stfs  |
#    And JS library authenticated by jwt JWT_WITH_NON_FRICTIONLESS_CARD with additional attributes
#      | key                     | value            |
#      | requesttypedescriptions | THREEDQUERY AUTH |
#    And User opens example page WITHOUT_SUBMIT_BUTTON
#    And User fills V2 authentication modal
#    Then User will see notification frame text: "Payment has been successfully processed"
#    And User will see following callback type called only once
#      | callback_type |
#      | submit        |
#      | success       |
