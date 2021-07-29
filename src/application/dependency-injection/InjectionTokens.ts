import { Token } from 'typedi';
import { IPaymentMethod } from '../core/services/payments/IPaymentMethod';
import { ThreeDProcess } from '../core/services/three-d-verification/ThreeDProcess';

export const PaymentMethodToken = new Token<IPaymentMethod>('payment-method');
export const CPFThreeDProcess = new Token<ThreeDProcess>('cpf-threed-process');
