import { Token } from 'typedi';
import { IPaymentMethod } from '../core/services/payments/IPaymentMethod';

export const PaymentMethodToken = new Token<IPaymentMethod>('payment-method');
