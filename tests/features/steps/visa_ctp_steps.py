# type: ignore[no-redef]
import time

from assertpy import assert_that
from behave import use_step_matcher, step, then
from pages.page_factory import Pages
from utils.enums.card import Card
from utils.helpers.gmail_service import EMAIL_LOGIN

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
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.check_if_value_is_present_in_logs('ClickToPay', 'PAYMENT INIT COMPLETED')
    vctp_page.click_look_up_my_cards_btn()


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


@step('User will see that VISA_CTP payment was (?P<param>.+)')
def step_impl(context, param):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    is_login_form_displayed = vctp_page.is_login_form_displayed()
    assert_that(is_login_form_displayed).is_false()


@step('User selects (?P<card>.+) card from cards list view')
def step_impl(context, card):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    card_on_the_list = {
        'first': '1',
        'second': '2',
        'third': '3'
    }
    vctp_page.select_card_from_cards_list(card_on_the_list[card])


@step('User clicks Add new card button')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.click_add_new_card_btn()


@step('User chooses to edit (?P<card>.+) details on VISA_CTP popup')
def step_impl(context, card):
    raise NotImplementedError(u'STEP: And User chooses to add new card on VISA_CTP popup')


@step('User fills VISA_CTP billing address')
def step_impl(context):
    raise NotImplementedError(u'STEP: And User fills VISA_CTP billing address')


@step('User will see validation message "(?P<expected_message>.+)"')
def step_impl(context, expected_message):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    actual_message = vctp_page.get_validation_message()
    assert_that(expected_message).is_equal_to(actual_message)


@step('User clears email field')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.clear_email_input()


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
    if register in 'with remembering my choice option':
        pass
    elif register in 'and continues payment':
        pass
    elif register in 'and cancels payment':
        pass
    elif register in 'and unbinds device':
        pass
    raise NotImplementedError(u'STEP: And User reviews check-out page <condition> registering as a new user')


@step('User fills card details with defined card (?P<card>.+)')
def step_impl(context, card):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    card = Card.__members__[card]  # pylint: disable=unsubscriptable-object
    context.pan = str(card.number)
    vctp_page.fill_card_details_in_modal(card.number, card.expiration_date, card.cvv)


@step('User see previously added card in card list')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    masked_card_number = vctp_page.get_masked_card_number_from_card_list()
    expected_card_number = context.pan[-4:]
    assert_that(expected_card_number).is_equal_to(masked_card_number)


@step('User clicks Pay Securely button')
def step_impl(context):
    raise NotImplementedError(u'STEP: And User clicks Pay Securely button')
