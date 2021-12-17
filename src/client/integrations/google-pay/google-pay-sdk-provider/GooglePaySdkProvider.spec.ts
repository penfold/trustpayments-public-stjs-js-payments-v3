import { of } from 'rxjs';
import { DomMethods } from '../../../../application/core/shared/dom-methods/DomMethods';
import { environment } from '../../../../environments/environment';
import { IGooglePaySessionPaymentsClient } from '../../../../integrations/google-pay/models/IGooglePayPaymentsClient';
import { IConfig } from '../../../../shared/model/config/IConfig';
import { googlePayConfigMock } from '../GooglePayConfigMock';
import { googlePaySdkPaymentsClientMock } from './GooglePaySdkPaymentsClientMock';
import { GooglePaySdkProvider } from './GooglePaySdkProvider';
import DoneCallback = jest.DoneCallback;

describe('GooglePaySdkProvider', () => {
  let sut: GooglePaySdkProvider;

  const configMock: IConfig = {
    jwt: '',
    formId: 'st-form',
    disableNotification: false,
    livestatus: 0,
    datacenterurl: 'https://example.com',
    visaCheckout: null,
    googlePay: googlePayConfigMock,
  };

  beforeAll(() => {
    sut = new GooglePaySdkProvider();

    window.google = {
      payments: {
        api: {
          PaymentsClient: jest.fn().mockImplementation(() => {
            return googlePaySdkPaymentsClientMock;
          }),
        },
      },
    };

    DomMethods.insertScript = jest.fn().mockImplementation(() => {
      const buttonWrapper = document.createElement('div');
      buttonWrapper.setAttribute('id', 'st-google-pay');

      return of(document.createElement('script'));
    });
  });

  describe('setupSdk$()', () => {
    it('should insert the script and return Google Pay SDK', (done: DoneCallback) => {
      sut.setupSdk$(configMock).subscribe((googlePaySdk: IGooglePaySessionPaymentsClient) => {
        expect(DomMethods.insertScript).toHaveBeenCalledWith(
          'head',
          { src: environment.GOOGLE_PAY.GOOGLE_PAY_URL }
        );

        expect(googlePaySdk.isReadyToPay(configMock.googlePay.paymentRequest)).toBeDefined();
        expect(googlePaySdk.loadPaymentData).toBeDefined();
        expect(googlePaySdk.createButton).toBeDefined();
        done();
      });
    });
  });
});
