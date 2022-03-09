# type: ignore[no-redef]
from behave import use_step_matcher, step

from pages.page_factory import Pages

use_step_matcher('re')


@step('User fills billing details fields')
def step_impl(context):
    vctp_page = context.page_factory.get_page(Pages.VISA_CTP_PAGE)
    vctp_page.fill_billing_details_form()
