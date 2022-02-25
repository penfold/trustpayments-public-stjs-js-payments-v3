# type: ignore[no-redef]

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


@step("User fills VISA_CTP card details with defined card (?P<card>.+)")
def step_impl(context, card: Card):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    card = Card.__members__[card]  # pylint: disable=unsubscriptable-object
    vctp_page.fill_payment_form(card.number, card.expiration_date, card.cvv)


@step('User clicks on "Look up my cards" link')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.click_look_up_my_cards_btn()


@step('User reviews VISA_CTP checkout page')
def step_impl(context):
    raise NotImplementedError(u'STEP: And User reviews check-out page <condition> registering as a new user')


@step('User login to VISA_CTP account with valid e-mail address')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.fill_email_input(EMAIL_LOGIN)
    vctp_page.click_submit_email_btn()


@step('User fills VISA_CTP one time password')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.fill_otp_field_and_check()


@then('User will see that VISA_CTP payment was (?P<param>.+)')
def step_impl(context, param):
    raise NotImplementedError(u'STEP: Then User will see that VISA_CTP payment was <param>')


@step('User selects (?P<string>.+) card on VISA_CTP popup')
def step_impl(context, string):
    raise NotImplementedError(u'STEP: And User selects <string> card on VISA_CTP popup')


@step("User closes VISA_CTP checkout page")
def step_impl(context):
    raise NotImplementedError(u'STEP: And User cancels payment on checkout page')


@step("User chooses to add new card on VISA_CTP popup")
def step_impl(context):
    raise NotImplementedError(u'STEP: And User chooses to add new card on VISA_CTP popup')
