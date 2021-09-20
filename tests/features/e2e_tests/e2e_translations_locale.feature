@translations
Feature: Payment form translations from jwt locale
  As a user
  I want to use card payments method
  In order to check full payment functionality in various languages


  Scenario Outline: <locale> translations of fields labels, pay button and fields validation message
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
      | locale                  | <locale>         |
    And User opens example page
    And User waits for Pay button to be active
    Then User will see all labels displayed on page translated into "<locale>"
    And User will see that Pay button text translated into "<locale>"
    When User clicks Pay button
    Then User will see validation message "Field is required" under all fields translated into "<locale>"

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
    Then User will see payment notification text: "Payment has been successfully processed" translated into "<locale>"

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
    Then User will see payment notification text: "An error occurred" translated into "<locale>"

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

