import { IPaymentResponse } from '../../../../integrations/google-pay/models/IGooglePayPaymentRequest';
import {
  IGooglePayButtonOptions,
  IGooglePaySessionPaymentsClient,
} from '../../../../integrations/google-pay/models/IGooglePayPaymentsClient';

export const paymentResponseMock: IPaymentResponse = {
  apiVersion: 2,
  apiVersionMinor: 0,
  paymentMethodData: {
    description: 'Mastercard •••• 4444',
    info: {
      cardDetails: '4444',
      cardNetwork: 'MASTERCARD',
    },
  },
  tokenizationData: {
    token: 'sometoken',
    type: 'PAYMENT_GATEWAY',
  },
  type: 'CARD',
};

export const googlePaySdkPaymentsClientMock: IGooglePaySessionPaymentsClient = {
  isReadyToPay: () => {
    return Promise.resolve({ result: true });
  },
  loadPaymentData: () => {
    return Promise.resolve(paymentResponseMock);
  },
  createButton: (config: IGooglePayButtonOptions) => {
    const button = document.createElement('button');
    button.id = 'gp-mocked-button';
    button.addEventListener('click', event => {
      event.preventDefault();
      config.onClick();
    });

    return button;
  },
};
