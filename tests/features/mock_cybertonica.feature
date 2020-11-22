Feature: Cybertonica

  As a user
  I want to use card payments method with cybertonica config
  In order to check full payment functionality

  Background:
    Given JavaScript configuration is set for scenario based on scenario's @config tag
    And User opens page with payment form

  @config_cybertonica @extended_tests_part_2
  Scenario: Cybertonica - 'fraudcontroltransactionid' flag is added to THREEDQUERY and AUTH requests during payment
    When User fills payment form with defined card VISA_NON_FRICTIONLESS
    And THREEDQUERY mock response is set to "ENROLLED_Y"
    And ACS mock response is set to "OK"
    And User clicks Pay button - AUTH response is set to "OK"
    Then User will see payment status information: "Payment has been successfully processed"
    And THREEDQUERY, AUTH request was sent only once with 'fraudcontroltransactionid' flag
    And AUTH request was sent only once with 'fraudcontroltransactionid' flag

  @base_config
  Scenario: Cybertonica - 'fraudcontroltransactionid' flag is not added to THREEDQUERY and AUTH requests during payment
    When User fills payment form with defined card MASTERCARD_SUCCESSFUL_FRICTIONLESS_AUTH
    And Frictionless THREEDQUERY, AUTH response is set to OK
    And User clicks Pay button
    Then User will see payment status information: "Payment has been successfully processed"
    And THREEDQUERY, AUTH request was sent only once without 'fraudcontroltransactionid' flag

  #Todo - bypass_cards
#  @config_cybertonica_bypass_cards
#  Scenario: Cybertonica - 'fraudcontroltransactionid' flag is added to AUTH requests during payment with bypass_pass
#    When User fills payment form with defined card MASTERCARD_SUCCESSFUL_FRICTIONLESS_AUTH
#    And AUTH response is set to "OK"
#    Then User will see payment status information: "Payment has been successfully processed"
#    And User will see that notification frame has "green" color
#    And AUTH request was sent only once with 'fraudcontroltransactionid' flag

  #ToDo - start_on_load
#  @config_cybertonica_immediate_payment
#  Scenario: Cybertonica - 'fraudcontroltransactionid' flag is added to THREEDQUERY and AUTH requests during 'immediate payment'
#    And THREEDQUERY mock response is set to "ENROLLED_Y"
#    And ACS mock response is set to "OK"
#    And AUTH response is set to "OK"
#    And User opens payment page
#    Then User will see payment status information: "Payment has been successfully processed"
#    And THREEDQUERY, AUTH request was sent only once with 'fraudcontroltransactionid' flag
#    And AUTH request was sent only once with 'fraudcontroltransactionid' flag
