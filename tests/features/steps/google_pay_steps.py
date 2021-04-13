# type: ignore[no-redef]
from behave import step, then, use_step_matcher, when

from pages.page_factory import Pages

use_step_matcher('re')


@when('User clicks on Google Pay button')
def step_impl(context):
    google_pay_page = context.page_factory.get_page(Pages.GOOGLE_PAY_PAGE)
    google_pay_page.click_google_pay_button()
