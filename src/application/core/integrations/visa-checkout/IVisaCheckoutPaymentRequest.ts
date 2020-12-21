export interface IVisaCheckoutPaymentRequest {
  merchantRequestId?: string;
  currencyCode?: string;
  subtotal?: string;
  shippingHandling?: number;
  tax?: number;
  discount?: number;
  giftWrap?: number;
  misc?: number;
  total?: string;
  orderId?: string;
  description?: string;
  promoCode?: string;
  customData?: any;
}
