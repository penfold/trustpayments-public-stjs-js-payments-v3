# type: ignore[no-redef]

from behave import use_step_matcher, step

from pages.page_factory import Pages
from utils.enums.auth_data import AuthData

use_step_matcher('re')


@step('User see 3DS Challenge authentication is displayed')
def step_impl(context):
    three_ds_page = context.page_factory.get_page(Pages.THREE_DS_PAGE)
    assert three_ds_page.validate_3ds_challenge_modal_appears()


@step('User fills 3DS Challenge authentication with (?P<code>.+)')
def step_impl(context, code):
    three_ds_page = context.page_factory.get_page(Pages.THREE_DS_PAGE)
    if code == AuthData.THREE_DS_CODE.name:
        three_ds_page.fill_3ds_challenge_modal(AuthData.THREE_DS_CODE.value)
    else:
        three_ds_page.fill_3ds_challenge_modal(AuthData.THREE_DS_INCORRECT_CODE.value)


@step('User clicks Cancel button on 3DS Challenge')
def step_impl(context):
    three_ds_page = context.page_factory.get_page(Pages.THREE_DS_PAGE)
    three_ds_page.cancel_3ds_authentication()
