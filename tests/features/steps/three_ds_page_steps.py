# type: ignore[no-redef]

import time

from behave import use_step_matcher, step, then

from pages.locators.three_ds_locators import ThreeDSMethodsLocators
from pages.page_factory import Pages
from utils.enums.auth_data import AuthData
from utils.enums.shared_dict_keys import SharedDictKey
from utils.helpers.request_executor import add_to_shared_dict
from utils.helpers.resources_reader import get_translation_from_json

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


@step('User clicks Cancel button on 3ds SDK challenge in INLINE mode')
def step_impl(context):
    three_ds_page = context.page_factory.get_page(Pages.THREE_DS_PAGE)
    three_ds_page.cancel_3ds_inline_challenge()


@step('User clicks Cancel button on 3ds SDK challenge in POPUP mode')
def step_impl(context):
    three_ds_page = context.page_factory.get_page(Pages.THREE_DS_PAGE)
    three_ds_page.cancel_3ds_popup_challenge()


@then('User see 3ds SDK challenge POPUP mode "cancel" button translated into (?P<locale_code>.+)')
def step_impl(context, locale_code):
    expected_translation = get_translation_from_json(locale_code, 'Cancel')
    validate_3ds_popup_challenge_cancel_btn_text(context, expected_translation)


@then('User see 3ds SDK challenge POPUP mode "cancel" button translation is "(?P<expected_translation>.+)"')
def step_impl(context, expected_translation):
    validate_3ds_popup_challenge_cancel_btn_text(context, expected_translation)


def validate_3ds_popup_challenge_cancel_btn_text(context, expected_translation):
    three_ds_page = context.page_factory.get_page(Pages.THREE_DS_PAGE)
    actual_translation = three_ds_page.get_3ds_popup_challenge_cancel_btn_text()
    assertion_message = f'Cancel button text is not correct: ' \
                        f' should be {expected_translation} but is {actual_translation}'
    add_to_shared_dict(SharedDictKey.ASSERTION_MESSAGE.value, assertion_message)
    assert actual_translation == expected_translation, assertion_message


@step('(?P<processing_screen>.+) processing screen is visible')
def step_impl(context, processing_screen):
    three_ds_page = context.page_factory.get_page(Pages.THREE_DS_PAGE)

    processing_screen_elements = {
        'ATTACH_TO_ELEMENT': {
            'processing_screen': ThreeDSMethodsLocators.processing_screen_attach_to_element,
            'logo': ThreeDSMethodsLocators.processing_screen_attach_to_element_logo,
            'loader': ThreeDSMethodsLocators.processing_screen_attach_to_element_loader
        },
        'OVERLAY': {
            'processing_screen': ThreeDSMethodsLocators.processing_screen_overlay,
            'logo': ThreeDSMethodsLocators.processing_screen_overlay_logo,
            'loader': ThreeDSMethodsLocators.processing_screen_overlay_loader,
        }
    }

    for element in processing_screen_elements[processing_screen].values():
        three_ds_page.wait_for_processing_screen_element(element)


@step('the processing screen disappears before (?P<element>.+) appears')
def step_impl(context, element):
    three_ds_page = context.page_factory.get_page(Pages.THREE_DS_PAGE)
    three_ds_page.check_if_processing_screen_disappears_before_element_appears(element)


@step('the processing screen will be display for at least 2 seconds')
def step_impl(context):
    three_ds_page = context.page_factory.get_page(Pages.THREE_DS_PAGE)
    time.sleep(1.9)
    three_ds_page.processing_screen_is_displayed()


@step('the processing screen appears')
def step_impl(context):
    three_ds_page = context.page_factory.get_page(Pages.THREE_DS_PAGE)
    three_ds_page.wait_for_processing_screen()
