@merchant_feature_destroy_st
Feature: Destroy ST instance
  As a merchant
  I should be able to destroy ST instance

  Scenario: Destroy ST instance
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    And User toggle action buttons bar
    When User clicks Remove frames action button
    And User clicks Destroy ST action button
    Then User will see that application is not fully loaded
