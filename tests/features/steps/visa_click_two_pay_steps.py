# type: ignore[no-redef]
from behave import step, use_step_matcher

from pages.page_factory import Pages
from utils.enums.card import Card
from utils.enums.visa_checkout_field import VisaCheckoutField

use_step_matcher('re')


@step('User clicks on Visa Click two Pay button')
def step_impl(context):
    visa_click_to_pay_page = context.page_factory.get_page(Pages.VISA_CLICK_TWO_PAY)
    visa_click_to_pay_page.click_visa_click_two_pay_button(context)


@step('User fills Visa Click two Pay email address')
def step_impl(context):
    visa_click_to_pay_page = context.page_factory.get_page(Pages.VISA_CLICK_TWO_PAY)
    visa_click_to_pay_page.send_text_to_alert('securetestpgs2@gmail.com')
    visa_click_to_pay_page.accept_alert()


@step('User fills Visa Click two Pay one time password')
def step_impl(context):
    visa_click_to_pay_page = context.page_factory.get_page(Pages.VISA_CLICK_TWO_PAY)
    otp = visa_click_to_pay_page.get_one_time_password()
    visa_click_to_pay_page.send_text_to_alert(otp)
    visa_click_to_pay_page.accept_alert()


@step('User selects card on Visa Click two Pay popup')
def step_impl(context):
    visa_click_to_pay_page = context.page_factory.get_page(Pages.VISA_CLICK_TWO_PAY)
    visa_click_to_pay_page.send_text_to_alert('1')
    visa_click_to_pay_page.accept_alert()

