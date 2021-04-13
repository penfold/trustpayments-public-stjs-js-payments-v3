# type: ignore[no-redef]
from behave import step, then, use_step_matcher, when

from pages.page_factory import Pages

use_step_matcher('re')


@when('User clicks on Google Pay button')
def step_impl(context):
    google_pay_page = context.page_factory.get_page(Pages.GOOGLE_PAY_PAGE)
    google_pay_page.click_google_pay_button()


@step("User fills google account (?P<email>.+) address")
def step_impl(context, email):
    google_pay_page = context.page_factory.get_page(Pages.GOOGLE_PAY_PAGE)
    google_pay_page.fill_email_address_field(email)


@step("User fills google account (?P<password>.+)")
def step_impl(context, password):
    google_pay_page = context.page_factory.get_page(Pages.GOOGLE_PAY_PAGE)
    google_pay_page.fill_password_field(password)


@step("User will see Google Pay login window")
def step_impl(context):
    google_pay_page = context.page_factory.get_page(Pages.GOOGLE_PAY_PAGE)
    assert google_pay_page.validate_new_window_presence()
