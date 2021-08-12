from enum import Enum


class PaymentType(Enum):
    VISA_CHECKOUT = 'VISACHECKOUT'
    APPLE_PAY = 'APPLEPAY'
    CARDINAL_COMMERCE = 3
    GOOGLE_PAY = 'GOOGLEPAY'
