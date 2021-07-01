Feature: 3ds SDK library - Processing Screen

  Scenario Outline: The <processing_screen> processing screen is visible after payment with frictionless card
    Given JS library configured by inline params <config> and jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | THREEDQUERY AUTH   |
      | sitereference           | jstrustthreed76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    When User fills payment form with defined card VISA_V21_3DS_SDK_FRICTIONLESS_SUCCESS
    And User clicks Pay button
    Then <processing_screen> processing screen is visible
    And the processing screen disappears before notification message appears

    Examples:
      | config                                                         | processing_screen |
      | THREE_DS_SDK_INLINE_PROCESSING_SCREEN_ATTACH_TO_ELEMENT_CONFIG | ATTACH_TO_ELEMENT |
      | THREE_DS_SDK_POPUP_PROCESSING_SCREEN_ATTACH_TO_ELEMENT_CONFIG  | ATTACH_TO_ELEMENT |
      | THREE_DS_SDK_INLINE_PROCESSING_SCREEN_OVERLAY_CONFIG           | OVERLAY           |
      | THREE_DS_SDK_POPUP_PROCESSING_SCREEN_OVERLAY_CONFIG            | OVERLAY           |

  Scenario Outline: The <processing_screen> processing screen is visible after payment with non-frictionless card
    Given JS library configured by inline params <config> and jwt BASE_JWT with additional attributes
      | key                     | value              |
      | requesttypedescriptions | THREEDQUERY AUTH   |
      | sitereference           | jstrustthreed76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    When User fills payment form with defined card VISA_V21_3DS_SDK_NON_FRICTIONLESS
    And User clicks Pay button
    Then <processing_screen> processing screen is visible
    And the processing screen disappears before confirmation code appears

    Examples:
      | config                                                         | processing_screen |
      | THREE_DS_SDK_INLINE_PROCESSING_SCREEN_ATTACH_TO_ELEMENT_CONFIG | ATTACH_TO_ELEMENT |
      | THREE_DS_SDK_POPUP_PROCESSING_SCREEN_ATTACH_TO_ELEMENT_CONFIG  | ATTACH_TO_ELEMENT |
      | THREE_DS_SDK_INLINE_PROCESSING_SCREEN_OVERLAY_CONFIG           | OVERLAY           |
      | THREE_DS_SDK_POPUP_PROCESSING_SCREEN_OVERLAY_CONFIG            | OVERLAY           |

  Scenario Outline: The processing screen is visible for at least 2 seconds
    Given JS library configured by inline params <config> and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
      | sitereference           | jstrustthreed76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    When User fills payment form with defined card MASTERCARD_FRICTIONLESS
    And User clicks Pay button
    Then the processing screen will be display for at least 2 seconds

    Examples:
      | config                                                         |
      | THREE_DS_SDK_INLINE_PROCESSING_SCREEN_ATTACH_TO_ELEMENT_CONFIG |
      | THREE_DS_SDK_POPUP_PROCESSING_SCREEN_ATTACH_TO_ELEMENT_CONFIG  |
      | THREE_DS_SDK_INLINE_PROCESSING_SCREEN_OVERLAY_CONFIG           |
      | THREE_DS_SDK_POPUP_PROCESSING_SCREEN_OVERLAY_CONFIG            |

  Scenario Outline: The processing screen appears after error payment
    Given JS library configured by inline params <config> and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
      | sitereference           | jstrustthreed76424 |
      | customercountryiso2a    | GB                 |
      | billingcountryiso2a     | GB                 |
    And User opens example page
    When User fills payment form with defined card VISA_V21_3DS_SDK_STEP_UP_AUTH_ERROR
    And User clicks Pay button
    Then <processing_screen> processing screen is visible
    And the processing screen disappears before notification message appears

    Examples:
      | config                                                         | processing_screen |
      | THREE_DS_SDK_INLINE_PROCESSING_SCREEN_ATTACH_TO_ELEMENT_CONFIG | ATTACH_TO_ELEMENT |
      | THREE_DS_SDK_POPUP_PROCESSING_SCREEN_OVERLAY_CONFIG            | OVERLAY           |
