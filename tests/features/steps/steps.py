from behave import *

from utils.enums.card import Card
from utils.enums.field_type import FieldType

use_step_matcher("re")


@given('"(?P<page_name>.+)" page is open')
def step_impl(context, page_name):
    context.page_factory.get_page(page_name=page_name).open_self_page()


@then('I see an "(?P<page_name>.+)" page')
def step_impl(context, page_name):
    current_url = context.page_factory.get_page(page_name=page_name).get_page_url()
    expected_url = context.test_data.landing_page
    assert expected_url == current_url, \
        f'Invalid page address!\nGiven: {current_url},\nExpected: {expected_url}'


@step('User fills payment form with defined card (?P<card>.+)')
def step_impl(context, card: Card):
    payment_page = context.page_factory.get_page(page_name='payment_methods')
    card = Card.__members__[card]
    context.pan = str(card.number)
    context.exp_date = str(card.expiration_date)
    context.cvv = str(card.cvv)
    if 'e2e_config_for_iframe' in context.scenario.tags:
        payment_page._action.switch_to_iframe(FieldType.PARENT_IFRAME.value)
    payment_page.fill_payment_form(card.number, card.expiration_date, card.cvv)


@when('User fills only security code for saved (?P<card>.+) card')
def step_impl(context, card: Card):
    payment_page = context.page_factory.get_page(page_name='payment_methods')
    card = Card.__members__[card]
    payment_page.fill_payment_form_with_only_cvv(card.cvv)
