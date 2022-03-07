# type: ignore[no-redef]

from behave import use_step_matcher, step, then

from pages.page_factory import Pages
from utils.enums.auth_data import AuthData
from utils.enums.shared_dict_keys import SharedDictKey
from utils.helpers.request_executor import add_to_shared_dict
from utils.helpers.resources_reader import get_translation_from_json

use_step_matcher('re')


# Cardinal Commerce


@step('User see (?P<auth_type>.+) authentication modal is displayed')
def step_impl(context, auth_type):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.validate_cardinal_authentication_modal_appears(auth_type)


@step('User focus on the acs (?P<auth_type>.+) popup element')
def step_impl(context, auth_type):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.focus_on_authentication_label(auth_type)


@step('User fills (?P<auth_type>.+) authentication modal')
def step_impl(context, auth_type):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    if 'parent_iframe' in context.scenario.tags:
        payment_page._actions.switch_to_default_iframe()
    payment_page.fill_cardinal_authentication_code(auth_type)
    if 'parent_iframe' in context.scenario.tags:
        payment_page.switch_to_example_page_parent_iframe()


@step('User clicks Cancel button on authentication modal')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.PAYMENT_METHODS_PAGE)
    payment_page.click_cardinal_cancel_btn()


# Trust payments


@step('User see 3ds SDK challenge is displayed')
def step_impl(context):
    three_ds_page = context.page_factory.get_page(Pages.THREE_DS_PAGE)
    three_ds_page.verify_3ds_challenge_modal_appears()


@step('User see 3ds SDK challenge for v1 is displayed')
def step_impl(context):
    three_ds_page = context.page_factory.get_page(Pages.THREE_DS_PAGE)
    three_ds_page.verify_3ds_v1_challenge_modal_appears()


@step('User fills 3ds SDK v1 challenge with (?P<code>.+) and submit')
def step_impl(context, code):
    three_ds_page = context.page_factory.get_page(Pages.THREE_DS_PAGE)
    three_ds_page.fill_3ds_v1_challenge_modal_and_submit(AuthData[code].value)


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


@then('User see challenge modal error message "(?P<expected_alert_text>.+)"')
def step_impl(context, expected_alert_text):
    three_ds_page = context.page_factory.get_page(Pages.THREE_DS_PAGE)
    actual_alert_text = three_ds_page.get_3ds_challenge_modal_alert_text()
    assertion_message = f'Challenge modal alert text is not correct: ' \
                        f' should be "{expected_alert_text}" but is "{actual_alert_text}"'
    add_to_shared_dict(SharedDictKey.ASSERTION_MESSAGE.value, assertion_message)
    assert actual_alert_text == expected_alert_text, assertion_message


@step('(?P<processing_screen_mode>.+) processing screen is visible')
def step_impl(context, processing_screen_mode):
    three_ds_page = context.page_factory.get_page(Pages.THREE_DS_PAGE)
    three_ds_page.wait_for_processing_screen_elements(processing_screen_mode)


@step('the processing screen disappears before (?P<element>.+) appears')
def step_impl(context, element):
    three_ds_page = context.page_factory.get_page(Pages.THREE_DS_PAGE)
    three_ds_page.verify_if_processing_screen_disappears_before_element_appears(element)


@step('the processing screen will be display for at least 2 seconds')
def step_impl(context):
    three_ds_page = context.page_factory.get_page(Pages.THREE_DS_PAGE)
    three_ds_page.verify_if_processing_screen_is_displayed_at_least_2_seconds()


def validate_3ds_popup_challenge_cancel_btn_text(context, expected_translation):
    three_ds_page = context.page_factory.get_page(Pages.THREE_DS_PAGE)
    actual_translation = three_ds_page.get_3ds_popup_challenge_cancel_btn_text()
    assertion_message = f'Cancel button text is not correct: ' \
                        f' should be "{expected_translation}" but is "{actual_translation}"'
    add_to_shared_dict(SharedDictKey.ASSERTION_MESSAGE.value, assertion_message)
    assert actual_translation == expected_translation, assertion_message
