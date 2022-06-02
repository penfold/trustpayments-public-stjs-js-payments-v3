# type: ignore[no-redef]

from assertpy import assert_that, soft_assertions
from behave import use_step_matcher, step, when, then

from configuration import CONFIGURATION
from pages.locators.visa_ctp_locators import VisaClickToPayLocators
from pages.page_factory import Pages
from utils.enums.card import Card
from utils.enums.shared_dict_keys import SharedDictKey
from utils.helpers.request_executor import add_to_shared_dict
from utils.helpers.resources_reader import get_translation_from_json

use_step_matcher('re')


@step('User fills billing details fields')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.fill_billing_details_form()


@step('User fills delivery details fields')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.fill_delivery_details_form()


@step('User fills VISA_CTP card details with defined card (?P<card>.+)')
def step_impl(context, card: Card):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    card = Card.__members__[card]  # pylint: disable=unsubscriptable-object
    vctp_page.fill_payment_form(card.number, card.expiration_date, card.cvv)


@step('User selects Look up my cards')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.click_look_up_my_cards_btn()


@step('User chooses to register his card with Visa')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.click_register_card_checkbox()


@step('User will see that registering card with VISA_CTP is (?P<param>.+)')
def step_impl(context, param):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    if param == 'unavailable':
        assert_that(vctp_page.is_register_checkbox_available()).is_false()
    if param == 'available':
        assert_that(vctp_page.is_register_checkbox_available()).is_true()


@step('User login to VISA_CTP account with (?P<email_state>.+) e-mail address')
def step_impl(context, email_state):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    email = {
        'valid': CONFIGURATION.VCTP_EMAIL_1,
        'not registered': 'notregistered@testemail.com',
        'invalid format': 'test@123',
        'empty': '',
        'vctp_1': CONFIGURATION.VCTP_EMAIL_1,
        'vctp_2': CONFIGURATION.VCTP_EMAIL_2,
        'vctp_3': CONFIGURATION.VCTP_EMAIL_3,
        'vctp_4': CONFIGURATION.VCTP_EMAIL_4
    }
    add_to_shared_dict(SharedDictKey.VCTP_EMAIL_LOGIN.value, email[email_state])
    vctp_page.fill_email_input(email[email_state])
    vctp_page.click_submit_email_btn()


@step('User fills VISA_CTP one time password')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.get_code_and_fill_otp_field()


@step('User fills (?P<otp>.+) VISA_CTP one time password')
def step_impl(context, otp):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    if otp in 'valid':
        vctp_page.get_code_and_fill_otp_field()
    elif otp in 'incorrect':
        vctp_page.fill_otp_field('111111')
        vctp_page.click_submit_otp_btn()
    elif otp in 'invalid':
        vctp_page.fill_otp_field('123')
        vctp_page.click_submit_otp_btn()


# TODO
@step('User will see that VISA_CTP checkout is (?P<param>.+)')
def step_impl(context, param):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    if param in 'completed':
        vctp_page.check_if_value_is_present_in_logs('dcfActionCode', 'COMPLETE')
        vctp_page.check_if_value_is_present_in_logs('checkoutResponse', 'should not be none')
        # vctp_page.check_if_value_is_present_in_logs('idToken', 'should not be none')
    elif param in 'rejected':
        vctp_page.check_if_value_is_present_in_logs('dcfActionCode', 'ERROR')
    elif param in 'cancelled':
        vctp_page.check_if_value_is_present_in_logs('dcfActionCode', 'CANCEL')
    elif param in 'logout':
        vctp_page.check_if_value_is_present_in_logs('dcfActionCode', 'SWITCH_CONSUMER')


@step('User selects (?P<card>.+) card from cards list view')
def step_impl(context, card):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    card_on_the_list = {
        'first': '1',
        'second': '2',
        'third': '3'
    }
    vctp_page.click_view_all_cards_btn()
    context.pan = vctp_page.get_masked_card_number_from_card_list(card_on_the_list[card])
    vctp_page.select_card_from_cards_list_by_index(card_on_the_list[card])


@step('User selects (?P<card>.+) card from cards list view by number')
def step_impl(context, card):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    card = Card.__members__[card]  # pylint: disable=unsubscriptable-object
    vctp_page.select_card_from_cards_list_by_number(card.number[-4:])


@step('User clicks Add new card button')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.click_add_new_card_btn()


@step('User will see otp validation message "(?P<expected_message>.+)"')
def step_impl(context, expected_message):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    actual_message = vctp_page.get_otp_validation_message()
    assert_that(expected_message).is_equal_to(actual_message)


@step('User will see login validation message "(?P<expected_message>.+)"')
def step_impl(context, expected_message):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    actual_message = vctp_page.get_login_validation_message()
    assert_that(expected_message).is_equal_to(actual_message)


@step('User clears email field')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.clear_email_input()


@step('User clears card details fields')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.clear_card_details_inputs()


@step('User clicks cancel button on otp view')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.click_cancel_otp_button()


@step('User clicks cancel button on login view')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.click_cancel_login_button()


@step('User clicks on Resend code button')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    context.otp_after_first_login = vctp_page.get_last_unseen_otp()
    vctp_page.click_resend_code_button()
    context.otp_after_resend = vctp_page.get_last_unseen_otp()


@step('OTP is sent again to user email')
def step_impl(context):
    assert_that(context.otp_after_first_login).is_equal_to(context.otp_after_resend)


@step('User login to (?P<email_state>.+) account with valid credentials')
def step_impl(context, email_state):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    email = {
        'vctp_1': CONFIGURATION.VCTP_EMAIL_1,
        'vctp_2': CONFIGURATION.VCTP_EMAIL_2,
        'vctp_3': CONFIGURATION.VCTP_EMAIL_3,
        'vctp_4': CONFIGURATION.VCTP_EMAIL_4,
    }
    add_to_shared_dict(SharedDictKey.VCTP_EMAIL_LOGIN.value, email[email_state])
    vctp_page.fill_email_input(email[email_state])
    vctp_page.click_submit_email_btn()
    vctp_page.get_code_and_fill_otp_field()


@step('User reviews VISA_CTP checkout page (?P<register>.+)')
def step_impl(context, register):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    # for registered user
    if register == 'and confirm with remember me':
        vctp_page.click_remember_me_checkbox(True)
        vctp_page.confirm_payment()
        vctp_page.fill_cvv_field_on_visa_popup()
    # for registered user
    elif register == 'and continues payment':
        vctp_page.click_pay_now_btn()
        vctp_page.fill_cvv_field_on_visa_popup()
    # for unregistered user
    elif register == 'and confirm payment':
        vctp_page.click_terms_of_service_checkbox()
        vctp_page.confirm_payment()
        vctp_page.fill_cvv_field_on_visa_popup()
    # for unregistered user
    if register == 'and confirm with remember me option':
        vctp_page.click_terms_of_service_checkbox()
        vctp_page.click_remember_me_checkbox(False)
        vctp_page.confirm_payment()
        vctp_page.fill_cvv_field_on_visa_popup()
    elif register == 'and cancels payment':
        vctp_page.click_cancel_checkout_btn()
    vctp_page.wait_for_visa_popup_to_disappear()


@step('User see that first card on the list is (?P<is_selected>.+)')
def step_impl(context, is_selected):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    context.pan = vctp_page.get_masked_card_number_from_card_list('1')
    if is_selected in 'auto-selected':
        assert_that(vctp_page.is_first_card_auto_selected()).is_true()
    elif is_selected in 'not selected':
        assert_that(vctp_page.is_first_card_auto_selected()).is_false()


@step('User fills card details with defined card (?P<card>.+)')
def step_impl(context, card):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    card = Card.__members__[card]  # pylint: disable=unsubscriptable-object
    context.pan = str(card.number)
    vctp_page.fill_card_details_on_card_list_view(card.number, card.expiration_date, card.cvv)


@step('User fills card details in visa modal with defined card (?P<card>.+)')
def step_impl(context, card):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    card = Card.__members__[card]  # pylint: disable=unsubscriptable-object
    context.pan = str(card.number)
    vctp_page.fill_card_details_in_modal(card.number, card.expiration_date, card.cvv)


@step('User see previously added card in card list')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    masked_card_number = vctp_page.get_masked_card_number_from_card_list('1')
    expected_card_number = context.pan[-4:]
    assert_that(expected_card_number).is_equal_to(masked_card_number)


@step('User will see VISA_CTP card validation message')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    expected_text = get_translation_from_json('en_GB', 'VISA_CTP card validation message')
    vctp_page.is_card_validation_message_visible(expected_text)


@step('User will see previously submitted billing data')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    billing_data = {
        'billingfirstname': vctp_page.get_delivery_address_data_from_visa_dcf('1'),
        'billinglastname': vctp_page.get_delivery_address_data_from_visa_dcf('1'),
        'billingpremise': vctp_page.get_delivery_address_data_from_visa_dcf('2'),
        'billingstreet': vctp_page.get_delivery_address_data_from_visa_dcf('3'),
        'billingtown': vctp_page.get_delivery_address_data_from_visa_dcf('4'),
        'billingtelephone': vctp_page.get_delivery_address_data_from_visa_dcf('5'),
    }
    with soft_assertions():
        for row in context.table:
            assert_that(billing_data[row['key']]).contains(row['value'])


@step('User will not see previously added card in card list')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    expected_card_number = context.pan[-4:]
    vctp_page.wait_until_removed_card_is_not_visible_on_card_list(expected_card_number)
    masked_card_number = vctp_page.get_masked_card_number_from_card_list('1')
    assert_that(expected_card_number).is_not_equal_to(masked_card_number)


@step('User clicks Not you button')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.click_not_you_btn()


@step('User clicks Pay Securely button')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.click_pay_securely_button()


@step('User will see previously selected card on VISA_CTP popup')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    masked_card_number = vctp_page.get_masked_card_number_from_visa_ctp_popup()
    expected_card_number = context.pan[-4:]
    assert_that(expected_card_number).is_equal_to(masked_card_number)


@step('User fills billing address form on Visa checkout popup and (?P<action>.+)')
def step_impl(context, action):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    # for registered user
    if action in 'continues':
        vctp_page.fill_required_address_fields()
    # option for unregistered user
    elif action in 'saves address for delivery':
        vctp_page.click_use_this_address_for_delivery()
        vctp_page.fill_required_address_fields()


# step for unregistered user
@step('User confirms entered address')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.confirm_user_address()


@step('User clicks edit card details')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.click_edit_card_details()


@step('User selects Add New Card on VISA_CTP popup')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.click_card_menu_btn()
    vctp_page.click_add_card_btn()
    vctp_page.wait_for_visa_popup_to_disappear()


@step('User selects Edit card on VISA_CTP popup')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.click_card_menu_btn()
    vctp_page.click_edit_card_details()


@step('User selects Add address on VISA_CTP popup')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.click_address_menu_btn()
    vctp_page.click_add_address_btn()


@step('User clicks Add new address plus button')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.click_add_new_address_plus_btn()


@step('User selects Switch card on VISA_CTP popup')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.click_card_menu_btn()
    vctp_page.click_switch_card_details()
    vctp_page.wait_for_visa_popup_to_disappear()


@step('User is not recognized by VISA_CTP')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    assert_that(vctp_page.is_look_up_my_cards_btn_displayed()).is_true()
    assert_that(vctp_page.is_cards_section_displayed(), 'Cards list is displayed but should not be').is_false()


@step('User selects address for new card')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.click_first_masked_address_on_the_list()
    vctp_page.click_add_new_card_on_vctp_popup()


@step('User changes expiration date, and security code to (?P<expiration_date>.+), (?P<security_code>.+)')
def step_impl(context, expiration_date, security_code):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.edit_expiration_date_and_cvv_on_popup(expiration_date, security_code)
    vctp_page.verify_update_card_success_message()


@step('User selects Switch address on VISA_CTP popup')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.click_address_menu_btn()
    vctp_page.click_switch_address_btn()


@step('User chooses card address from the list of available addresses')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.switch_address_from_list(False)


@step('User removes card from VISA_CTP wallet')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.clik_remove_card()


@step('User selects Delete address on VISA_CTP popup')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.click_address_menu_btn()


@step('User confirms address deletion')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.click_remove_address()
    vctp_page.verify_remove_address_success_message()


# step for unregistered user
@step('User edits address details on VISA_CTP popup')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.click_edit_address_as_unregistered_user()


# step for unregistered user
@step('User updates billing address form')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.update_required_address_fields()


# step for unregistered user
@step('User clicks edit card details on VISA_CTP popup')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.click_edit_card_as_unregistered_user()


# step for unregistered user
@step('User clears VISA_CTP payment from')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.clear_payment_form()


@step('User see that submit button label indicates selected card')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    button_label = vctp_page.get_submit_button_label()
    merchant_submit_label = vctp_page.get_merchant_submit_label()
    assert_that(button_label).contains(context.pan)
    assert_that(merchant_submit_label).is_equal_to('Your visa payment is enabled by Click to Pay')


@step('User see default submit button label')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    button_label = vctp_page.get_submit_button_label()
    merchant_submit_label = vctp_page.get_merchant_submit_label()
    assert_that(button_label).is_equal_to('Pay securely')
    assert_that(merchant_submit_label).is_equal_to('We accept VISA')


@step('User fills phone number field on Visa popup')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.fill_phone_number_field()
    vctp_page.confirm_payment()


@step('User clicks continue on Visa popup')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.confirm_user_address()


@step('User clicks Continue as guest button')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.click_continue_as_guest_btn()


@step('User signs out from VISA_CTP on popup')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.click_sign_out()


@step('User will see labels displayed on VISA_CTP popup translated into "(?P<language>.+)"')
def step_impl(context, language):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    labels = {
        'Visa first name label': VisaClickToPayLocators.first_name_placeholder,
        'Visa last name label': VisaClickToPayLocators.last_name_placeholder,
        'Visa street name label': VisaClickToPayLocators.street_name_placeholder,
        'Visa street number label': VisaClickToPayLocators.street_number_placeholder,
        'Visa e-mail address label': VisaClickToPayLocators.email_address_placeholder,
        'Visa Pay now button': VisaClickToPayLocators.pay_now_btn,
    }
    with soft_assertions():
        for row in context.table:
            vctp_page.validate_visa_ctp_translation(labels[row['fields']], language, row['fields'])


@step('User can open additional information hint')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.click_more_information_hint_button()


@step('User can get acquainted with VISA_CTP details')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.verify_visa_info_popup_elements()
    vctp_page.click_close_more_information_hint()


@step('User confirms email address')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.confirm_user_address()


@step('User will back to login view')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    assert_that(vctp_page.is_email_input_displayed()).is_true()


@step('User waits for callback to disappear')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.wait_for_cancel_callback_to_disappear()


@step('User will not see login view')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    assert_that(vctp_page.is_email_input_displayed()).is_false()


@when('User fills Billing detail form with defined values')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    for row in context.table:
        if row['key'] == 'billingcountry':
            vctp_page.select_billing_address_country(row['value'])
        else:
            vctp_page.fill_specific_field_in_billing_detail_form(row['key'], row['value'])


@then('User will see lack of Card delivery details message on VISA_CTP popup')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    assertion_message = 'Warning message about insufficient card delivery details should be displayed, but is not.'
    assert_that(vctp_page.check_if_delivery_warning_message_is_visible, assertion_message).is_true()


@then('User will see that billing details on VISA_CTP popup are unfilled')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.switch_to_visa_iframe()
    with soft_assertions():
        for row in context.table:
            assert_that(vctp_page.get_field_value_in_address_popup(row['key'])).is_empty()
