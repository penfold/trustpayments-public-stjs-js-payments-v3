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


@step('User will be sent to apm page - (?P<apm_page>.+)')
def step_impl(context, apm_page):
    # Hardcoded url returned by Gateway
    url = {
        'sofort': 'www.sofort.com',
        'simulator': 'r3.girogate.de',
        'zip': 'checkout.sand.gb.zip.co',
        'ATA': 'web-app.sandbox.token.io'
    }
    payment_page = context.page_factory.get_page(Pages.APM_MODULE_PAYMENT_PAGE)
    payment_page.validate_base_url(url[apm_page])
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


@when('User will go through success payment process on sofort page and submit')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.APM_MODULE_PAYMENT_PAGE)
    payment_page.click_accept_cookies_btn_on_sofort_page()
    context.waits.wait_for_javascript()
    payment_page.select_bank_on_sofort_page_by_text('Demo Bank')
    payment_page.click_next_btn_on_sofort_page()
    payment_page.fill_test_credentials_on_sofort_page('test', 'test')
    payment_page.click_next_btn_on_sofort_page()
    payment_page.click_next_btn_on_sofort_page()
    payment_page.fill_confirmation_code_on_sofort_page('123456')
    payment_page.click_next_btn_on_sofort_page()


@when('User will go through error payment process on sofort page and submit')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.APM_MODULE_PAYMENT_PAGE)
    payment_page.click_accept_cookies_btn_on_sofort_page()
    context.waits.wait_for_javascript()
    payment_page.click_cancel_btn_on_sofort_page()
    payment_page.click_cancel_transaction_btn_on_sofort_page()


@when('User will click on (?P<option>.+) button on ZIP example page')
def step_impl(context, option):
    payment_page = context.page_factory.get_page(Pages.APM_MODULE_PAYMENT_PAGE)
    payment_page.click_cancel_btn_on_zip_sandbox_page()


@when('User chooses country and bank on Token page')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.APM_MODULE_PAYMENT_PAGE)
    # payment_page.select_uk_from_country_dropdown()
    payment_page.select_ozone_modelo_bank_from__dropdown()
    payment_page.scroll_to_token_terms_link()
    payment_page.click_accept_button()


@step('User login to bank account with valid credentials')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.APM_MODULE_PAYMENT_PAGE)
    payment_page.fill_login_input('mits')
    payment_page.fill_password_input('mits')
    payment_page.click_login_button()


@step('User confirm payment')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.APM_MODULE_PAYMENT_PAGE)
    payment_page.click_confirm_button()


@step('User cancel payment')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.APM_MODULE_PAYMENT_PAGE)
    payment_page.click_cancel_button()


@step('User fills ZIP phone number field')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.APM_MODULE_PAYMENT_PAGE)
    payment_page.fill_phone_number('7380336237')


@step('User fills ZIP one time password')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.APM_MODULE_PAYMENT_PAGE)
    payment_page.fill_sms_code()


@then('User will be sent to ZIP order summary page')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.APM_MODULE_PAYMENT_PAGE)
    payment_page.accept_terms_and_confirm_payment()
