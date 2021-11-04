import { anything, deepEqual, instance, mock, spy, verify, when } from 'ts-mockito';
import { APMConfigResolver } from '../services/apm-config-resolver/APMConfigResolver';
import { APMClient } from './APMClient';
import { IAPMConfig } from '../models/IAPMConfig';
import { APMName } from '../models/APMName';
import { DomMethods } from '../../../application/core/shared/dom-methods/DomMethods';
import { IAPMItemConfig } from '../models/IAPMItemConfig';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { APMPaymentMethodName } from '../models/IAPMPaymentMethod';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { IStartPaymentMethod } from '../../../application/core/services/payments/events/IStartPaymentMethod';
import { of } from 'rxjs';
import { APMFilterService } from '../services/apm-filter-service/APMFilterService';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { SimpleMessageBus } from '../../../application/core/shared/message-bus/SimpleMessageBus';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';

describe('APMClient', () => {
  let apmConfigResolver: APMConfigResolver;
  let apmFilterService: APMFilterService;
  let messageBus: IMessageBus;
  let configProviderMock: ConfigProvider;
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
    ],
  };

  beforeEach(() => {
    configProviderMock = mock<ConfigProvider>();
    apmConfigResolver = mock(APMConfigResolver);
    apmFilterService = mock(APMFilterService);
    messageBus = new SimpleMessageBus();
    when(apmConfigResolver.resolve(anything())).thenReturn(of(testConfig));
    when(configProviderMock.getConfig$()).thenReturn(of({ jwt: '' }));
    when(apmFilterService.filter(anything(), anything())).thenReturn(of([{
      name: APMName.ZIP,
      placement: 'test-placement',
      returnUrl: 'test-url',
    }, {
      name: APMName.ALIPAY,
      placement: 'test-placement-2',
      returnUrl: 'test-url',
    },
    ]));
    apmClient = new APMClient(instance(apmConfigResolver), messageBus, instance(apmFilterService), instance(configProviderMock));
    document.body.innerHTML = '<div id="test-placement"></div><div id="test-placement-2"></div>';
  });

  describe('init()', () => {
    const zipIconEncoded = require('./images/zip.svg');

    it('should generate APM buttons from provided config object and insert each button to its respective container',
      (done) => {
        apmClient.init(testConfig).subscribe(() => {
          expect(document.body.innerHTML.replace(/"/g, '\''))
            .toEqual(`<div id='test-placement'><div class='st-apm-button'><img src='${zipIconEncoded}' alt='${APMName.ZIP}' id='${APMName.ZIP}' class='st-apm-button__img'></div></div><div id='test-placement-2'><div class='st-apm-button'><img src='${zipIconEncoded}' alt='${APMName.ALIPAY}' id='${APMName.ALIPAY}' class='st-apm-button__img'></div></div>`);
          done();
        });
      });

    it('should assign click event listener to inserted buttons, that will publish start payment method message, subscribe to apm redirect method and do a redirect', (done) => {
      const messageBusSpy = spy(messageBus);
      const domMethodsSpy = spy(DomMethods);

      apmClient.init(testConfig).subscribe(() => {
        document.body.querySelectorAll('div.st-apm-button')
          .forEach((insertedAPMButton, index) => {
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

            verify(domMethodsSpy.redirect(testRedirectUrl)).called();
          });
        done();
      });
    });
  });
});
