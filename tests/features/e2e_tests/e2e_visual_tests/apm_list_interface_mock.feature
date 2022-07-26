Feature: Visual regression - apm buttons list
  As a user
  I want to see apms payments options
  To make sure they are displayed properly


  @scrn_apm_interface_payment_method @visual_regression_safari
  Scenario: display list of APM's buttons
    Given JS library configured by inline config VISUAL_MOCK_BASIC_CONFIG
    And JS library configured by inline configAPMs BASIC_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                                                  |
      | requesttypedescriptions | AUTH                                                   |
      | billingfirstname        | FirstName                                              |
      | billinglastname         | LastName                                               |
      | billingemail            | email@email.com                                        |
      | billingpremise          | Premise                                                |
      | billingtown             | test                                                   |
      | billingcounty           | test                                                   |
      | billingstreet           | test                                                   |
      | billingpostcode         | PO1 3AX                                                |
      | billingcountryiso2a     | GB                                                     |
      | orderreference          | 123445                                                 |
      | currencyiso3a           | GBP                                                    |
      | billingdob              | 1980-02-01                                             |
      | iban                    | MT00000000000000000000000000                           |
      | successfulurlredirect   | https://this_is_not_existing_page_success_redirect.com |
      | errorurlredirect        | https://this_is_not_existing_page_error_redirect.com   |
      | cancelurlredirect       | https://this_is_not_existing_page_cancel_redirect.com  |
      | returnurl               | https://this_is_not_existing_page_return_redirect.com  |
    And Frictionless card payment mock responses are set as BASE_JSINIT and payment status SUCCESS
    And User opens minimal.html page with inline params
    And User waits for whole form to be displayed
    And User waits for Pay button to be active
    When User focuses on APM payment methods section
    Then Screenshot is taken after 3 seconds and checked


  @scrn_a2a_customized_button @visual_regression_safari
  Scenario: display customized A2A button
    Given JS library configured by inline config VISUAL_MOCK_BASIC_CONFIG
    And JS library configured by inline configAPMs ATA_CUSTOMIZED_BTN_CONFIG_APM
    And JS library authenticated by jwt BASE_JWT with additional attributes
      | key                     | value                                                 |
      | requesttypedescriptions | AUTH                                                  |
      | baseamount              | 70                                                    |
      | billingfirstname        | FirstName                                             |
      | billingcountryiso2a     | GB                                                    |
      | currencyiso3a           | GBP                                                   |
      | returnurl               | https://this_is_not_existing_page_return_redirect.com |
    And Frictionless card payment mock responses are set as BASE_JSINIT and payment status SUCCESS
    And User opens minimal.html page with inline params
    And User waits for whole form to be displayed
    And User waits for Pay button to be active
    When User focuses on APM payment methods section
    Then Screenshot is taken after 3 seconds and checked
