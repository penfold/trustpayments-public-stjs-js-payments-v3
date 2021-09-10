@translations
Feature: Payment form translations from jwt locale
  As a user
  I want to use card payments method
  In order to check full payment functionality in various languages


  Scenario Outline: <locale> translations of fields labels and validation errors
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
      | locale                  | <locale>         |
    And User opens example page
    Then User will see all labels displayed on page translated into "<locale>"
    When User clicks Pay button
    And User will see validation message "Field is required" under all fields translated into "<locale>"

    Examples:
      | locale |
      | de_DE  |
      | en_GB  |
      | fr_FR  |
      | en_US  |
      | cy_GB  |
      | da_DK  |
      | es_ES  |
      | nl_NL  |
      | no_NO  |
      | sv_SE  |


  Scenario Outline: <locale> translation for "Success" payment notification
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
      | locale                  | <locale>         |
    And User opens example page
    When User fills payment form with defined card VISA_V21_SUCCESSFUL_FRICTIONLESS_AUTH
    And User clicks Pay button
    Then User will see payment notification "Payment has been successfully processed" translated into "<locale>"

    Examples:
      | locale |
      | de_DE  |
      | en_GB  |
      | fr_FR  |
      | en_US  |
      | cy_GB  |
      | da_DK  |
      | es_ES  |
      | nl_NL  |
      | no_NO  |
      | sv_SE  |


  Scenario Outline: <locale> translation for "Error" payment notification
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
      | locale                  | <locale>         |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_ERROR_ON_AUTH
    And User clicks Pay button
    And User fills V2 authentication modal
    Then User will see payment notification "An error occurred" translated into "<locale>"

    Examples:
      | locale |
      | de_DE  |
      | en_GB  |
      | fr_FR  |
      | en_US  |
      | cy_GB  |
      | da_DK  |
      | es_ES  |
      | nl_NL  |
      | no_NO  |
      | sv_SE  |


  @animated_card
  Scenario Outline: <locale> translations for animated card labels
    Given JS library configured by inline params ANIMATED_CARD_PAN_ICON_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
      | locale                  | <locale>         |
    And User opens example page
    When User fills payment form with defined card AMEX_CARD
    Then User will see that labels displayed on animated card are translated into "<locale>"

    Examples:
      | locale |
      | de_DE  |
      | en_GB  |
      | fr_FR  |
      | en_US  |
      | cy_GB  |
      | da_DK  |
      | es_ES  |
      | nl_NL  |
      | no_NO  |
      | sv_SE  |


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
