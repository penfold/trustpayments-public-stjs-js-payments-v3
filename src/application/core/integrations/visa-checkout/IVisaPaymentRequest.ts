export interface IVisaPaymentRequest {
  merchantRequestId?: string;
  currencyCode?: string;
  subtotal?: number;
  shippingHandling?: number;
  tax?: number;
  discount?: number;
  giftWrap?: number;
  misc?: number;
  total?: number;
  orderId?: string;
  description?: string;
  promoCode?: string;
  customData?: any;
}
