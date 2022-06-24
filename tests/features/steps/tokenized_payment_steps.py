# type: ignore[no-redef]

from behave import use_step_matcher, step

from pages.page_factory import Pages

use_step_matcher('re')


@step('User fills Tokenized Card payment security code with (?P<security_code>.+)')
def step_impl(context, security_code):
    tokenized_page = context.page_factory.get_page(Pages.TOKENIZED_JWT_MODULE_PAYMENT_PAGE)
    tokenized_page.fill_cvv_input(security_code)


@step('User waits for Tokenized Card payment to be loaded')
def step_impl(context):
    tokenized_page = context.page_factory.get_page(Pages.TOKENIZED_JWT_MODULE_PAYMENT_PAGE)
    tokenized_page.wait_for_form_to_be_loaded()


@step('User clicks Pay button on Tokenized Card payment form')
def step_impl(context):
    tokenized_page = context.page_factory.get_page(Pages.TOKENIZED_JWT_MODULE_PAYMENT_PAGE)
    tokenized_page.click_pay_button()


@step('User clears Tokenized Card pyment security code field')
def step_impl(context):
    tokenized_page = context.page_factory.get_page(Pages.TOKENIZED_JWT_MODULE_PAYMENT_PAGE)
    tokenized_page.clear_security_code_input()


@step('User will see "(?P<placeholder>.+)" placeholder in tokenized payment security code field')
def step_impl(context, placeholder):
    tokenized_page = context.page_factory.get_page(Pages.TOKENIZED_JWT_MODULE_PAYMENT_PAGE)
    tokenized_page.validate_security_code_placeholder(placeholder)
