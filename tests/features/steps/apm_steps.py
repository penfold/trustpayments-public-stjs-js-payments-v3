# type: ignore[no-redef]
from behave import use_step_matcher, step, when, then
from pages.page_factory import Pages
from utils.enums.shared_dict_keys import SharedDictKey
from utils.helpers.request_executor import add_to_shared_dict

use_step_matcher('re')


@step('User focuses on APM payment methods section')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.APM_MODULE_PAYMENT_PAGE)
    payment_page.scroll_to_apm_list()


@step('User chooses (?P<apm_type>.+) from APM list')
def step_impl(context, apm_type):
    payment_page = context.page_factory.get_page(Pages.APM_MODULE_PAYMENT_PAGE)
    payment_page.click_specific_apm_button(override_placement=False, apm_type=apm_type)


@step('User chooses (?P<apm_type>.+) from APM list - override placement')
def step_impl(context, apm_type):
    payment_page = context.page_factory.get_page(Pages.APM_MODULE_PAYMENT_PAGE)
    payment_page.click_specific_apm_button(override_placement=True, apm_type=apm_type)


@step('User will be sent to apm page - simulator')
def step_impl(context):
    # Hardcoded url returned by Gateway
    url = 'r3.girogate.de'
    payment_page = context.page_factory.get_page(Pages.APM_MODULE_PAYMENT_PAGE)
    payment_page.validate_base_url(url)
    context.waits.wait_for_javascript()


@when('User will select (?P<response_option>.+) response and submit')
def step_impl(context, response_option):
    payment_page = context.page_factory.get_page(Pages.APM_MODULE_PAYMENT_PAGE)
    payment_page.select_simulator_page_response_by_text(response_option)
    payment_page.wait_for_simulator_page_submit_btn_active()
    payment_page.submit_simulator_page_response()


@then('(?P<apm_type>.+) is available on APM list')
def step_impl(context, apm_type):
    assertion_message = f'{apm_type} button is not available but should be'
    payment_page = context.page_factory.get_page(Pages.APM_MODULE_PAYMENT_PAGE)

    add_to_shared_dict(SharedDictKey.ASSERTION_MESSAGE.value, assertion_message)
    assert payment_page.wait_for_specific_apm_payment_method_visibility(apm_type) is True, assertion_message


@then('(?P<apm_type>.+) is not available on APM list')
def step_impl(context, apm_type):
    assertion_message = f'{apm_type} button is available but should not be'
    payment_page = context.page_factory.get_page(Pages.APM_MODULE_PAYMENT_PAGE)

    add_to_shared_dict(SharedDictKey.ASSERTION_MESSAGE.value, assertion_message)
    assert payment_page.wait_for_specific_apm_payment_method_invisibility(apm_type) is True, assertion_message
