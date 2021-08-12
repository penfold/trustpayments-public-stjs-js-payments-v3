import { GooglePaySessionPaymentsClientMock } from './GooglePaySessionClientMock';
import { paymentResponseMock } from '../../../client/integrations/google-pay/google-pay-sdk-provider/GooglePaySdkPaymentsClientMock';
import { IGooglePayButtonOptions } from '../../../integrations/google-pay/models/IGooglePayPaymentsClient';

describe('GooglePaySessionPaymentsClientMock', () => {
  let googlePaySessionPaymentsClientMock: GooglePaySessionPaymentsClientMock;

  beforeEach(() => {
    googlePaySessionPaymentsClientMock = new GooglePaySessionPaymentsClientMock();
  });

  describe('isReadyToPay()', () => {
    it('resolves to true', async () => {
      expect(await googlePaySessionPaymentsClientMock.isReadyToPay()).toEqual({ result: true });
    });
  });

  describe('loadPaymentData()', () => {
    it('resolves to payment response mock on successful scenario', async () => {
      googlePaySessionPaymentsClientMock.mockPaymentData('success');

      expect(await googlePaySessionPaymentsClientMock.loadPaymentData()).toBe(paymentResponseMock);
    });

    it('rejects with error status code on failed scenario', async () => {
      expect.assertions(1);

      googlePaySessionPaymentsClientMock.mockPaymentData('error');

      await expect(googlePaySessionPaymentsClientMock.loadPaymentData()).rejects.toEqual({ error: { statusCode: 'ERROR' } });
    });
  });

  describe('createButton()', () => {
    let onClickHandler: () => void;
    let buttonConfig: IGooglePayButtonOptions;

    beforeEach(() => {
      onClickHandler = jest.fn();
      buttonConfig = {
        buttonColor: '',
        buttonType: '',
        buttonLocale: '',
        onClick: onClickHandler,
      }
    });

    it('creates a google pay button', () => {
      const button = googlePaySessionPaymentsClientMock.createButton(buttonConfig);

      expect(button).toBeInstanceOf(HTMLElement)
      expect(button.id).toBe('gp-mocked-button');
    });

    it('attaches a click listener to the button', () => {
      const button = googlePaySessionPaymentsClientMock.createButton(buttonConfig);

      button.click();

      expect(onClickHandler).toHaveBeenCalled();
    });
  });
});
