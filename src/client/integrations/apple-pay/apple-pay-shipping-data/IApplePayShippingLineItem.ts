export interface IApplePayShippingLineItem {
  amount: string;
  label: string;
  type?: 'final' | 'pending';
}
