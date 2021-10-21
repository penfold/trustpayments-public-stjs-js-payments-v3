# type: ignore[no-redef]
from behave import use_step_matcher, step, when, then
from pages.page_factory import Pages
from utils.enums.shared_dict_keys import SharedDictKey
from utils.helpers.request_executor import add_to_shared_dict

use_step_matcher('re')


@step('User focuses on APM payment methods section')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.APM_MODULE_PAYMENT_PAGE)
    payment_page.scroll_to_apms()


@step('User chooses ZIP from APMs list')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.APM_MODULE_PAYMENT_PAGE)
    payment_page.click_zip_payment_method()


@step('User chooses PayU from APM list')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.APM_MODULE_PAYMENT_PAGE)
    payment_page.click_payu_payment_method(override_placement=False)


@step('User chooses PayU from APM list - override placement')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.APM_MODULE_PAYMENT_PAGE)
    payment_page.click_payu_payment_method(override_placement=True)


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


@then('PayU is available on APM list')
def step_impl(context):
    assertion_message = 'PayU button is not available but should be'
    payment_page = context.page_factory.get_page(Pages.APM_MODULE_PAYMENT_PAGE)
    payment_page.wait_for_payu_payment_method_visibility()

    add_to_shared_dict(SharedDictKey.ASSERTION_MESSAGE.value, assertion_message)
    assert payment_page.wait_for_payu_payment_method_visibility() is True, assertion_message


@then('PayU is not available on APM list')
def step_impl(context):
    assertion_message = 'PayU button is available but should not be'
    payment_page = context.page_factory.get_page(Pages.APM_MODULE_PAYMENT_PAGE)

    add_to_shared_dict(SharedDictKey.ASSERTION_MESSAGE.value, assertion_message)
    assert payment_page.wait_for_payu_payment_method_invisibility() is True, assertion_message
