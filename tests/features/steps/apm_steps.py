# type: ignore[no-redef]

from behave import use_step_matcher, when
from pages.page_factory import Pages

use_step_matcher('re')


@when('User focuses on ZIP payment method')
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.APM_MODULE_PAYMENT_PAGE)
    payment_page.scroll_to_apms()


@when("User chooses ZIP from APM's list")
def step_impl(context):
    payment_page = context.page_factory.get_page(Pages.APM_MODULE_PAYMENT_PAGE)
    payment_page.select_zip_payment_method()
