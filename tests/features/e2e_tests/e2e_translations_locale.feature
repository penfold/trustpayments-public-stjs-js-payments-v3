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
    And JS library configured with Tokenized Card BASE_JWT with additional attributes
      | key                        | value            |
      | requesttypedescriptions    | THREEDQUERY AUTH |
      | credentialsonfile          | 2                |
      | parenttransactionreference | 56-9-2255170     |
    And User opens example page WITH_TOKENIZED_CARD
    And User waits for Tokenized Card payment to be loaded
    And User waits for Pay button to be active
    Then User will see labels displayed on page translated into "<locale>"
      | fields                      |
      | Card number                 |
      | Expiration date             |
      | Expiration date placeholder |
      | Security code               |
      | Tokenized security code     |
      | Tokenized pay button        |
      | Pay                         |
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
      | it_IT  |


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
      | it_IT  |


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
      | it_IT  |


  @animated_card
  Scenario Outline: <locale> translations for animated card labels
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key          | value |
      | panIcon      | true  |
      | animatedCard | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
      | locale                  | <locale>         |
    And User opens example page
    And User waits for Pay button to be active
    When User fills payment form with defined card AMEX_CARD
    Then User will see labels displayed on animated card translated into "<locale>"
      | fields          |
      | Card number     |
      | Expiration date |
      | Security code   |

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
      | it_IT  |

  @animated_card
  Scenario Outline: <locale> translations for blank animated card labels
    Given JS library configured with BASIC_CONFIG and additional attributes
      | key          | value |
      | panIcon      | true  |
      | animatedCard | true  |
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
      | locale                  | <locale>         |
    And User opens example page
    And User waits for Pay button to be active
    When User focuses on "ANIMATED_CARD" field
    Then User will see labels displayed on animated card translated into "<locale>"
      | fields                      |
      | Card number                 |
      | Expiration date             |
      | Expiration date placeholder |

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
      | it_IT  |


  Scenario Outline: <locale> translation with placeholders overwritten by config
    Given JS library configured by inline params PLACEHOLDERS_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
      | locale                  | <locale>         |
    When User opens example page
    And User waits for Pay button to be active
    Then User will see specific placeholders in input fields: Number, Expiration, CVV
    And User will see labels displayed on page translated into "<locale>"
      | fields          |
      | Card number     |
      | Expiration date |
      | Security code   |
      | Pay             |

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
      | it_IT  |
