# Created by amiendlarzewski at 12.01.2022
Feature: As a User I would like to be able to
  pay with Visa click to pay

  Scenario: Successful Authentication by Visa click 2 pay
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    And User clicks on Visa Click two Pay button
    And User fills Visa Click two Pay email address
    And User fills Visa Click two Pay one time password
    When User selects card on Visa Click two Pay popup


