# type: ignore[no-redef]
from behave import step, then, use_step_matcher

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


@then('User will see that labels displayed on animated card are translated into "(?P<language>.+)"')
def step_impl(context, language):
    animated_card_page = context.page_factory.get_page(Pages.ANIMATED_CARD_PAGE)
    animated_card_page.scroll_to_bottom()
    animated_card_page.validate_animated_card_translation(language)
