Feature: Visual regression - 3ds sdk processing screen

  @visual_regression @scrn_three_ds_processing_screen_inline_overlay
  Scenario: Processing screen - challenge display INLINE, processing screen OVERLAY
    Given JS library configured by inline params THREE_DS_SDK_INLINE_PROCESSING_SCREEN_OVERLAY_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User fills payment form with defined card VISA_V21_3DS_SDK_NON_FRICTIONLESS
    And User clicks Pay button
    Then the processing screen appears
    And Screenshot is taken after 0 seconds and checked

  @visual_regression @scrn_three_ds_processing_screen_popup_overlay
  Scenario: Processing screen - challenge display POPUP, processing screen OVERLAY
    Given JS library configured by inline params THREE_DS_SDK_POPUP_PROCESSING_SCREEN_OVERLAY_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User fills payment form with defined card VISA_V21_3DS_SDK_NON_FRICTIONLESS
    And User clicks Pay button
    Then the processing screen appears
    And Screenshot is taken after 0 seconds and checked

  @visual_regression @scrn_three_ds_processing_screen_inline_attach_to_element
  Scenario: Processing screen - challenge display INLINE, processing screen ATTACH_TO_ELEMENT
    Given JS library configured by inline params THREE_DS_SDK_INLINE_PROCESSING_SCREEN_ATTACH_TO_ELEMENT_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User fills payment form with defined card VISA_V21_3DS_SDK_NON_FRICTIONLESS
    And User clicks Pay button
    Then the processing screen appears
    And Screenshot is taken after 0 seconds and checked

  @visual_regression @scrn_three_ds_processing_screen_popup_attach_to_element
  Scenario: Processing screen - challenge display POPUP, processing screen ATTACH_TO_ELEMENT
    Given JS library configured by inline params THREE_DS_SDK_POPUP_PROCESSING_SCREEN_ATTACH_TO_ELEMENT_CONFIG and jwt BASE_JWT with additional attributes
      | key                     | value            |
      | requesttypedescriptions | THREEDQUERY AUTH |
    And User opens example page
    When User fills payment form with defined card VISA_V21_3DS_SDK_NON_FRICTIONLESS
    And User clicks Pay button
    Then the processing screen appears
    And Screenshot is taken after 0 seconds and checked
