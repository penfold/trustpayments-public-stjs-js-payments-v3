import { anything, deepEqual, instance, mock, spy, verify, when } from 'ts-mockito';
import { of } from 'rxjs';
import { IAPMConfig } from '../models/IAPMConfig';
import { APMName } from '../models/APMName';
import { DomMethods } from '../../../application/core/shared/dom-methods/DomMethods';
import { IAPMItemConfig } from '../models/IAPMItemConfig';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { APMPaymentMethodName } from '../models/IAPMPaymentMethod';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { IStartPaymentMethod } from '../../../application/core/services/payments/events/IStartPaymentMethod';
import { APMConfigResolver } from '../services/apm-config-resolver/APMConfigResolver';
import { APMFilterService } from '../services/apm-filter-service/APMFilterService';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { SimpleMessageBus } from '../../../application/core/shared/message-bus/SimpleMessageBus';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { GoogleAnalytics } from '../../../application/core/integrations/google-analytics/GoogleAnalytics';
import { GAEventType } from '../../../application/core/integrations/google-analytics/events';
import { APMA2AButtonConfig } from '../models/APMA2AButtonConfig';
import { APMClient } from './APMClient';

describe('APMClient', () => {
  let apmConfigResolver: APMConfigResolver;
  let apmFilterService: APMFilterService;
  let messageBus: IMessageBus;
  let configProviderMock: ConfigProvider;
  let googleAnalyticsMock: GoogleAnalytics;
  let apmClient: APMClient;

  const testConfig: IAPMConfig = {
    placement: 'test-placement',
    successRedirectUrl: 'successUrl',
    cancelRedirectUrl: 'cancelUrl',
    errorRedirectUrl: 'errorUrl',
    apmList: [
      {
        name: APMName.ZIP,
        placement: 'test-placement',
        returnUrl: 'test-url',
      },
      {
        name: APMName.ALIPAY,
        placement: 'test-placement-2',
        returnUrl: 'test-url',
      },
      {
        name: APMName.ACCOUNT2ACCOUNT,
        placement: 'test-placement-3',
        returnUrl: 'test-url',
        button: APMA2AButtonConfig,
      },
    ],
  };

  beforeEach(() => {
    configProviderMock = mock<ConfigProvider>();
    apmConfigResolver = mock(APMConfigResolver);
    apmFilterService = mock(APMFilterService);
    googleAnalyticsMock = mock(GoogleAnalytics);
    messageBus = new SimpleMessageBus();
    when(apmConfigResolver.resolve(anything())).thenReturn(of(testConfig));
    when(configProviderMock.getConfig()).thenReturn({ jwt: '' });
    when(apmFilterService.filter(anything(), anything())).thenReturn(
      of([
        {
          name: APMName.ZIP,
          placement: 'test-placement',
          returnUrl: 'test-url',
        },
        {
          name: APMName.ALIPAY,
          placement: 'test-placement-2',
          returnUrl: 'test-url',
        },
        {
          name: APMName.ACCOUNT2ACCOUNT,
          placement: 'test-placement-3',
          returnUrl: 'test-url',
          button: APMA2AButtonConfig,
        },
      ])
    );
    apmClient = new APMClient(
      instance(apmConfigResolver),
      messageBus,
      instance(apmFilterService),
      instance(configProviderMock),
      instance(googleAnalyticsMock)
    );
    document.body.innerHTML = '<div id="test-placement"></div><div id="test-placement-2"></div><div id="test-placement-3"></div>';
  });

  describe('init()', () => {
    const zipIconEncoded = require('./images/zip.svg');

    it('should generate APM buttons from provided config object and insert each button to its respective container', done => {
      apmClient.init(testConfig).subscribe(() => {
        expect(document.body.innerHTML).toEqual(
          `<div id="test-placement"><div class="st-apm-button"><img src="${zipIconEncoded}" alt="${APMName.ZIP}" id="ST-APM-${APMName.ZIP}" class="st-apm-button__img"></div></div><div id="test-placement-2"><div class="st-apm-button"><img src="${zipIconEncoded}" alt="${APMName.ALIPAY}" id="ST-APM-${APMName.ALIPAY}" class="st-apm-button__img"></div></div><div id="test-placement-3"><div class="st-apm-button"><button class="st-apm-button__button" id="ST-APM-${APMName.ACCOUNT2ACCOUNT}" style="width: ${APMA2AButtonConfig.width}; height: ${APMA2AButtonConfig.height}; background-color: ${APMA2AButtonConfig.backgroundColor}; color: ${APMA2AButtonConfig.textColor};" type="button"><span>${APMA2AButtonConfig.text}</span></button></div></div>`
        );
        done();
      });
    });

    it('should assign click event listener to inserted buttons, that will publish start payment method message, subscribe to apm redirect method and do a redirect', done => {
      const messageBusSpy = spy(messageBus);
      const domMethodsSpy = spy(DomMethods);

      when(domMethodsSpy.redirect(anything())).thenCall(() => {});

      apmClient.init(testConfig).subscribe(() => {
        document.body.querySelectorAll('div.st-apm-button').forEach((insertedAPMButton, index) => {
          const publishedEvent: IMessageBusEvent<IStartPaymentMethod<IAPMItemConfig>> = {
            type: PUBLIC_EVENTS.START_PAYMENT_METHOD,
            data: {
              data: testConfig.apmList[index] as IAPMItemConfig,
              name: APMPaymentMethodName,
            },
          };

          const testRedirectUrl = (testConfig.apmList[index] as IAPMItemConfig).returnUrl;

          insertedAPMButton.dispatchEvent(new Event('click'));

          verify(messageBusSpy.publish(deepEqual(publishedEvent))).times(1);

          messageBus.publish({ type: PUBLIC_EVENTS.APM_REDIRECT, data: testRedirectUrl });

          verify(
            googleAnalyticsMock.sendGaData(
              'event',
              'APM redirect',
              GAEventType.REDIRECT,
              `APM redirect initiated: ${(testConfig.apmList[index] as IAPMItemConfig).name}`
            )
          ).once();
          verify(domMethodsSpy.redirect(testRedirectUrl)).called();
        });
        done();
      });
    });
  });
});
