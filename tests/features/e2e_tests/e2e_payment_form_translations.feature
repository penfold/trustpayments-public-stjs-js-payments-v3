Feature: Payment form translations
  As a user
  I want to use card payments method
  In order to check full payment functionality in various languages

  @translations
  Scenario Outline: Checking translations of labels and fields error for <locale>
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
      | locale                  | <locale>         |
    And User opens example page
    When User clicks Pay button
    Then User will see all labels displayed on page translated into "<locale>"
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

  @translations
  Scenario Outline: Checking "Success" status translation for <locale>
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
      | locale                  | <locale>         |
    And User opens example page
    When User fills payment form with defined card VISA_V21_SUCCESSFUL_FRICTIONLESS_AUTH
    And User clicks Pay button
    Then User will see "Payment has been successfully processed" payment status translated into "<locale>"

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

  @translations
  Scenario Outline: Checking "Error" status translation for <locale>
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
      | locale                  | <locale>         |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_ERROR_ON_AUTH
    And User clicks Pay button
    And User fills V2 authentication modal
    Then User will see "An error occurred" payment status translated into "<locale>"

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

  @translations @animated_card
  Scenario Outline: Verify animated card translation for <locale>
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

  @translations @3ds_sdk
  Scenario Outline: Cancel payment with 3ds SDK library - locale translation
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

  @3ds_sdk_smoke @3ds_sdk
  Scenario: Cancel payment with 3ds SDK library - locale translation override by config
    Given JS library configured by inline params THREE_DS_SDK_POPUP_TRANSLATIONS_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value             |
      | requesttypedescriptions | THREEDQUERY AUTH  |
      | sitereference           | trustthreeds76424 |
      | customercountryiso2a    | GB                |
      | billingcountryiso2a     | GB                |
    And User opens example page
    And User fills payment form with defined card MASTERCARD_V21_3DS_SDK_NON_FRICTIONLESS
    When User clicks Pay button
    And User see 3ds SDK challenge is displayed
    Then User see 3ds SDK challenge POPUP mode "cancel" button translation is "INTENTIONALLY_HARDCODED_VALUE"

  Scenario: Check translation overwriting mechanism for notification banner
    Given JS library configured by inline params CUSTOM_TRANSLATION_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_SUCCESSFUL_FRICTIONLESS_AUTH
    And User clicks Pay button
    Then User will see payment status information: "Victory"

  Scenario: Check translation overwriting mechanism for Pay button and validation message
    Given JS library configured by inline params CUSTOM_TRANSLATION_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    Then User will see card number label displayed on page translated into "Kartennummer"
    Then User will see expiration date label displayed on page translated into "Ablaufdatum"
    Then User will see security code label displayed on page translated into "Sicherheitscode"
    And User clicks Pay button
    Then User will see that Pay button is translated into "Kup teraz!"
    And User will see validation message "Incorrect" under all fields
