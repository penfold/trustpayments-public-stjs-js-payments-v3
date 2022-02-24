# type: ignore[no-redef]
from behave import use_step_matcher, step, then

from pages.page_factory import Pages
from utils.enums.card import Card

use_step_matcher('re')


@step('User fills billing details fields')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.fill_billing_details_form()


@step("User fills VISA_CTP card details with defined card (?P<card>.+)")
def step_impl(context, card: Card):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    card = Card.__members__[card]  # pylint: disable=unsubscriptable-object
    context.pan = str(card.number)
    context.exp_date = str(card.expiration_date)
    context.cvv = str(card.cvv)
    payment_page.fill_payment_form(card.number, card.expiration_date, card.cvv)
    raise NotImplementedError(u'User fills VISA_CTP card details with defined card:')


@step('User reviews VISA_CTP checkout page (?P<register>.+)')
def step_impl(context, register):
    if register in "with registering as new user":
        pass
    elif register in "and continues payment":
        pass
    elif register in "and cancels payment":
        pass
    raise NotImplementedError(u'STEP: And User reviews check-out page <condition> registering as a new user')


@step('User fills VISA_CTP one time password')
def step_impl(context):
    raise NotImplementedError(u'STEP: And User fills VISA_CTP one time password')


@then('User will see that VISA_CTP payment was (?P<param>.+)')
def step_impl(context, param):
    raise NotImplementedError(u'STEP: Then User will see that VISA_CTP payment was <param>')


@step('User selects (?P<string>.+) card on VISA_CTP popup')
def step_impl(context, string):
    raise NotImplementedError(u'STEP: And User selects <string> card on VISA_CTP popup')


@step('User login to VISA_CTP account with valid e-mail address')
def step_impl(context):
    raise NotImplementedError(u'STEP: And User login to VISA_CTP account with valid e-mail address')


@step("User chooses to add new card on VISA_CTP popup")
def step_impl(context):
    raise NotImplementedError(u'STEP: And User chooses to add new card on VISA_CTP popup')
