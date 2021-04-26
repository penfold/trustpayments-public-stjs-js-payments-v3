Feature: Payment form translations

  As a user
  I want to use card payments method
  In order to check full payment functionality in various languages

  Background:
    Given JavaScript configuration is set for scenario based on scenario's @config tag
    And User opens mock payment page

  @base_config @translations
  Scenario Outline: Checking translation of fields validation for <language>
    When User changes page language to "<language>"
    And User fills payment form with credit card number "4000000000000051 ", expiration date "12/22" and cvv "12"
    And User clicks Pay button
    Then User will see validation message "Value mismatch pattern" under "SECURITY_CODE" field translated into <language>
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

  @base_config @translations
  Scenario Outline: Checking translation of backend fields validation for <language>
    When User changes page language to "<language>"
    And User fills payment form with credit card number "4000000000001059", expiration date "01/22" and cvv "123"
    And InvalidField response set for "CARD_NUMBER"
    And User clicks Pay button
    Then User will see "Invalid field" payment status translated into "<language>"
    Then User will see validation message "Invalid field" under "CARD_NUMBER" field translated into <language>
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
