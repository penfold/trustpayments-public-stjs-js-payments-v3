Feature:Animated card translations

  As a user
  I want to use card payments method
  In order to check animated card functionality in various languages

  @animated_card @translations
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
