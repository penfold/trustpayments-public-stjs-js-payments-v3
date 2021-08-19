# type: ignore[no-redef]
import time

from assertpy import soft_assertions
from behave import use_step_matcher, step, when, then

from pages.page_factory import Pages
from utils.enums.field_type import FieldType
from utils.enums.payment_type import PaymentType
from utils.enums.responses.invalid_field_response import InvalidFieldResponse
from utils.mock_handler import stub_st_request_type
from utils.waits import Waits

use_step_matcher('re')


@when(
    'User fills payment form with credit card number "(?P<card_number>.+)", expiration date "(?P<exp_date>.+)" and cvv "(?P<cvv>.+)"')
def step_impl(context, card_number, exp_date, cvv):
    context.pan = card_number
    context.exp_date = exp_date
    context.cvv = cvv
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.fill_payment_form(card_number, exp_date, cvv)


@step('User will see payment status information: "(?P<payment_status_message>.+)"')
def step_impl(context, payment_status_message):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    if 'switch_to_parent_iframe' in context.scenario.tags:
        payment_page.switch_to_example_page_parent_iframe()
    payment_page.wait_for_notification_frame()
    payment_page.validate_payment_status_message(payment_status_message)


@step('User waits for timeout payment')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.wait_for_notification_frame_with_timeout(Waits.OVER_GATEWAY_TIMEOUT)


@step('User waits for payment status to disappear')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    if 'switch_to_parent_iframe' in context.scenario.tags:
        payment_page.switch_to_example_page_parent_iframe()
    payment_page.wait_for_notification_frame_to_disappear()


@step('User waits for whole form to be loaded')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.wait_for_payment_form_inputs_to_load_with_refresh_page()


@step('User waits for whole form to be displayed')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.wait_for_payment_form_inputs_to_display()


@step('User will see that notification frame has "(?P<color>.+)" color')
def step_impl(context, color):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.validate_notification_frame_color(color)


@step('User waits for Pay button to be active')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.wait_for_pay_button_to_be_active()


@step('User waits to be sent into page with url "(?P<url>.+)" after gateway timeout')
def step_impl(context, url):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.wait_for_url_with_timeout(url, Waits.OVER_GATEWAY_TIMEOUT)


@step('User clicks Pay button')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.choose_payment_methods(PaymentType.CARDINAL_COMMERCE.name)


@step('User clicks Additional button')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.click_additional_btn()


@step('User toggle action buttons bar')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.toggle_action_buttons_bar()


@step('User clicks cancel 3ds action button')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.click_cancel_3ds_btn()


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


@step('User accept success alert')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.accept_alert()


@step('User will see that all fields are highlighted')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.validate_if_field_is_highlighted(FieldType.CARD_NUMBER.name)
    payment_page.validate_if_field_is_highlighted(FieldType.EXPIRATION_DATE.name)
    payment_page.validate_if_field_is_highlighted(FieldType.SECURITY_CODE.name)


@when(
    'User fills payment form with incorrect or missing data: card number "(?P<card_number>.+)",'
    ' expiration date "(?P<exp_date>.+)" and cvv "(?P<cvv>.+)"')
def step_impl(context, card_number, exp_date, cvv):
    context.pan = card_number
    context.exp_date = exp_date
    context.cvv = cvv
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.fill_payment_form(card_number, exp_date, cvv)


@step('User will see that "(?P<field>.+)" field is highlighted')
def step_impl(context, field):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.validate_if_field_is_highlighted(FieldType[field].name)


@step('InvalidField response set for "(?P<field>.+)"')
def step_impl(context, field):
    stub_st_request_type(InvalidFieldResponse[field].value, 'THREEDQUERY, AUTH')


@when('User chooses (?P<payment_method>.+) as payment method')
def step_impl(context, payment_method):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.choose_payment_methods(PaymentType[payment_method].name)


@then('User will see that Submit button is "(?P<form_status>.+)"')
def step_impl(context, form_status):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.validate_form_status(FieldType.SUBMIT_BUTTON.name, form_status)


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


@when('User fills "(?P<field>.+)" field "(?P<value>.+)"')
def step_impl(context, field, value):
    context.cvv = value
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.fill_credit_card_field(FieldType[field].name, value)


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
        payment_page.validate_css_style(FieldType.NOTIFICATION_FRAME.name, 'background-color', '100, 149, 237')


@then('User will see all labels displayed on page translated into "(?P<language>.+)"')
def step_impl(context, language):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.validate_all_labels_translation(language)


@then('User will see card payment label displayed on page translated into "(?P<text>.+)"')
def step_impl(context, text):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.validate_card_number_iframe_element_text(text)


@step('User will see validation message "(?P<key>.+)" under all fields translated into "(?P<language>.+)"')
def step_impl(context, key, language):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.validate_field_validation_message_translation(FieldType.CARD_NUMBER.name, language, key)
    payment_page.validate_field_validation_message_translation(FieldType.EXPIRATION_DATE.name, language, key)
    payment_page.validate_field_validation_message_translation(FieldType.SECURITY_CODE.name, language, key)


@then(
    'User will see validation message "(?P<key>.+)" under "(?P<field>.+)" field translated into (?P<language>.+)')
def step_validation_msg_translation(context, key, field, language):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.validate_field_validation_message_translation(FieldType[field].name, language, key)


@then('User will see validation message "(?P<expected_message>.+)" under all fields')
def step_impl(context, expected_message):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.validate_field_validation_message(FieldType.CARD_NUMBER.name, expected_message)
    payment_page.validate_field_validation_message(FieldType.EXPIRATION_DATE.name, expected_message)
    payment_page.validate_field_validation_message(FieldType.SECURITY_CODE.name, expected_message)


@step('User will see "(?P<expected_message>.+)" message under field: "(?P<field>.+)"')
def step_validation_msg_translation_expected(context, expected_message, field):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.validate_field_validation_message(FieldType[field].name, expected_message)


@then('User will see that Pay button is translated into "(?P<expected_value>.+)"')
def step_impl(context, expected_value):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.validate_submit_btn_specific_translation(expected_value)


@then('User will see "(?P<key>.+)" payment status translated into "(?P<language>.+)"')
def step_impl(context, key, language):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.validate_payment_status_translation(language, key)


@when('User fills payment form with credit card number "(?P<card_number>.+)", expiration date "(?P<exp_date>.+)"')
def step_impl(context, card_number, exp_date):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    context.pan = str(card_number)
    context.exp_date = str(exp_date)
    context.cvv = str('')
    payment_page.fill_payment_form_without_cvv(card_number, exp_date)


@step('User calls updateJWT function by filling amount field')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.fill_amount_field('1')


@step('User will see "(?P<callback_popup>.+)" popup')
def step_impl(context, callback_popup):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.validate_if_callback_popup_is_displayed(callback_popup)


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


@then('User will see (?P<placeholders>.+) placeholders in input fields: (?P<card>.+), (?P<date>.+), (?P<cvv>.+)')
def step_impl(context, placeholders, card, date, cvv):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.validate_placeholders(card, date, cvv)


@then('User will see "(?P<placeholder>.+)" placeholder in security code field')
def step_impl(context, placeholder):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.validate_placeholder(FieldType.SECURITY_CODE.name, placeholder)


@then('User will see "(?P<card_type>.+)" icon in card number input field')
def step_impl(context, card_type):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.validate_credit_card_icon_in_input_field(card_type)


@step('User replaces value of the card number field to "(?P<new_card_number>.+)"')
def step_impl(context, new_card_number: str):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.clear_card_number_field()
    payment_page.fill_credit_card_field(FieldType.CARD_NUMBER.name, new_card_number)


@then('User will not see following callback types')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    with soft_assertions():
        for row in context.table:
            payment_page.validate_if_callback_popup_is_not_displayed(row['callback_type'])


@then('User will not see notification frame')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.validate_if_field_is_not_displayed(FieldType.NOTIFICATION_FRAME.name)


@step('User fills merchant data with name "(?P<name>.+)", email "(?P<email>.+)", phone "(?P<phone>.+)"')
def step_impl(context, name, email, phone):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.fill_merchant_form(name, email, phone)


@then('User will not see (?P<field_type>.+)')
def step_impl(context, field_type):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.validate_if_field_is_not_displayed(FieldType[field_type].name)


@step('User press ENTER button in input field')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.press_enter_button_on_security_code_field()


@step('User see (?P<auth_type>.+) authentication modal is displayed')
def step_impl(context, auth_type):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.validate_cardinal_authentication_modal_appears(auth_type)


@step('User fills (?P<auth_type>.+) authentication modal')
def step_impl(context, auth_type):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    if 'parent_iframe' in context.scenario.tags:
        payment_page._actions.switch_to_default_iframe()
    payment_page.fill_cardinal_authentication_code(auth_type)
    if 'parent_iframe' in context.scenario.tags:
        payment_page.switch_to_example_page_parent_iframe()


@step('User will see the same provided data in inputs fields')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.validate_value_of_input_field(FieldType.CARD_NUMBER.name, '4000 0000 0000 1091')
    payment_page.validate_value_of_input_field(FieldType.EXPIRATION_DATE.name, context.exp_date)
    payment_page.validate_value_of_input_field(FieldType.SECURITY_CODE.name, context.cvv)


@step('User will see correct error code displayed in popup')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.validate_callback_with_data_type('Error code: OK')


@step('"(?P<callback_popup>.+)" callback is called only once')
def step_impl(context, callback_popup):
    # sleep added to handle potential issue with update callback counters after initial check count
    time.sleep(1)
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.validate_number_in_callback_counter_popup(callback_popup, '1')


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


@then('User will see that (?P<field_type>.+) field has (?P<rgb_color>.+) color')
def step_impl(context, field_type, rgb_color):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.validate_css_style(FieldType[field_type].name, 'background-color', rgb_color)


@step('Wait for notification frame')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.wait_for_notification_frame()


@step('Wait for popups to disappear')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.wait_for_popups_to_disappear()


@then('User will see that browser is marked as supported: "(?P<is_supported>.+)"')
def step_impl(context, is_supported):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    # ToDo - clarify if High Sierra should be removed from the pipeline (Safari 11 - not supported)
    # skipping assertion on mobile devices, as browserstack doesn't allow to set up latest version of browser
    if 'High Sierra' not in context.configuration.REMOTE_OS_VERSION and not context.configuration.REMOTE_DEVICE:
        payment_page.validate_if_browser_is_supported_in_info_callback(is_supported)


@then('User will see that operating system is marked as supported: "(?P<is_supported>.+)"')
def step_impl(context, is_supported):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.validate_if_os_is_supported_in_info_callback(is_supported)


@step('Wait for notification frame to disappear')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.wait_for_notification_frame_to_disappear()


@step('User focuses on "(?P<field_type>.+)" field')
def step_impl(context, field_type):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.change_field_focus(FieldType[field_type].name)


@step('User clicks Cancel button on authentication modal')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.click_cardinal_cancel_btn()


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
