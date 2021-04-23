import { of } from 'rxjs';
import { anything, instance, mock, when } from 'ts-mockito';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { IConfig } from '../../../shared/model/config/IConfig';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { JwtDecoder } from '../../../shared/services/jwt-decoder/JwtDecoder';
import { googlePaySdkPaymentsClientMock } from './google-pay-sdk-provider/GooglePaySdkPaymentsClientMock';
import { GooglePaySdkProvider } from './google-pay-sdk-provider/GooglePaySdkProvider';
import { GooglePay } from './GooglePay';
import { googlePayConfigMock } from './GooglePayConfigMock';
import { GooglePayPaymentService } from './GooglePayPaymentService';

describe('GooglePay', () => {
  let sut: GooglePay;
  let configProviderMock: ConfigProvider;
  let googlePayPaymentServiceMock: GooglePayPaymentService;
  let jwtDecoderMock: JwtDecoder;
  let messageBusMock: IMessageBus;
  let googlePaySdkProviderMock: GooglePaySdkProvider;

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
    configProviderMock = mock<ConfigProvider>();
    googlePayPaymentServiceMock = mock(GooglePayPaymentService);
    jwtDecoderMock = mock(JwtDecoder);
    messageBusMock = mock<IMessageBus>();
    googlePaySdkProviderMock = mock(GooglePaySdkProvider);

    sut = new GooglePay(
      instance(configProviderMock),
      instance(googlePayPaymentServiceMock),
      instance(jwtDecoderMock),
      instance(messageBusMock),
      instance(googlePaySdkProviderMock),
    );

    when(googlePaySdkProviderMock.setupSdk$(anything())).thenReturn(of(googlePaySdkPaymentsClientMock));
    when(configProviderMock.getConfig$()).thenReturn(of(configMock));
  });

  describe('init()', () => {
    it('should add button do DOM based on Google Pay config button options', () => {
      sut.init(configMock);

      expect(1).toBe(2);
    });
  });
});
