Feature: Payment form translations

  As a user
  I want to use card payments method
  In order to check full payment functionality in various languages

  Background:
    Given JavaScript configuration is set for scenario based on scenario's @config tag
    And User opens mock payment page

  @base_config @translations
  Scenario Outline: Checking translations of labels and fields error for <language>
    When User changes page language to "<language>"
    And User waits for whole form to be loaded
    And User waits for Pay button to be active
    And User clicks Pay button
    Then User will see all labels displayed on page translated into "<language>"
    And User will see validation message "Field is required" under all fields translated into "<language>"

    Examples:
      | language |
      | de_DE    |
    Examples:
      | language |
      | en_GB    |
      | fr_FR    |
      | en_US    |
      | cy_GB    |
      | da_DK    |
      | es_ES    |
      | nl_NL    |
      | no_NO    |
      | sv_SE    |

  @base_config  @translations
  Scenario Outline: Cardinal Commerce - checking "Success" status translation for <language>
    When User changes page language to "<language>"
    When User fills payment form with defined card MASTERCARD_SUCCESSFUL_FRICTIONLESS_AUTH
    And THREEDQUERY, AUTH mock response is set to OK
    And User clicks Pay button
    Then User will see "Payment has been successfully processed" payment status translated into "<language>"

    Examples:
      | language |
      | de_DE    |
    Examples:
      | language |
      | de_DE    |
      | en_GB    |
      | fr_FR    |
      | en_US    |
      | cy_GB    |
      | da_DK    |
      | es_ES    |
      | nl_NL    |
      | no_NO    |
      | sv_SE    |

  @config_translations
  Scenario: Check translation overwriting mechanism for notification banner
    Given User opens mock payment page
    When User fills payment form with defined card MASTERCARD_SUCCESSFUL_FRICTIONLESS_AUTH
    And THREEDQUERY, AUTH mock response is set to OK
    And User clicks Pay button
    Then User will see payment status information: "Victory"

  @config_translations
  Scenario: Check translation overwriting mechanism for Pay button and validation message
    Given User opens mock payment page
    And User waits for whole form to be displayed
    Then User will see card payment label displayed on page translated into "Kartennummer"
    And User clicks Pay button
    Then User will see that Pay button is translated into "Kup teraz!"
    And User will see validation message "This is wrong" under all fields
