# Created by amiendlarzewski at 14.05.2021
Feature: Handle cancel event
 As a user
  I want to be able to cancel card payments
  So that 3ds won't charge me

  Scenario: Cancel payment with 3ds library
    Given JS library configured by inline params LIBRARY_3DS_CONFIG and jwt BASE_JWT with additional attributes


  Scenario: Cancel payment with 3ds library using popup
    Given JS library configured by inline params LIBRARY_3DS_CONFIG and jwt BASE_JWT with additional attributes
