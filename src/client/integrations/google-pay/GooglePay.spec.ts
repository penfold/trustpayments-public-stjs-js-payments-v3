import { of } from 'rxjs';
import { anything, instance, mock, verify, when } from 'ts-mockito';
import { mapTo, tap } from 'rxjs/operators';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { SimpleMessageBus } from '../../../application/core/shared/message-bus/SimpleMessageBus';
import { GooglePayConfigName } from '../../../integrations/google-pay/models/IGooglePayConfig';
import { IConfig } from '../../../shared/model/config/IConfig';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { JwtDecoder } from '../../../shared/services/jwt-decoder/JwtDecoder';
import { SentryService } from '../../../shared/services/sentry/SentryService';
import { IGooglePaySessionPaymentsClient } from '../../../integrations/google-pay/models/IGooglePayPaymentsClient';
import { GooglePaySdkProvider } from './google-pay-sdk-provider/GooglePaySdkProvider';
import { GooglePay } from './GooglePay';
import { googlePayConfigMock } from './GooglePayConfigMock';
import { GooglePayPaymentService } from './GooglePayPaymentService';

describe('GooglePay', () => {
  let sut: GooglePay;
  let configProviderMock: ConfigProvider;
  let googlePayPaymentServiceMock: GooglePayPaymentService;
  let jwtDecoderMock: JwtDecoder;
  let simpleMessageBus: IMessageBus;
  let googlePaySdkProviderMock: GooglePaySdkProvider;
  let sentryServiceMock: SentryService;
  let googlePaySessionPaymentsClientMock: IGooglePaySessionPaymentsClient;

  const configMock: IConfig = {
    jwt: '',
    formId: 'st-form',
    disableNotification: false,
    livestatus: 0,
    datacenterurl: 'https://example.com',
    visaCheckout: null,
    googlePay: googlePayConfigMock,
  };

  beforeEach(() => {
    configProviderMock = mock<ConfigProvider>();
    googlePayPaymentServiceMock = mock(GooglePayPaymentService);
    jwtDecoderMock = mock(JwtDecoder);
    simpleMessageBus = new SimpleMessageBus();
    googlePaySdkProviderMock = mock(GooglePaySdkProvider);
    googlePaySessionPaymentsClientMock = mock<IGooglePaySessionPaymentsClient>();
    when(googlePaySessionPaymentsClientMock.createButton(anything())).thenReturn(document.createElement('button'));
    when(googlePaySessionPaymentsClientMock.isReadyToPay(anything())).thenResolve();
    when(googlePaySessionPaymentsClientMock.loadPaymentData(anything())).thenResolve();
    sentryServiceMock = mock(SentryService);
    when(sentryServiceMock.captureAndReportResourceLoadingTimeout(anything())).thenReturn(source => source);
    when(googlePaySdkProviderMock.setupSdk$(anything())).thenReturn(of(null).pipe(mapTo(instance(googlePaySessionPaymentsClientMock)), tap(console.log)));
    when(configProviderMock.getConfig$()).thenReturn(of(configMock));

    sut = new GooglePay(
      instance(configProviderMock),
      instance(googlePayPaymentServiceMock),
      instance(jwtDecoderMock),
      simpleMessageBus,
      instance(googlePaySdkProviderMock),
      instance(sentryServiceMock),
    );

    simpleMessageBus.publish({
      type: PUBLIC_EVENTS.UPDATE_JWT,
      data: {
        newJwt: '',
      },
    });

    document.body.innerHTML = `
      <div id="st-google-pay">
        <button>GooglePay button mock</button>
      </div>
    `;
  });

  describe('init()', () => {
    it('should add button do DOM based on GooglePay config button options', () => {
      sut.init(configMock).subscribe(() => {
        verify(googlePaySessionPaymentsClientMock.createButton({
          buttonColor: configMock[GooglePayConfigName].buttonOptions.buttonColor,
          buttonType: configMock[GooglePayConfigName].buttonOptions.buttonType,
          buttonLocale: configMock[GooglePayConfigName].buttonOptions.buttonLocale,
          // @ts-ignore
          onClick: sut.onGooglePaymentButtonClicked,
        })).once();
      });
    });
  });
});
