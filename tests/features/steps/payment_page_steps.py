# type: ignore[no-redef]
import time

from assertpy import soft_assertions
from behave import use_step_matcher, step, when, then

from pages.page_factory import Pages
from pages.payment_methods_page import format_card_number
from utils.enums.card import Card
from utils.enums.field_type import FieldType
from utils.helpers.resources_reader import get_translation_from_json
from utils.waits import Waits

use_step_matcher('re')


@step('User focuses on the page title')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.change_focus_to_page_title()


@step('User waits for whole form to be displayed')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.wait_for_payment_form_inputs_to_display()


@then('User will see that application is not fully loaded')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.validate_if_field_is_not_displayed(FieldType.CARD_NUMBER.name)
    payment_page.validate_if_field_is_not_displayed(FieldType.EXPIRATION_DATE.name)
    payment_page.validate_if_field_is_not_displayed(FieldType.SECURITY_CODE.name)


@step('User will see that (?P<field_type>.+) iframe is (?P<not_available>not )?available')
def step_impl(context, field_type, not_available):
    expected = False
    if not_available is None:
        expected = True
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.validate_iframe_is_available_in_page_source(field_type, expected)


# Form inputs


@step('User waits for form inputs to be loaded')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.wait_for_payment_form_inputs_to_load_with_refresh_page()


@when(
    'User fills payment form with credit card number "(?P<card_number>.+)", expiration date "(?P<exp_date>.+)" and cvv "(?P<cvv>.+)"')
def step_impl(context, card_number, exp_date, cvv):
    context.pan = card_number
    context.exp_date = exp_date
    context.cvv = cvv
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.fill_payment_form(card_number, exp_date, cvv)


@step('User fills payment form with defined card (?P<card>.+)')
def fill_payment_form_with_defined_card(context, card: Card):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    card = Card.__members__[card]  # pylint: disable=unsubscriptable-object
    context.pan = str(card.number)
    context.exp_date = str(card.expiration_date)
    context.cvv = str(card.cvv)
    payment_page.fill_payment_form(card.number, card.expiration_date, card.cvv)


@step('User fills only security code for saved (?P<card>.+) card')
def step_impl(context, card: Card):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    card = Card.__members__[card]  # pylint: disable=unsubscriptable-object
    payment_page.fill_payment_form_with_only_cvv(card.cvv)


@step('User re-fills payment form with defined card (?P<card>.+)')
def step_impl(context, card: Card):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.clear_card_number_field()
    fill_payment_form_with_defined_card(context, card)


@step('User re-fill value of the card number field to "(?P<new_card_number>.+)"')
def step_impl(context, new_card_number: str):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.clear_card_number_field()
    payment_page.fill_credit_card_field(FieldType.CARD_NUMBER.name, new_card_number)


@when('User fills "(?P<field>.+)" field "(?P<value>.+)"')
def step_impl(context, field, value):
    context.cvv = value
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.fill_credit_card_field(FieldType[field].name, value)


@step('User will see that all fields are highlighted')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    with soft_assertions():
        payment_page.validate_if_field_is_highlighted(FieldType.CARD_NUMBER.name)
        payment_page.validate_if_field_is_highlighted(FieldType.EXPIRATION_DATE.name)
        payment_page.validate_if_field_is_highlighted(FieldType.SECURITY_CODE.name)


@step('User will see that "(?P<field>.+)" field is highlighted')
def step_impl(context, field):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.validate_if_field_is_highlighted(FieldType[field].name)


@then('User will see that "(?P<field>.+)" field has correct style')
def step_impl(context, field):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    if field == FieldType.CARD_NUMBER.name:
        payment_page.validate_css_style(FieldType.CARD_NUMBER.name, 'background-color', '100, 149, 237')
    elif field == FieldType.EXPIRATION_DATE.name:
        payment_page.validate_css_style(FieldType.EXPIRATION_DATE.name, 'background-color', '143, 188, 143')
    elif field == FieldType.SECURITY_CODE.name:
        payment_page.validate_css_style(FieldType.SECURITY_CODE.name, 'background-color', '255, 243, 51')
    if field == FieldType.NOTIFICATION_FRAME.name:
        payment_page.validate_css_style(FieldType.NOTIFICATION_FRAME.name, 'background-color', '248,208,219')


@step('User will see that (?P<field>.+) input (?:field is|fields are) "(?P<form_status>.+)"')
def step_impl(context, field: FieldType, form_status):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    field = FieldType.__members__[field]  # pylint: disable=unsubscriptable-object
    if field.name == 'ALL':
        payment_page.validate_form_status(FieldType.SECURITY_CODE.name, form_status)
        payment_page.validate_form_status(FieldType.CARD_NUMBER.name, form_status)
        payment_page.validate_form_status(FieldType.EXPIRATION_DATE.name, form_status)
    else:
        payment_page.validate_form_status(field.name, form_status)


@then('User will see (?P<field_name>.+) label text is "(?P<text>.+)"')
def step_impl(context, field_name, text):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    fields = {
        'card number': payment_page.validate_card_number_iframe_element_text,
        'expiration date': payment_page.validate_expiration_date_iframe_element_text,
        'security code': payment_page.validate_security_code_iframe_element_text
    }
    fields[field_name](text)


@then('User will see validation message "(?P<expected_message>.+)" under all fields')
def step_impl(context, expected_message):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    with soft_assertions():
        payment_page.validate_field_validation_message(FieldType.CARD_NUMBER.name, expected_message)
        payment_page.validate_field_validation_message(FieldType.EXPIRATION_DATE.name, expected_message)
        payment_page.validate_field_validation_message(FieldType.SECURITY_CODE.name, expected_message)


@step('User will see "(?P<expected_message>.+)" message under field: "(?P<field>.+)"')
def step_validation_msg_translation_expected(context, expected_message, field):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.validate_field_validation_message(FieldType[field].name, expected_message)


@step('User will see validation message "(?P<translation_key>.+)" under all fields translated into "(?P<language>.+)"')
def step_impl(context, translation_key, language):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    expected_text = get_translation_from_json(language, translation_key)
    with soft_assertions():
        payment_page.validate_field_validation_message(FieldType.CARD_NUMBER.name, expected_text)
        payment_page.validate_field_validation_message(FieldType.EXPIRATION_DATE.name, expected_text)
        payment_page.validate_field_validation_message(FieldType.SECURITY_CODE.name, expected_text)


@then('User will see validation message "(?P<key>.+)" under "(?P<field>.+)" field translated into (?P<language>.+)')
def step_validation_msg_translation(context, key, field, language):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    expected_text = get_translation_from_json(language, key)
    payment_page.validate_field_validation_message(FieldType[field].name, expected_text)


@then('User will see (?P<placeholders>.+) placeholders in input fields: (?P<card>.+), (?P<date>.+), (?P<cvv>.+)')
def step_impl(context, placeholders, card, date, cvv):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    with soft_assertions():
        payment_page.validate_placeholder(FieldType.CARD_NUMBER.name, card)
        payment_page.validate_placeholder(FieldType.EXPIRATION_DATE.name, date)
        payment_page.validate_placeholder(FieldType.SECURITY_CODE.name, cvv)


@then('User will see "(?P<placeholder>.+)" placeholder in security code field')
def step_impl(context, placeholder):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.validate_placeholder(FieldType.SECURITY_CODE.name, placeholder)


@then('User will see "(?P<card_type>.+)" icon in card number input field')
def step_impl(context, card_type):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.validate_credit_card_icon_in_input_field(card_type)


@then('User will not see form field (?P<field_type>.+)')
def step_impl(context, field_type):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.validate_if_field_is_not_displayed(FieldType[field_type].name)


@step('User press ENTER button in input field')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.press_enter_button_on_security_code_field()


@step('User will see the same provided data in inputs fields')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    formatted_card_number = format_card_number(context.pan)
    with soft_assertions():
        payment_page.validate_value_of_input_field(FieldType.CARD_NUMBER.name, formatted_card_number)
        payment_page.validate_value_of_input_field(FieldType.EXPIRATION_DATE.name, context.exp_date)
        payment_page.validate_value_of_input_field(FieldType.SECURITY_CODE.name, context.cvv)


@step('User focuses on "(?P<field_type>.+)" field')
def step_impl(context, field_type):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.change_field_focus(FieldType[field_type].name)


@step('User clears security code field')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.clear_security_code_field()


@step('User clears form')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.clear_security_code_field()
    payment_page.clear_card_number_field()
    payment_page.clear_expiry_date_field()


# Pay button


@step('User waits for Pay button to be active')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.wait_for_pay_button_to_be_active()


@step('User waits for additional Submit button to be active')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.wait_for_additional_submit_button_to_be_active()


@step('User clicks Pay button')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.click_submit_btn()


@then('User will see that Pay button text is "(?P<expected_value>.+)"')
def step_impl(context, expected_value):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.validate_submit_btn_specific_translation(expected_value)


@then('User will see (?:label|labels) displayed on page translated into "(?P<language>.+)"')
def step_impl(context, language):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    labels = {
        'Card number': payment_page.validate_card_number_iframe_element_text,
        'Expiration date': payment_page.validate_expiration_date_iframe_element_text,
        'Expiration date placeholder': payment_page.validate_expiration_date_placeholder_text,
        'Security code': payment_page.validate_security_code_iframe_element_text,
        'Pay': payment_page.validate_submit_btn_specific_translation
    }
    with soft_assertions():
        for row in context.table:
            labels[row['fields']](get_translation_from_json(language, row['fields']))


@step('User will see that Pay button is "(?P<form_status>.+)"')
def step_impl(context, form_status):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.validate_form_status(FieldType.SUBMIT_BUTTON.name, form_status)


@step('User will see that additional Submit button is "(?P<form_status>.+)"')
def step_impl(context, form_status):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.validate_form_status(FieldType.ADDITIONAL_SUBMIT_BUTTON.name, form_status)


@step('User waits for timeout payment')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.wait_for_notification_frame_with_timeout(Waits.OVER_GATEWAY_TIMEOUT)


@step('User clicks Additional button')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.click_additional_btn()


# Payment notification


@step('Wait for notification frame')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.wait_for_notification_frame()


@step('User waits for notification frame to disappear')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.wait_for_notification_frame_to_disappear()


@then('User will not see notification frame')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.validate_if_field_is_not_displayed(FieldType.NOTIFICATION_FRAME.name)


@step('User will see notification frame text: "(?P<expected_text>.+)"')
def step_impl(context, expected_text):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    if 'switch_to_parent_iframe' in context.scenario.tags:
        payment_page.switch_to_example_page_parent_iframe()
    payment_page.wait_for_notification_frame()
    payment_page.validate_payment_status_message(expected_text)


@then('User will see payment notification text: "(?P<translation_key>.+)" translated into "(?P<language>.+)"')
def step_impl(context, translation_key, language):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.wait_for_notification_frame()
    expected_text = get_translation_from_json(language, translation_key)
    payment_page.validate_payment_status_message(expected_text)


@step('User will see that notification frame has "(?P<color>.+)" color')
def step_impl(context, color):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.validate_notification_frame_color(color)


# Action buttons


@step('User toggle action buttons bar')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.toggle_action_buttons_bar()


@step('User clicks Remove frames action button')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.click_remove_frames_btn()


@step('User clicks Destroy ST action button')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.click_destroy_st_btn()


@step('User clicks Start ST action button')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.click_start_st_btn()


@step('User clicks cancel 3ds action button')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.click_cancel_3ds_btn()


# Example page utils


@step('User calls updateJWT function by filling amount field')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.fill_amount_field('1')


@step('Wait for popups to disappear')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.wait_for_popups_to_disappear()


@step('User will see "(?P<callback_popup>.+)" popup')
def step_impl(context, callback_popup):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.validate_if_callback_popup_is_displayed(callback_popup)


@then('User will see following logs')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    for row in context.table:
        payment_page.check_if_value_is_present_in_logs(row['name'], row['step'])


@step('User will see correct error code displayed in popup')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.validate_callback_with_data_type('Error code: OK')


@step('"(?P<callback_popup>.+)" callback is called only once in second payment')
def step_impl(context, callback_popup):
    time.sleep(1)
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    # Expected callback number should be 1 but first callback is from previous payment so together is 2
    payment_page.validate_number_in_callback_counter_popup(callback_popup, '2')


@step('User will see following callback type called only once')
def step_impl(context):
    time.sleep(1)
    # sleep added to handle potential issue with update callback counters after initial check count
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    with soft_assertions():
        for row in context.table:
            payment_page.validate_number_in_callback_counter_popup(row['callback_type'], '1')


@step('submit callback contains JWT response')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.validate_jwt_response_in_callback()


@step('submit callback contains THREEDRESPONSE: (?P<threedresponse_defined>.+)')
def step_impl(context, threedresponse_defined):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.validate_threedresponse_in_callback(threedresponse_defined)


@step('THREEDRESPONSE contains paramaters')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    with soft_assertions():
        for param in context.table:
            payment_page.validate_threedresponse_values(param['key'], param['value'])


@step('User fills merchant data with name "(?P<name>.+)", email "(?P<email>.+)", phone "(?P<phone>.+)"')
def step_impl(context, name, email, phone):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.fill_merchant_form(name, email, phone)


@then('User will see that browser is marked as supported: "(?P<is_supported>.+)"')
def step_impl(context, is_supported):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    if not context.configuration.REMOTE_DEVICE:
        payment_page.validate_if_browser_is_supported_in_info_callback(is_supported)


@then('User will see that operating system is marked as supported: "(?P<is_supported>.+)"')
def step_impl(context, is_supported):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.validate_if_os_is_supported_in_info_callback(is_supported)


@step('User clicks (?P<button_type>.+) button on ApplePay popup')
def step_impl(context, button_type):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    if button_type == 'Proceed':
        payment_page.click_proceed_btn_on_apple_pay_popup()
    elif button_type == 'Cancel':
        payment_page.click_cancel_btn_on_apple_pay_popup()
