# type: ignore[no-redef]
import random
import string
from time import sleep

from behave import step, use_step_matcher, then

from pages.page_factory import Pages
from utils.enums.card import Card
from utils.enums.visa_checkout_field import VisaCheckoutField

use_step_matcher('re')
email_gen = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
USER_DATA = {'name': 'john', 'surname': 'test', 'city': 'Willow Grove', 'address_line_1': 'Willow Grove', 'state': 'PA',
             'zip_code': '19001', 'phone_number': '9343242342', 'email': email_gen + '@gmail.com'}


@step('User clicks on Visa Click two Pay button')
def step_impl(context):
    visa_click_to_pay_page = context.page_factory.get_page(Pages.VISA_CLICK_TWO_PAY)
    visa_click_to_pay_page.click_visa_click_two_pay_button(context)
    sleep(5)
    visa_click_to_pay_page.dismiss_alert()
    sleep(1)
    visa_click_to_pay_page.accept_alert()
    sleep(1)
    visa_click_to_pay_page.accept_alert()
    sleep(1)
    visa_click_to_pay_page.accept_alert()
    sleep(1)
    visa_click_to_pay_page.accept_alert()
    sleep(1)
    visa_click_to_pay_page.accept_alert()
    sleep(5)


@step('User fills Visa Click two Pay required fields')
def step_impl(context):
    visa_click_to_pay_page = context.page_factory.get_page(Pages.VISA_CLICK_TWO_PAY)
    sleep(15)
    visa_click_to_pay_page.fill_required_address_fields(USER_DATA['name'], USER_DATA['surname'],
                                                        USER_DATA['address_line_1'], USER_DATA['city'],
                                                        USER_DATA['state'], USER_DATA['zip_code'],
                                                        USER_DATA['phone_number'], USER_DATA['email'])


@step('User confirms new address at Visa Click two Pay popup')
def step_impl(context):
    visa_click_to_pay_page = context.page_factory.get_page(Pages.VISA_CLICK_TWO_PAY)
    visa_click_to_pay_page.confirm_user_address()


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


@then("User successfully pays with Visa Click two Pay")
def step_impl(context):
    visa_click_to_pay_page = context.page_factory.get_page(Pages.VISA_CLICK_TWO_PAY)
    visa_click_to_pay_page.confirm_payment()
