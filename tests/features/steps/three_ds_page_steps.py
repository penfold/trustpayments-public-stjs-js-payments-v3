# type: ignore[no-redef]

from behave import use_step_matcher, step, then

from pages.page_factory import Pages
from utils.enums.auth_data import AuthData

use_step_matcher('re')


@step('User see 3ds SDK challenge is displayed')
def step_impl(context):
    three_ds_page = context.page_factory.get_page(Pages.THREE_DS_PAGE)
    three_ds_page.verify_3ds_challenge_modal_appears()


@step('User fills 3ds SDK challenge with (?P<code>.+) and submit')
def step_impl(context, code):
    three_ds_page = context.page_factory.get_page(Pages.THREE_DS_PAGE)
    if code == AuthData.THREE_DS_CODE.name:
        three_ds_page.fill_3ds_challenge_modal_and_submit(AuthData.THREE_DS_CODE.value)
    else:
        three_ds_page.fill_3ds_challenge_modal_and_submit(AuthData.THREE_DS_INCORRECT_CODE.value)


@step('User clicks Cancel button on 3ds SDK challenge')
def step_impl(context):
    three_ds_page = context.page_factory.get_page(Pages.THREE_DS_PAGE)
    three_ds_page.cancel_3ds_challenge()


@then('User see 3ds SDK challenge \'cancel\' button translated into (?P<locale_code>.+)')
def step_impl(context, locale_code):
    three_ds_page = context.page_factory.get_page(Pages.THREE_DS_PAGE)
    three_ds_page.validate_3ds_challenge_cancel_btn_translation_locale(locale_code)


@then('User see 3ds SDK challenge \'cancel\' button translation is "(?P<config_translation>.+)"')
def step_impl(context, config_translation):
    three_ds_page = context.page_factory.get_page(Pages.THREE_DS_PAGE)
    three_ds_page.validate_3ds_challenge_cancel_btn_translation(config_translation)
