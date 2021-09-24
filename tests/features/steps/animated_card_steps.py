# type: ignore[no-redef]
from assertpy import soft_assertions
from behave import step, then, use_step_matcher

from pages.locators.animated_card_locators import AnimatedCardLocators
from pages.page_factory import Pages

use_step_matcher('re')


@then('User will see card icon connected to card type (?P<card_type>.+)')
def step_impl(context, card_type):
    animated_card_page = context.page_factory.get_page(Pages.ANIMATED_CARD_PAGE)
    animated_card_page.scroll_to_bottom()
    animated_card_page.validate_credit_card_icon(card_type, context.is_field_in_iframe)
    context.card_type = card_type


@step(
    'User will see the same provided data on animated credit card "(?P<formatted_card_number>.+)",'
    ' "(?P<expiration_date>.+)" and "(?P<cvv>.+)"')
def step_impl(context, formatted_card_number, expiration_date, cvv):
    animated_card_page = context.page_factory.get_page(Pages.ANIMATED_CARD_PAGE)
    animated_card_page.validate_all_data_on_animated_card(formatted_card_number, expiration_date, cvv,
                                                          context.card_type, context.is_field_in_iframe)


@step('User will see that animated card is flipped, except for "AMEX"')
def step_impl(context):
    animated_card_page = context.page_factory.get_page(Pages.ANIMATED_CARD_PAGE)
    animated_card_page.validate_if_animated_card_is_flipped(context.card_type, context.is_field_in_iframe)


@then('User will see (?:label|labels) displayed on animated card translated into "(?P<language>.+)"')
def step_impl(context, language):
    animated_card_page = context.page_factory.get_page(Pages.ANIMATED_CARD_PAGE)
    animated_card_page.scroll_to_bottom()
    labels = {
        'Card number': AnimatedCardLocators.card_number_label,
        'Expiration date': AnimatedCardLocators.expiration_date_label,
        'Security code': AnimatedCardLocators.security_code_label,
    }
    with soft_assertions():
        for row in context.table:
            animated_card_page.validate_animated_card_translation(labels[row['fields']], language, row['fields'])
