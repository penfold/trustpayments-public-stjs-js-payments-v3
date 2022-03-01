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
    time.sleep(4)
    vctp_page.click_look_up_my_cards_btn()


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

#duplicated method ?
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
    elif otp in 'invalid':
        vctp_page.fill_otp_field('123')


@then('User will see that VISA_CTP payment was (?P<param>.+)')
def step_impl(context, param):
    raise NotImplementedError(u'STEP: Then User will see that VISA_CTP payment was <param>')


@step('User selects (?P<card>.+) card on VISA_CTP popup')
def step_impl(context, card):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.select_existing_card_by_name(card)


@step('User chooses to add new card (?P<card>.+) on VISA_CTP popup')
def step_impl(context, card):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    card = Card.__members__[card]  # pylint: disable=unsubscriptable-object
    context.pan = str(card.number)
    context.exp_date = str(card.expiration_date)
    context.cvv = str(card.cvv)
    vctp_page.add_new_card_in_modal(card.number, card.expiration_date, card.cvv)


@step('User chooses to edit (?P<card>.+) details on VISA_CTP popup')
def step_impl(context, card):
    raise NotImplementedError(u'STEP: And User chooses to add new card on VISA_CTP popup')


@step('User chooses to register his card on VISA_CTP popup')
def step_impl(context):
    raise NotImplementedError(u'STEP: And User chooses to register his card on VISA_CTP popup')


@step('User fills VISA_CTP billing address')
def step_impl(context):
    raise NotImplementedError(u'STEP: And User fills VISA_CTP billing address')


@step('User will see validation message "(?P<expected_message>.+)"')
def step_impl(context, expected_message):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    actual_message = vctp_page.get_validation_message()
    assert_that(expected_message).is_equal_to(actual_message)


@step("User clears email field")
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.clear_email_input()
