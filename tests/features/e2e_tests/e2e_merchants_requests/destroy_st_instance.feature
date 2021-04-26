@merchant_feature_destroy_st
Feature: Destroy ST instance
  As a merchant
  I should be able to destroy ST instance

  Scenario: Destroy ST instance
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    And User waits for Pay button to be active
    And User toggle action buttons bar
    And User clicks Destroy ST action button
    Then User will see that CARD_NUMBER iframe is not available
    And User will see that EXPIRATION_DATE iframe is not available
    And User will see that SECURITY_CODE iframe is not available
    And User will see that CONTROL_FRAME iframe is not available
