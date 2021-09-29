@translations
Feature: Payment form translations from jwt locale with 3ds SDK library
  As a user
  I want to use card payments method
  In order to check full payment functionality in various languages


  @3ds_sdk
  Scenario Outline: <locale> translation for 3ds SDK library challenge Cancel button
    Given JS library configured by inline params THREE_DS_SDK_POPUP_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value             |
      | requesttypedescriptions | THREEDQUERY AUTH  |
      | locale                  | <locale>          |
      | sitereference           | trustthreeds76424 |
      | customercountryiso2a    | GB                |
      | billingcountryiso2a     | GB                |
    And User opens example page
    And User fills payment form with defined card MASTERCARD_V21_3DS_SDK_NON_FRICTIONLESS
    When User clicks Pay button
    And User see 3ds SDK challenge is displayed
    Then User see 3ds SDK challenge POPUP mode "cancel" button translated into <locale>

    @3ds_sdk_smoke
    Examples:
      | locale |
      | en_GB  |
      | fr_FR  |

    Examples:
      | locale |
      | en_US  |
      | cy_GB  |
      | da_DK  |
      | de_DE  |
      | es_ES  |
      | nl_NL  |
      | no_NO  |
      | sv_SE  |
