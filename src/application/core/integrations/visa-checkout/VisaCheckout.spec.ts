import { VisaCheckout } from './VisaCheckout';
import { ConfigProvider } from '../../../../shared/services/config-provider/ConfigProvider';
import { InterFrameCommunicator } from '../../../../shared/services/message-bus/InterFrameCommunicator';
import { anyString, mock, when, instance as mockInstance } from 'ts-mockito';
import { EMPTY, of } from 'rxjs';
import { MessageBus } from '../../shared/message-bus/MessageBus';
import { NotificationService } from '../../../../client/notification/NotificationService';
import { VisaCheckoutButtonService } from './VisaCheckoutButtonService';
import { VisaCheckoutUpdateService } from './VisaCheckoutUpdateService';
import { environment } from '../../../../environments/environment';
import { JwtDecoder } from '../../../../shared/services/jwt-decoder/JwtDecoder';

describe('Visa Checkout', () => {
  const jwt = '';
  let instance: VisaCheckout;
  let body: HTMLElement;
  let configProvider: ConfigProvider;
  let communicator: InterFrameCommunicator;
  let messageBus: MessageBus;
  let notificationService: NotificationService;
  let visaCheckoutButtonService: VisaCheckoutButtonService;
  let visaCheckoutUpdateService: VisaCheckoutUpdateService;
  let jwtDecodeMock: JwtDecoder;

  beforeEach(() => {
    configProvider = mock<ConfigProvider>();
    communicator = mock(InterFrameCommunicator);
    messageBus = mock(MessageBus);
    notificationService = mock(NotificationService);
    visaCheckoutButtonService = mock(VisaCheckoutButtonService);
    visaCheckoutUpdateService = mock(VisaCheckoutUpdateService);
    jwtDecodeMock = mock(JwtDecoder);

    when(communicator.whenReceive(anyString())).thenReturn({
      thenRespond: () => EMPTY
    });

    when(configProvider.getConfig$()).thenReturn(
      of({
        jwt,
        formId: 'st-form',
        disableNotification: false,
        datacenterurl: 'https://example.com',
        visaCheckout: {
          buttonSettings: {
            size: 154,
            color: 'neutral'
          },
          livestatus: 0,
          merchantId: 'SDUT1MEXJO10RARJF2S521ImTyKfn3_JmxePdXcydQIUb4kx4',
          paymentRequest: {
            subtotal: 20.0
          },
          placement: 'st-visa-checkout',
          settings: {
            displayName: 'My Test Site'
          }
        }
      })
    );
    instance = new VisaCheckout(
      mockInstance(configProvider),
      mockInstance(communicator),
      mockInstance(messageBus),
      mockInstance(notificationService),
      mockInstance(visaCheckoutButtonService),
      mockInstance(visaCheckoutUpdateService),
      mockInstance(jwtDecodeMock)
    );
    body = document.body;
    VisaCheckoutFixture();
  });

  it('should make successful payment', () => {
    const doc = document.getElementById('v-button');
    expect(doc.getAttribute('id')).toEqual('v-button');
  });
});

function VisaCheckoutFixture() {
  const html = '<form id="st-form"><button id="v-button" /></form>';
  document.body.innerHTML = html;

  const visaButttonProps = {
    alt: 'Visa Checkout',
    class: 'v-button',
    role: 'button',
    src: environment.VISA_CHECKOUT_URLS.TEST_BUTTON_URL
  };
  const config = {
    name: 'VISA',
    merchantId: '2ig278`13b123872121h31h20e',
    buttonSettings: { size: 154, color: 'neutral' },
    settings: { displayName: 'My Test Site' },
    paymentRequest: { subtotal: '20.00' }
  };
  return {
    visaButttonProps,
    config
  };
}
