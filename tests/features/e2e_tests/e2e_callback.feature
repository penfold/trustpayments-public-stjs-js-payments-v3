@submit_callback @callback
Feature: callbacks

  @success_callback @smoke_test
  Scenario Outline: success and submit callback for successful payment - challenge flow
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card VISA_V21_NON_FRICTIONLESS
    And User clicks Pay button
    And User fills V2 authentication modal
    Then User will see payment status information: "Payment has been successfully processed"
    And "submit" callback is called only once
    And "success" callback is called only once
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: <threedresponse_defined>

    Examples:
      | request_types            | threedresponse_defined |
      | THREEDQUERY AUTH         | False                  |
      | ACCOUNTCHECK THREEDQUERY | True                   |

  @success_callback
  Scenario Outline: success and submit callback for successful payment - frictionless payment
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_SUCCESSFUL_FRICTIONLESS_AUTH
    And User clicks Pay button
    Then User will see payment status information: "Payment has been successfully processed"
    And "submit" callback is called only once
    And "success" callback is called only once
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: False

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |

  @error_callback
  Scenario Outline: error and submit callback for unsuccessful payment
    Given JS library configured by inline params BASIC_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value           |
      | requesttypedescriptions | <request_types> |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_ERROR_ON_AUTH
    And User clicks Pay button
    And User fills V2 authentication modal
    Then User will see payment status information: "An error occurred"
    And "submit" callback is called only once
    And "error" callback is called only once
    And submit callback contains JWT response
    And submit callback contains THREEDRESPONSE: True

    Examples:
      | request_types            |
      | THREEDQUERY AUTH         |
      | ACCOUNTCHECK THREEDQUERY |

#  @cancel_callback
#  Scenario Outline: cancel and submit callback for cancelled payment
#    Given JS library configured by inline params VISA_CHECKOUT_CONFIG and jwt BASE_JWT with additional attributes
#      | key                     | value           |
#      | requesttypedescriptions | <request_types> |
#    When User opens example page CANCEL_CALLBACK
#    And User clicks on Visa Checkout button
#    And User closes the visa checkout popup
#    And user waits for payment to be processed
#    Then "cancel" callback is called only once
#    And "submit" callback is called only once
#    And submit callback contains JWT response
#    And submit callback contains THREEDRESPONSE: <threedresponse_defined>
#
#    Examples:
#      | request_types            | threedresponse_defined |
#      | THREEDQUERY AUTH         | False                  |
#      | ACCOUNTCHECK THREEDQUERY | True                   |
