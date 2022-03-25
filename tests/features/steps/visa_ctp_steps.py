# type: ignore[no-redef]
import time

from assertpy import assert_that
from behave import use_step_matcher, step, then, when

from pages.page_factory import Pages
from utils.enums.card import Card
from utils.helpers.gmail_service import EMAIL_LOGIN
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


@step("User chooses to register his card with Visa")
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
        'valid': EMAIL_LOGIN,
        'not registered': 'notregistered@testemail.com',
        'invalid format': 'test@123',
        'empty': ''
    }
    vctp_page.fill_email_input(email[email_state])
    vctp_page.click_submit_email_btn()


@step('User fills VISA_CTP one time password')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.fill_otp_field_and_check()


@step('User fills (?P<otp>.+) VISA_CTP one time password')
def step_impl(context, otp):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    if otp in 'valid':
        vctp_page.fill_otp_field_and_check()
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


@step('User selects (?P<card>.+) card from cards list view')
def step_impl(context, card):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    card_on_the_list = {
        'first': '1',
        'second': '2',
        'third': '3'
    }
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


@step('User will see validation message "(?P<expected_message>.+)"')
def step_impl(context, expected_message):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    actual_message = vctp_page.get_validation_message()
    assert_that(expected_message).is_equal_to(actual_message)


@step('User clears email field')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.clear_email_input()


@step('User clears card details fields')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.clear_card_details_inputs()


@step('User cancel payment on login view')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.click_cancel_button()


@step('User clicks on Resend code button')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    context.otp_after_first_login = vctp_page.get_last_unseen_otp()
    vctp_page.click_resend_code_button()
    context.otp_after_resend = vctp_page.get_last_unseen_otp()


@step('OTP is sent again to user email')
def step_impl(context):
    assert_that(context.otp_after_first_login).is_equal_to(context.otp_after_resend)


@step('User login to VISA_CTP account with valid credentials')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.fill_email_input(EMAIL_LOGIN)
    vctp_page.click_submit_email_btn()
    vctp_page.fill_otp_field_and_check()


@step('User reviews VISA_CTP checkout page (?P<register>.+)')
def step_impl(context, register):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    # for registered user
    if register in 'and confirm with remember me':
        vctp_page.click_remember_me_checkbox(True)
        vctp_page.confirm_payment()
    # for registered user
    elif register in 'and continues payment':
        vctp_page.click_pay_now_btn()
    # for unregistered user
    elif register in 'and confirm payment':
        vctp_page.confirm_payment()
    # for unregistered user
    if register in 'and confirm without remember me':
        vctp_page.click_remember_me_checkbox(False)
        vctp_page.confirm_payment()
    elif register in 'and cancels payment':
        vctp_page.click_cancel_checkout_btn()


@step('User see that first card on the list is (?P<is_selected>.+)')
def step_impl(context, is_selected):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    if is_selected in 'auto-selected':
        assert_that(vctp_page.is_first_card_auto_selected()).is_true()
    elif is_selected in 'not selected':
        assert_that(vctp_page.is_first_card_auto_selected()).is_false()


@step('User fills card details with defined card (?P<card>.+)')
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


@step('User will not see previously added card in card list')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    masked_card_number = vctp_page.get_masked_card_number_from_card_list()
    expected_card_number = context.pan[-4:]
    assert_that(expected_card_number).is_not_equal_to(masked_card_number)


@step('User will see VISA_CTP card validation message')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    expected_text = get_translation_from_json('en_GB', 'VISA_CTP card validation message')
    vctp_page.is_card_validation_message_visible(expected_text)


@step("User clicks Not you button")
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


@step('User fills billing address form on Visa checkout popup')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.fill_required_address_fields()
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


@step('User is not recognized by VISA_CTP')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    assert_that(vctp_page.is_cards_section_displayed(), 'Cards list is displayed but should not be').is_false()
    assert_that(vctp_page.is_look_up_my_cards_btn_displayed()).is_true()


@step('User selects address for new card')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.click_first_masked_address_on_the_list()
    vctp_page.click_add_new_card_on_vctp_popup()


@step("User changes expiration date, and security code to (?P<expiration_date>.+), (?P<security_code>.+)")
def step_impl(context, expiration_date, security_code):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.edit_expiration_date_and_cvv_on_popup(expiration_date, security_code)


@when("User selects Switch address on VISA_CTP popup")
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.click_switch_address_btn()


@step("User chooses to (?P<action>.+) on VISA_CTP popup")
def step_impl(context, action):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    if action in 'add card':
        vctp_page.click_add_new_card_on_vctp_popup()
    elif action in 'cancel card editing':
        vctp_page.click_cancel_card_editing_on_popup()
    elif action in 'switch address':
        vctp_page.switch_address_from_list()
    elif action in 'add address':
        vctp_page.click_add_address_on_popup_btn()


@step("User removes card from VISA_CTP wallet")
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.clik_remove_card()
