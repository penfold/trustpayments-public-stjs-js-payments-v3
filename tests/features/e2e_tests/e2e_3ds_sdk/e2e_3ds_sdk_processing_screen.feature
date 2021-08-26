Feature: 3ds SDK library - Processing Screen


  Scenario Outline: The <processing_screen_mode> processing screen is visible for payment with v1 frictionless card
    Given JS library configured by inline params <config> and jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | THREEDQUERY AUTH   |
      | sitereference           | trustthreeds76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_V1_3DS_SDK_NOT_ENROLLED
    And User clicks Pay button
    Then <processing_screen_mode> processing screen is visible
    And the processing screen disappears before notification message appears

    Examples:
      | config                                                         | processing_screen_mode |
      | THREE_DS_SDK_INLINE_PROCESSING_SCREEN_ATTACH_TO_ELEMENT_CONFIG | ATTACH_TO_ELEMENT      |
      | THREE_DS_SDK_POPUP_PROCESSING_SCREEN_ATTACH_TO_ELEMENT_CONFIG  | ATTACH_TO_ELEMENT      |
      | THREE_DS_SDK_INLINE_PROCESSING_SCREEN_OVERLAY_CONFIG           | OVERLAY                |
      | THREE_DS_SDK_POPUP_PROCESSING_SCREEN_OVERLAY_CONFIG            | OVERLAY                |


  Scenario Outline: The <processing_screen_mode> processing screen is visible for payment with v1 non-frictionless card
    Given JS library configured by inline params <config> and jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | THREEDQUERY AUTH   |
      | sitereference           | trustthreeds76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    When User fills payment form with defined card VISA_V1_3DS_SDK_NON_FRICTIONLESS
    And User clicks Pay button
    Then <processing_screen_mode> processing screen is visible
    And the processing screen disappears before challenge v1 appears

    Examples:
      | config                                                         | processing_screen_mode |
      | THREE_DS_SDK_INLINE_PROCESSING_SCREEN_ATTACH_TO_ELEMENT_CONFIG | ATTACH_TO_ELEMENT      |
      | THREE_DS_SDK_POPUP_PROCESSING_SCREEN_ATTACH_TO_ELEMENT_CONFIG  | ATTACH_TO_ELEMENT      |
      | THREE_DS_SDK_INLINE_PROCESSING_SCREEN_OVERLAY_CONFIG           | OVERLAY                |
      | THREE_DS_SDK_POPUP_PROCESSING_SCREEN_OVERLAY_CONFIG            | OVERLAY                |


  Scenario Outline: The <processing_screen_mode> processing screen is visible for payment with v2 frictionless card
    Given JS library configured by inline params <config> and jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | THREEDQUERY AUTH   |
      | sitereference           | trustthreeds76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    When User fills payment form with defined card <card>
    And User clicks Pay button
    Then <processing_screen_mode> processing screen is visible
    And the processing screen disappears before notification message appears

    Examples:
      | config                                                         | processing_screen_mode | card                                       |
      | THREE_DS_SDK_INLINE_PROCESSING_SCREEN_ATTACH_TO_ELEMENT_CONFIG | ATTACH_TO_ELEMENT      | VISA_V21_3DS_SDK_FRICTIONLESS_SUCCESS      |
      | THREE_DS_SDK_POPUP_PROCESSING_SCREEN_ATTACH_TO_ELEMENT_CONFIG  | ATTACH_TO_ELEMENT      | MASTERCARD_V21_3DS_SDK_FRICTIONLESS_FAILED |
      | THREE_DS_SDK_INLINE_PROCESSING_SCREEN_OVERLAY_CONFIG           | OVERLAY                | VISA_V21_3DS_SDK_FRICTIONLESS_SUCCESS      |
      | THREE_DS_SDK_POPUP_PROCESSING_SCREEN_OVERLAY_CONFIG            | OVERLAY                | MASTERCARD_V21_3DS_SDK_FRICTIONLESS_FAILED |


  Scenario Outline: The <processing_screen_mode> processing screen is visible for payment with v2 non-frictionless card
    Given JS library configured by inline params <config> and jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | THREEDQUERY AUTH   |
      | sitereference           | trustthreeds76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    When User fills payment form with defined card VISA_V21_3DS_SDK_NON_FRICTIONLESS
    And User clicks Pay button
    Then <processing_screen_mode> processing screen is visible
    And the processing screen disappears before challenge v2 appears

    Examples:
      | config                                                         | processing_screen_mode |
      | THREE_DS_SDK_INLINE_PROCESSING_SCREEN_ATTACH_TO_ELEMENT_CONFIG | ATTACH_TO_ELEMENT      |
      | THREE_DS_SDK_POPUP_PROCESSING_SCREEN_ATTACH_TO_ELEMENT_CONFIG  | ATTACH_TO_ELEMENT      |
      | THREE_DS_SDK_INLINE_PROCESSING_SCREEN_OVERLAY_CONFIG           | OVERLAY                |
      | THREE_DS_SDK_POPUP_PROCESSING_SCREEN_OVERLAY_CONFIG            | OVERLAY                |


  Scenario Outline: The processing screen is visible by at least 2 seconds for v1 frictionless payment
    Given JS library configured by inline params <config> and jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | THREEDQUERY AUTH   |
      | sitereference           | trustthreeds76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_V1_3DS_SDK_NOT_ENROLLED
    And User clicks Pay button
    Then the processing screen will be display for at least 2 seconds

    Examples:
      | config                                                         |
      | THREE_DS_SDK_INLINE_PROCESSING_SCREEN_ATTACH_TO_ELEMENT_CONFIG |
      | THREE_DS_SDK_POPUP_PROCESSING_SCREEN_ATTACH_TO_ELEMENT_CONFIG  |
      | THREE_DS_SDK_INLINE_PROCESSING_SCREEN_OVERLAY_CONFIG           |
      | THREE_DS_SDK_POPUP_PROCESSING_SCREEN_OVERLAY_CONFIG            |


  Scenario Outline: The processing screen is visible by at least 2 seconds for v1 non-frictionless payment
    Given JS library configured by inline params <config> and jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | THREEDQUERY AUTH   |
      | sitereference           | trustthreeds76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_V1_3DS_SDK_NON_FRICTIONLESS
    And User clicks Pay button
    Then the processing screen will be display for at least 2 seconds

    Examples:
      | config                                                         |
      | THREE_DS_SDK_INLINE_PROCESSING_SCREEN_ATTACH_TO_ELEMENT_CONFIG |
      | THREE_DS_SDK_POPUP_PROCESSING_SCREEN_ATTACH_TO_ELEMENT_CONFIG  |
      | THREE_DS_SDK_INLINE_PROCESSING_SCREEN_OVERLAY_CONFIG           |
      | THREE_DS_SDK_POPUP_PROCESSING_SCREEN_OVERLAY_CONFIG            |


  Scenario Outline: The processing screen is visible by at least 2 seconds for v2 frictionless payment
    Given JS library configured by inline params <config> and jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | THREEDQUERY AUTH   |
      | sitereference           | trustthreeds76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_V21_3DS_SDK_FRICTIONLESS_SUCCESS
    And User clicks Pay button
    Then the processing screen will be display for at least 2 seconds

    Examples:
      | config                                                         |
      | THREE_DS_SDK_INLINE_PROCESSING_SCREEN_ATTACH_TO_ELEMENT_CONFIG |
      | THREE_DS_SDK_POPUP_PROCESSING_SCREEN_ATTACH_TO_ELEMENT_CONFIG  |
      | THREE_DS_SDK_INLINE_PROCESSING_SCREEN_OVERLAY_CONFIG           |
      | THREE_DS_SDK_POPUP_PROCESSING_SCREEN_OVERLAY_CONFIG            |


  Scenario Outline: The processing screen is visible by at least 2 seconds for v2 non-frictionless payment
    Given JS library configured by inline params <config> and jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | THREEDQUERY AUTH   |
      | sitereference           | trustthreeds76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_V22_3DS_SDK_NON_FRICTIONLESS
    And User clicks Pay button
    Then the processing screen will be display for at least 2 seconds

    Examples:
      | config                                                         |
      | THREE_DS_SDK_INLINE_PROCESSING_SCREEN_ATTACH_TO_ELEMENT_CONFIG |
      | THREE_DS_SDK_POPUP_PROCESSING_SCREEN_ATTACH_TO_ELEMENT_CONFIG  |
      | THREE_DS_SDK_INLINE_PROCESSING_SCREEN_OVERLAY_CONFIG           |
      | THREE_DS_SDK_POPUP_PROCESSING_SCREEN_OVERLAY_CONFIG            |
