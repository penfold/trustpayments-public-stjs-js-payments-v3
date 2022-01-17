# Created by amiendlarzewski at 12.01.2022
Feature: As a User I would like to be able to
  pay with Visa click to pay

  @smoke_e2e_test
  Scenario: Successful Authentication by Visa click 2 pay
    Given JS library configured by inline config BASIC_CONFIG
    And User opens example page VISA_CLICK_TWO_PAY
    And User clicks on Visa Click two Pay button
    When User fills Visa Click two Pay required fields
    And User confirms new address at Visa Click two Pay popup
    Then User successfully pays with Visa Click two Pay


