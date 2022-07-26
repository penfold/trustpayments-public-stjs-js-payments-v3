Feature: E2E ZIP Payments
  As a user
  I want to use ZIP payment
  If I use alternative payment method


  Scenario: Successful trigger of payment with accepted values for billingcountryiso2a and currencyiso3a
    Given JS library configured by inline config BASIC_CONFIG
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
      | customerfirstname       | FirstName                                              |
      | customerlastname        | LastName                                               |
      | customeremail           | email@email.com                                        |
      | customerpremise         | Premise                                                |
      | customertown            | test                                                   |
      | customercounty          | test                                                   |
      | customerstreet          | test                                                   |
      | customerpostcode        | PO1 3AX                                                |
      | customercountryiso2a    | GB                                                     |
      | orderreference          | 123445                                                 |
      | currencyiso3a           | GBP                                                    |
      | baseamount              | 1000                                                   |
      | returnurl               | https://this_is_not_existing_page_return_redirect.com  |
    And User opens example page WITH_APM
    And User focuses on APM payment methods section
    When User chooses ZIP from APM list
    And User will be sent to apm page - zip
    And User fills ZIP phone number field
    And User fills ZIP one time password
    Then User will be sent to ZIP order summary page
    And User will be sent to page with url "this_is_not_existing_page_return_redirect.com" having params
      | key                  | value              |
      | orderreference       | 123445             |
      | transactionreference | should not be none |
